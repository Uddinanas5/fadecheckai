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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Colors, { getScoreColor, getScoreLabel } from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Styles';
import { AnalysisResult } from '../types';
import ScoreRing from './ScoreRing';

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
          // Fallback to basic share
          await Share.share({
            message: `I got a ${result.overall_score}/10 on FadeCheck! "${result.verdict}"`,
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

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.shareableContent}
      >
        {/* Photo */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        {/* Overall Score */}
        <View style={styles.overallScoreContainer}>
          <View style={styles.scoreRow}>
            <Text style={[styles.overallScore, { color: scoreColor }]}>
              {result.overall_score ?? '—'}
            </Text>
            <Text style={styles.outOf}>/10</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {scoreLabel}
          </Text>
        </View>

        {/* Individual Scores */}
        {result.scores && (
          <View style={styles.scoresGrid}>
            <ScoreRing score={result.scores.lineup} label="Lineup" />
            <ScoreRing score={result.scores.fade} label="Fade" />
            <ScoreRing score={result.scores.blend} label="Blend" />
            <ScoreRing score={result.scores.shape} label="Shape" />
            <ScoreRing score={result.scores.freshness} label="Fresh" />
          </View>
        )}

        {/* Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdown}>{result.breakdown}</Text>
        </View>

        {/* Verdict */}
        <View style={styles.verdictContainer}>
          <Text style={styles.verdict}>"{result.verdict}"</Text>
        </View>

        {/* Branding (for share card) */}
        <Text style={styles.branding}>FadeCheck</Text>
      </ViewShot>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Share Results</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRateAnother();
          }}
          activeOpacity={0.8}
        >
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
  shareableContent: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overallScoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  overallScore: {
    fontSize: 72,
    fontWeight: '700',
  },
  outOf: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -8,
  },
  scoresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  breakdownContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  breakdown: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  verdictContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  verdict: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.accent.primary,
    textAlign: 'center',
  },
  branding: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.background.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.accent.primary,
    fontSize: 17,
    fontWeight: '600',
  },
});
