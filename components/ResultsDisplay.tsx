// ResultsDisplay — the Rate flow's report card, in the funky light theme.
// Hero (shareable via ViewShot) + expandable detail sections + actions.
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import Colors, { getLevelColor, getTierColor } from '../constants/Colors';
import { spacing, borderRadius, typography, softShadow } from '../constants/Styles';
import { PopButton, OutlineButton } from './ui';
import { AnalysisResult, TierLevel } from '../types';

interface ResultsDisplayProps {
  imageUri: string;
  result: AnalysisResult;
  onNewScan: () => void;
}

const tierLabel = (tier: TierLevel): string =>
  tier === 'strong' ? 'Strong' : tier === 'solid' ? 'Solid' : 'Growing';

// Simple light expandable section.
function Section({
  icon,
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  icon: string;
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSummary} numberOfLines={1}>
            {summary}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.text.tertiary} />
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function ResultsDisplay({ imageUri, result, onNewScan }: ResultsDisplayProps) {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your results' });
        } else {
          await Share.share({ message: 'Check out FadeCheck — plan your next haircut! 💈' });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Could not share. Please try again.');
    }
  };

  const levelColor = result.overall_level ? getLevelColor(result.overall_level) : Colors.text.secondary;
  const tiers = result.scores
    ? ([
        ['Lineup', result.scores.lineup],
        ['Fade', result.scores.fade],
        ['Blend', result.scores.blend],
        ['Shape', result.scores.shape],
        ['Fresh', result.scores.freshness],
      ] as const)
    : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Shareable hero */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={styles.shotWrap}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <Image source={{ uri: imageUri }} style={styles.heroImage} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.heroKicker}>YOUR CUT IS</Text>
                <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                  <Text style={styles.levelText}>{result.overall_level ?? '—'}</Text>
                </View>
              </View>
            </View>

            {!!result.verdict && <Text style={styles.verdict}>“{result.verdict}”</Text>}

            {tiers.length > 0 && (
              <View style={styles.tierRow}>
                {tiers.map(([label, tier]) => (
                  <View key={label} style={styles.tierChip}>
                    <View style={[styles.tierDot, { backgroundColor: getTierColor(tier) }]} />
                    <Text style={styles.tierValue}>{tierLabel(tier)}</Text>
                    <Text style={styles.tierLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            )}

            {result.maintenance && (
              <View style={styles.touchupRow}>
                <Ionicons name="calendar-outline" size={14} color={Colors.pop.purpleInk} />
                <Text style={styles.touchupText}>
                  Next touch-up in {result.maintenance.days_until_touchup}
                </Text>
              </View>
            )}

            <View style={styles.heroBrand}>
              <Ionicons name="cut" size={12} color={Colors.text.tertiary} />
              <Text style={styles.heroBrandText}>fadecheck</Text>
            </View>
          </View>
        </ViewShot>

        {/* Quick pills */}
        <View style={styles.pills}>
          {result.hair_profile && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>🧬 {result.hair_profile.hair_type_name}</Text>
            </View>
          )}
          {result.fade_details && result.fade_details.fade_type !== 'none' && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>✂️ {result.fade_details.fade_type_name}</Text>
            </View>
          )}
        </View>

        {/* Detail sections */}
        <Section icon="📋" title="Coach's Notes" summary="Your detailed feedback" defaultOpen>
          <Text style={styles.bodyText}>{result.breakdown}</Text>
        </Section>

        {result.areas_to_improve && result.areas_to_improve.length > 0 && (
          <View style={styles.levelUp}>
            <Text style={styles.levelUpTitle}>🚀 Level up next visit</Text>
            {result.areas_to_improve.map((tip, i) => (
              <View key={i} style={styles.levelUpRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.pop.limeInk} />
                <Text style={styles.levelUpText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {result.hair_profile && (
          <Section icon="🧬" title="Hair Profile" summary={result.hair_profile.hair_type_name}>
            <Text style={styles.bodyText}>{result.hair_profile.hair_type_description}</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Density</Text>
              <View style={styles.densityBars}>
                {['thin', 'medium', 'thick'].map((level, i) => {
                  const filled =
                    (result.hair_profile?.density === 'thin' && i === 0) ||
                    (result.hair_profile?.density === 'medium' && i <= 1) ||
                    result.hair_profile?.density === 'thick';
                  return (
                    <View
                      key={level}
                      style={[styles.densityBar, { backgroundColor: filled ? Colors.pop.purple : '#E7DECB' }]}
                    />
                  );
                })}
                <Text style={styles.statValue}>
                  {result.hair_profile.density.charAt(0).toUpperCase() + result.hair_profile.density.slice(1)}
                </Text>
              </View>
            </View>
          </Section>
        )}

        {result.face_analysis && (
          <Section icon="💡" title="Style Ideas For You" summary="Personalized recommendations">
            <Text style={styles.bodyText}>{result.face_analysis.style_recommendation}</Text>
          </Section>
        )}

        {result.fade_details && result.fade_details.fade_type !== 'none' && (
          <Section icon="✂️" title="Fade Analysis" summary={result.fade_details.fade_type_name}>
            <Text style={styles.bodyText}>{result.fade_details.fade_description}</Text>
          </Section>
        )}

        {result.maintenance && (
          <Section icon="📅" title="Maintenance" summary={result.maintenance.days_until_touchup}>
            <View style={styles.maintRow}>
              <View style={styles.maintCard}>
                <Ionicons name="calendar-outline" size={20} color={Colors.pop.coral} />
                <Text style={styles.maintValue}>{result.maintenance.days_until_touchup}</Text>
                <Text style={styles.maintLabel}>Next visit</Text>
              </View>
              <View style={styles.maintCard}>
                <Ionicons name="repeat-outline" size={20} color={Colors.pop.coral} />
                <Text style={styles.maintValue}>{result.maintenance.maintenance_schedule}</Text>
                <Text style={styles.maintLabel}>Schedule</Text>
              </View>
            </View>
            <Text style={styles.bodyText}>{result.maintenance.maintenance_tip}</Text>
          </Section>
        )}

        {result.product_recommendations && result.product_recommendations.length > 0 && (
          <Section icon="💈" title="Recommended Products" summary={result.product_recommendations[0].product_type}>
            {result.product_recommendations.map((product, index) => (
              <View key={index} style={styles.productRow}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.pop.teal} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{product.product_type}</Text>
                  <Text style={styles.productWhy}>{product.why}</Text>
                </View>
              </View>
            ))}
          </Section>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <OutlineButton label="Share" icon="share-outline" onPress={handleShare} style={{ flex: 1 }} />
        <PopButton
          label="New Scan"
          icon="camera-outline"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNewScan();
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scrollContent: { padding: spacing.lg, paddingBottom: 120 },
  shotWrap: { backgroundColor: Colors.background.primary },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.ink,
    padding: spacing.md,
    ...softShadow,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroImage: {
    width: 84,
    height: 84,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: Colors.background.primary,
  },
  heroKicker: { ...typography.label, marginBottom: 6 },
  levelBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  levelText: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  verdict: {
    ...typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: spacing.md,
  },
  tierRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'center' },
  tierChip: {
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 62,
  },
  tierDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  tierValue: { fontSize: 13, fontWeight: '800', color: Colors.ink },
  tierLabel: { fontSize: 10, fontWeight: '700', color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  touchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: 'rgba(122,92,255,0.10)',
    borderRadius: borderRadius.full,
    paddingVertical: 6,
  },
  touchupText: { fontSize: 13, fontWeight: '700', color: Colors.pop.purpleInk },
  heroBrand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: spacing.sm },
  heroBrandText: { fontSize: 11, fontWeight: '800', color: Colors.text.tertiary, letterSpacing: 0.5 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  pill: {
    backgroundColor: Colors.pop.yellow,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  pillText: { fontSize: 13, fontWeight: '800', color: Colors.ink },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.ink,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  sectionIcon: { fontSize: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.ink },
  sectionSummary: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary, marginTop: 1 },
  sectionBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  bodyText: { ...typography.body, fontSize: 15, lineHeight: 22, color: Colors.text.primary },
  levelUp: {
    backgroundColor: Colors.pop.lime,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.ink,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  levelUpTitle: { fontSize: 15, fontWeight: '800', color: Colors.pop.limeInk },
  levelUpRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  levelUpText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20, color: Colors.pop.limeInk },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  statLabel: { fontSize: 13, fontWeight: '700', color: Colors.text.secondary },
  densityBars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  densityBar: { width: 18, height: 8, borderRadius: 4 },
  statValue: { fontSize: 13, fontWeight: '800', color: Colors.ink, marginLeft: 6 },
  maintRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  maintCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: spacing.md,
  },
  maintValue: { fontSize: 14, fontWeight: '800', color: Colors.ink, textAlign: 'center' },
  maintLabel: { fontSize: 11, fontWeight: '700', color: Colors.text.tertiary, textTransform: 'uppercase' },
  productRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  productName: { fontSize: 15, fontWeight: '800', color: Colors.ink },
  productWhy: { fontSize: 13, fontWeight: '600', lineHeight: 19, color: Colors.text.secondary, marginTop: 2 },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(251,243,228,0.96)',
    borderTopWidth: 2,
    borderTopColor: Colors.ink,
  },
});
