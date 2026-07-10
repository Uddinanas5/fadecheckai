import React, { useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import Colors, { getLevelColor, getTierColor } from '../constants/Colors';
import { spacing } from '../constants/Styles';
import { AnalysisResult, TierLevel } from '../types';
import ImprovementTips from './ImprovementTips';
import ExpandableCard from './ExpandableCard';

const ACCENT_BLUE = '#7A5CFF';
const CYAN_GLOW = '#FF4D9D';
const CARD_BG = '#12121A';
const CARD_BG_LIGHT = '#1A1A24';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8B8B9E';
const GLASS_BORDER = 'rgba(255,255,255,0.08)';

interface ResultsDisplayProps {
  imageUri: string;
  result: AnalysisResult;
  onNewScan: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tier label display helper
const getTierLabel = (tier: TierLevel): string => {
  switch (tier) {
    case 'strong': return 'Strong';
    case 'solid': return 'Solid';
    case 'developing': return 'Growing';
  }
};

// Category Tier Card Component
const CategoryTierCard = ({
  label,
  tier,
  icon,
  delay = 0
}: {
  label: string;
  tier: TierLevel;
  icon: string;
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const tierColor = getTierColor(tier);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.premiumCard,
      {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }
    ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.premiumCardGradient}
      >
        <Text style={styles.premiumCardIcon}>{icon}</Text>
        <Text style={[styles.premiumCardTier, { color: tierColor }]}>
          {getTierLabel(tier)}
        </Text>
        <Text style={styles.premiumCardLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

export default function ResultsDisplay({
  imageUri,
  result,
  onNewScan,
}: ResultsDisplayProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your results',
          });
        } else {
          // Same encouraging message for everyone - no score comparison
          const shareMessage = `Check out FadeCheck - my personal grooming coach! 💈`;
          await Share.share({
            message: shareMessage,
          });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Could not share. Please try again.');
    }
  };

  const levelColor = result.overall_level ? getLevelColor(result.overall_level) : Colors.text.secondary;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shareable Hero Card */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1 }}
          style={styles.shareableContent}
        >
          <Animated.View style={[
            styles.heroCard,
            {
              transform: [{ scale: headerScale }],
              opacity: headerOpacity,
            }
          ]}>
            <LinearGradient
              colors={['#1A1A2E', '#16162A', '#0F0F1A']}
              style={styles.heroCardGradient}
            >
              {/* Top Section - Image + Level Badge */}
              <View style={styles.heroTop}>
                {/* Profile Image with Glow */}
                <View style={styles.imageWrapper}>
                  <View style={[styles.imageGlow, { shadowColor: levelColor }]} />
                  <Image source={{ uri: imageUri }} style={styles.heroImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.imageOverlay}
                  />
                </View>

                {/* Level Badge Display */}
                <View style={styles.mainScoreSection}>
                  <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20`, borderColor: `${levelColor}40` }]}>
                    <Text style={[styles.levelBadgeText, { color: levelColor }]}>
                      {result.overall_level ?? '—'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Verdict */}
              <Text style={styles.verdictText}>"{result.verdict}"</Text>

              {/* Category Tier Grid - 3 Primary */}
              {result.scores && (
                <View style={styles.primaryScoreGrid}>
                  <CategoryTierCard label="Lineup" tier={result.scores.lineup} icon="📐" delay={100} />
                  <CategoryTierCard label="Fade" tier={result.scores.fade} icon="🎨" delay={200} />
                  <CategoryTierCard label="Blend" tier={result.scores.blend} icon="✨" delay={300} />
                </View>
              )}

              {/* Secondary Tiers Row */}
              {result.scores && (
                <View style={styles.secondaryScoreRow}>
                  <View style={styles.secondaryScoreItem}>
                    <Text style={[styles.secondaryScoreValue, { color: getTierColor(result.scores.shape) }]}>
                      {getTierLabel(result.scores.shape)}
                    </Text>
                    <Text style={styles.secondaryScoreLabel}>Shape</Text>
                  </View>
                  <View style={styles.scoreDivider} />
                  <View style={styles.secondaryScoreItem}>
                    <Text style={[styles.secondaryScoreValue, { color: getTierColor(result.scores.freshness) }]}>
                      {getTierLabel(result.scores.freshness)}
                    </Text>
                    <Text style={styles.secondaryScoreLabel}>Freshness</Text>
                  </View>
                  {result.maintenance && (
                    <>
                      <View style={styles.scoreDivider} />
                      <View style={styles.secondaryScoreItem}>
                        <Text style={[styles.secondaryScoreValue, { color: CYAN_GLOW }]}>
                          {result.maintenance.days_until_touchup}
                        </Text>
                        <Text style={styles.secondaryScoreLabel}>Touchup</Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </ViewShot>

        {/* Quick Info Pills - Hair type and fade info only (no face shape badge) */}
        <View style={styles.infoPills}>
          {result.hair_profile && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillIcon}>🧬</Text>
              <Text style={styles.infoPillText}>{result.hair_profile.hair_type_name}</Text>
            </View>
          )}
          {result.fade_details && result.fade_details.fade_type !== 'none' && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillIcon}>✂️</Text>
              <Text style={styles.infoPillText}>{result.fade_details.fade_type_name}</Text>
            </View>
          )}
        </View>

        {/* Detail Cards */}
        <View style={styles.detailsSection}>
          {/* Coach's Notes */}
          <ExpandableCard
            icon="📋"
            title="Coach's Notes"
            summary="Your detailed feedback"
            accentColor={ACCENT_BLUE}
            defaultExpanded={false}
          >
            <Text style={styles.analysisText}>{result.breakdown}</Text>
          </ExpandableCard>

          {/* Hair Profile */}
          {result.hair_profile && (
            <ExpandableCard
              icon="🧬"
              title="Hair Profile"
              summary={result.hair_profile.hair_type_name}
              accentColor="#8B5CF6"
            >
              <Text style={styles.analysisText}>{result.hair_profile.hair_type_description}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Density</Text>
                <View style={styles.statValueContainer}>
                  {['thin', 'medium', 'thick'].map((level, i) => (
                    <View
                      key={level}
                      style={[
                        styles.densityBar,
                        {
                          backgroundColor:
                            (result.hair_profile?.density === 'thin' && i === 0) ||
                            (result.hair_profile?.density === 'medium' && i <= 1) ||
                            (result.hair_profile?.density === 'thick')
                              ? '#8B5CF6'
                              : 'rgba(255,255,255,0.1)',
                        },
                      ]}
                    />
                  ))}
                  <Text style={styles.statValue}>
                    {result.hair_profile.density.charAt(0).toUpperCase() + result.hair_profile.density.slice(1)}
                  </Text>
                </View>
              </View>
            </ExpandableCard>
          )}

          {/* Style Ideas - Reframed from "Face Shape" to focus on recommendations */}
          {result.face_analysis && (
            <ExpandableCard
              icon="💡"
              title="Style Ideas For You"
              summary="Personalized recommendations"
              accentColor="#EC4899"
            >
              <View style={styles.tipBox}>
                <Text style={styles.tipLabel}>✨ Styles That Complement Your Features</Text>
                <Text style={styles.tipText}>{result.face_analysis.style_recommendation}</Text>
              </View>
            </ExpandableCard>
          )}

          {/* Fade Details */}
          {result.fade_details && result.fade_details.fade_type !== 'none' && (
            <ExpandableCard
              icon="✂️"
              title="Fade Analysis"
              summary={result.fade_details.fade_type_name}
              accentColor="#10B981"
            >
              <Text style={styles.analysisText}>{result.fade_details.fade_description}</Text>
            </ExpandableCard>
          )}

          {/* Maintenance */}
          {result.maintenance && (
            <ExpandableCard
              icon="📅"
              title="Maintenance"
              summary={result.maintenance.days_until_touchup}
              accentColor="#F59E0B"
            >
              <View style={styles.maintenanceGrid}>
                <View style={styles.maintenanceCard}>
                  <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
                  <Text style={styles.maintenanceCardValue}>{result.maintenance.days_until_touchup}</Text>
                  <Text style={styles.maintenanceCardLabel}>Next Visit</Text>
                </View>
                <View style={styles.maintenanceCard}>
                  <Ionicons name="repeat-outline" size={20} color="#F59E0B" />
                  <Text style={styles.maintenanceCardValue}>{result.maintenance.maintenance_schedule}</Text>
                  <Text style={styles.maintenanceCardLabel}>Schedule</Text>
                </View>
              </View>
              <Text style={styles.tipText}>{result.maintenance.maintenance_tip}</Text>
            </ExpandableCard>
          )}

          {/* Products */}
          {result.product_recommendations && result.product_recommendations.length > 0 && (
            <ExpandableCard
              icon="💈"
              title="Recommended Products"
              summary={result.product_recommendations[0].product_type}
              accentColor="#06B6D4"
            >
              {result.product_recommendations.map((product, index) => (
                <View key={index} style={styles.productRow}>
                  <View style={styles.productIcon}>
                    <Ionicons name="checkmark-circle" size={18} color="#06B6D4" />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.product_type}</Text>
                    <Text style={styles.productReason}>{product.why}</Text>
                  </View>
                </View>
              ))}
            </ExpandableCard>
          )}
        </View>

        {/* Improvement Tips */}
        {result.scores && (
          <ImprovementTips scores={result.scores} areasToImprove={result.areas_to_improve} />
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.9}
          style={styles.shareBtn}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareBtnGradient}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Share</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newScanBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNewScan();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={20} color={TEXT_PRIMARY} />
          <Text style={styles.newScanBtnText}>New Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  shareableContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  // Hero Card
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  heroCardGradient: {
    padding: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  heroImage: {
    width: 88,
    height: 88,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  mainScoreSection: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  levelBadgeText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  verdictText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  // Primary Score Grid
  primaryScoreGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  premiumCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  premiumCardGradient: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  premiumCardIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  premiumCardTier: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  premiumCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // Secondary Score Row
  secondaryScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryScoreItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondaryScoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  secondaryScoreLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  // Info Pills
  infoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  infoPillIcon: {
    fontSize: 14,
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  // Details Section
  detailsSection: {
    paddingHorizontal: 12,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  densityBar: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginLeft: 8,
  },
  tipBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EC4899',
  },
  tipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.8)',
  },
  // Maintenance Grid
  maintenanceGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  maintenanceCard: {
    flex: 1,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  maintenanceCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 6,
    textAlign: 'center',
  },
  maintenanceCardLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  // Product Row
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  productReason: {
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_SECONDARY,
  },
  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 24,
    gap: 10,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
  },
  shareBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newScanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: CARD_BG_LIGHT,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  newScanBtnText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
});
