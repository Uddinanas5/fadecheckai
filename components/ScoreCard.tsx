import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { getScoreColor, getScoreGradient } from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Styles';

interface ScoreCardProps {
  label: string;
  score: number;
  size?: 'small' | 'large';
}

export default function ScoreCard({ label, score, size = 'small' }: ScoreCardProps) {
  const scoreColor = getScoreColor(score);
  const scoreGradient = getScoreGradient(score);
  const isLarge = size === 'large';

  // Get progress percentage (score out of 10)
  const progress = (score / 10) * 100;

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Text style={[styles.label, isLarge && styles.labelLarge]}>{label}</Text>
      <Text style={[styles.score, isLarge && styles.scoreLarge, { color: scoreColor }]}>
        {score.toFixed(1)}
      </Text>
      {/* Progress bar with gradient */}
      <View style={styles.progressContainer}>
        <LinearGradient
          colors={scoreGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 90,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  containerLarge: {
    padding: spacing.lg,
    minWidth: 120,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  labelLarge: {
    fontSize: 12,
  },
  score: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  scoreLarge: {
    fontSize: 36,
    letterSpacing: -2,
  },
  progressContainer: {
    width: '100%',
    height: 5,
    backgroundColor: '#252530',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
