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

          {/* Score Grid - UMAX Style */}
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

          {/* Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Analysis</Text>
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdown}>{result.breakdown}</Text>
            </View>
          </View>

          {/* Branding (for share card) */}
          <Text style={styles.branding}>FadeCheck</Text>
        </ViewShot>

        {/* Improvement Tips - Outside of share card */}
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
