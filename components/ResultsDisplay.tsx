import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import Colors, { getScoreColor, getScoreLabel } from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Styles';
import { AnalysisResult } from '../types';
import ScoreCard from './ScoreCard';
import ImprovementTips from './ImprovementTips';
import InsightBadges from './InsightBadges';
import ExpandableCard from './ExpandableCard';

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';

interface ResultsDisplayProps {
  imageUri: string;
  result: AnalysisResult;
  onRateAnother: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ResultsDisplay({
  imageUri,
  result,
  onRateAnother,
}: ResultsDisplayProps) {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your FadeCheck rating',
          });
        } else {
          const scoreText = result.overall_score !== null ? `${result.overall_score}/10` : 'a rating';
          await Share.share({
            message: `I got ${scoreText} on FadeCheck! "${result.verdict}"`,
          });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Could not share. Please try again.');
    }
  };

  const scoreColor = result.overall_score ? getScoreColor(result.overall_score) : Colors.text.secondary;
  const scoreLabel = result.overall_score ? getScoreLabel(result.overall_score) : 'N/A';

  // Calculate potential score (slightly higher than current, max 10)
  const potentialScore = result.overall_score
    ? Math.min(10, result.overall_score + (10 - result.overall_score) * 0.5).toFixed(1)
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1 }}
          style={styles.shareableContent}
        >
          {/* Header with Photo and Main Score */}
          <View style={styles.headerSection}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <View style={styles.imageGradient} />
            </View>

            {/* Overall Score Badge */}
            <View style={styles.scoreBadge}>
              <Text style={[styles.overallScore, { color: scoreColor }]}>
                {result.overall_score ?? '—'}
              </Text>
              <Text style={styles.outOf}>/10</Text>
            </View>
          </View>

          {/* Score Label */}
          <View style={styles.labelContainer}>
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>
              {scoreLabel}
            </Text>
            <Text style={styles.verdictText}>"{result.verdict}"</Text>
          </View>

          {/* Branding (for share card) */}
          <Text style={styles.branding}>FadeCheck</Text>
        </ViewShot>

        {/* Quick Insight Badges - Swipeable */}
        <InsightBadges result={result} />

        {/* Score Grid - Compact */}
        {result.scores && (
          <View style={styles.scoresSection}>
            <Text style={styles.sectionTitle}>Your Ratings</Text>
            <View style={styles.scoresGrid}>
              <View style={styles.scoreRow}>
                <ScoreCard label="Overall" score={result.overall_score || 0} size="large" />
                <ScoreCard label="Potential" score={parseFloat(potentialScore || '0')} size="large" />
              </View>
              <View style={styles.scoreRow}>
                <ScoreCard label="Lineup" score={result.scores.lineup} />
                <ScoreCard label="Fade" score={result.scores.fade} />
                <ScoreCard label="Blend" score={result.scores.blend} />
              </View>
              <View style={styles.scoreRow}>
                <ScoreCard label="Shape" score={result.scores.shape} />
                <ScoreCard label="Fresh" score={result.scores.freshness} />
              </View>
            </View>
          </View>
        )}

        {/* Expandable Insight Cards */}
        <View style={styles.insightsSection}>
          {/* Hair Profile Card */}
          {result.hair_profile && (
            <ExpandableCard
              icon="🧬"
              title="Your Hair Type"
              summary={`${result.hair_profile.hair_type_name} • ${result.hair_profile.density.charAt(0).toUpperCase() + result.hair_profile.density.slice(1)} Density`}
              accentColor={Colors.accent.primary}
            >
              <Text style={styles.cardDescription}>
                {result.hair_profile.hair_type_description}
              </Text>
              <View style={styles.densityRow}>
                <Text style={styles.densityLabel}>Density</Text>
                <View style={styles.densityIndicator}>
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.densityDot,
                        {
                          backgroundColor:
                            (result.hair_profile?.density === 'thin' && i === 1) ||
                            (result.hair_profile?.density === 'medium' && i <= 2) ||
                            (result.hair_profile?.density === 'thick')
                              ? Colors.accent.primary
                              : Colors.background.secondary,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.densityValue}>
                  {result.hair_profile.density.charAt(0).toUpperCase() + result.hair_profile.density.slice(1)}
                </Text>
              </View>
              <Text style={styles.cardSubtext}>{result.hair_profile.density_description}</Text>
            </ExpandableCard>
          )}

          {/* Face Shape Card */}
          {result.face_analysis && (
            <ExpandableCard
              icon="💎"
              title="Your Face Shape"
              summary={result.face_analysis.face_shape.charAt(0).toUpperCase() + result.face_analysis.face_shape.slice(1)}
              accentColor={Colors.accent.secondary}
            >
              <Text style={styles.cardDescription}>
                {result.face_analysis.face_shape_description}
              </Text>
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationLabel}>Best Styles For You</Text>
                <Text style={styles.recommendationText}>
                  {result.face_analysis.style_recommendation}
                </Text>
              </View>
            </ExpandableCard>
          )}

          {/* Fade Details Card */}
          {result.fade_details && result.fade_details.fade_type !== 'none' && (
            <ExpandableCard
              icon="✂️"
              title="Your Fade"
              summary={result.fade_details.fade_type_name}
              accentColor={Colors.score.clean}
            >
              <Text style={styles.cardDescription}>
                {result.fade_details.fade_description}
              </Text>
            </ExpandableCard>
          )}

          {/* Maintenance Card */}
          {result.maintenance && (
            <ExpandableCard
              icon="📅"
              title="Maintenance"
              summary={`Touchup in ${result.maintenance.days_until_touchup} • ${result.maintenance.maintenance_schedule}`}
              accentColor={Colors.score.decent}
            >
              <View style={styles.maintenanceGrid}>
                <View style={styles.maintenanceItem}>
                  <Text style={styles.maintenanceLabel}>Next Touchup</Text>
                  <Text style={styles.maintenanceValue}>{result.maintenance.days_until_touchup}</Text>
                </View>
                <View style={styles.maintenanceItem}>
                  <Text style={styles.maintenanceLabel}>Schedule</Text>
                  <Text style={styles.maintenanceValue}>{result.maintenance.maintenance_schedule}</Text>
                </View>
              </View>
              <Text style={styles.cardSubtext}>{result.maintenance.maintenance_tip}</Text>
            </ExpandableCard>
          )}

          {/* Product Recommendations Card */}
          {result.product_recommendations && result.product_recommendations.length > 0 && (
            <ExpandableCard
              icon="💈"
              title="Product Recommendation"
              summary={result.product_recommendations[0].product_type}
              accentColor={Colors.accent.highlight}
            >
              {result.product_recommendations.map((product, index) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productType}>Best for your hair: {product.product_type}</Text>
                  <Text style={styles.cardSubtext}>{product.why}</Text>
                </View>
              ))}
            </ExpandableCard>
          )}
        </View>

        {/* Full Analysis Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Full Analysis</Text>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdown}>{result.breakdown}</Text>
          </View>
        </View>

        {/* Improvement Tips */}
        {result.scores && (
          <ImprovementTips scores={result.scores} defects={result.defects_found} />
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.9}
          style={styles.primaryButton}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#2563EB'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Share Results</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRateAnother();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={20} color={ACCENT_BLUE} />
          <Text style={styles.secondaryButtonText}>Rate Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  shareableContent: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  headerSection: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: -30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: Colors.background.tertiary,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -2,
  },
  outOf: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  verdictText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  scoresSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: spacing.md,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scoresGrid: {
    gap: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownSection: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  breakdownCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    borderTopWidth: 3,
    borderTopColor: ACCENT_BLUE,
  },
  breakdown: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text.primary,
  },
  branding: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  insightsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: spacing.md,
  },
  cardSubtext: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginTop: spacing.xs,
  },
  densityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  densityLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginRight: spacing.sm,
  },
  densityIndicator: {
    flexDirection: 'row',
    gap: 6,
    marginRight: spacing.sm,
  },
  densityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  densityValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 'auto',
  },
  recommendationBox: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.secondary,
  },
  recommendationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  maintenanceGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  maintenanceItem: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  maintenanceLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  maintenanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  productItem: {
    marginBottom: spacing.sm,
  },
  productType: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent.primary,
    marginBottom: spacing.xs,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.glass.border,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(1, 69, 242, 0.3)',
  },
  secondaryButtonText: {
    color: ACCENT_BLUE,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});
