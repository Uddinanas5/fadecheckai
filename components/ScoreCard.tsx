import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors, { getTierColor } from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Styles';
import { TierLevel } from '../types';

interface ScoreCardProps {
  label: string;
  tier: TierLevel;
  size?: 'small' | 'large';
}

const getTierLabel = (tier: TierLevel): string => {
  switch (tier) {
    case 'strong': return 'Strong';
    case 'solid': return 'Solid';
    case 'developing': return 'Growing';
  }
};

const getTierProgress = (tier: TierLevel): number => {
  switch (tier) {
    case 'strong': return 100;
    case 'solid': return 66;
    case 'developing': return 33;
  }
};

export default function ScoreCard({ label, tier, size = 'small' }: ScoreCardProps) {
  const tierColor = getTierColor(tier);
  const progress = getTierProgress(tier);
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Text style={[styles.label, isLarge && styles.labelLarge]}>{label}</Text>
      <Text style={[styles.tierText, isLarge && styles.tierTextLarge, { color: tierColor }]}>
        {getTierLabel(tier)}
      </Text>
      {/* Progress bar with gradient */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { width: `${progress}%`, backgroundColor: tierColor }]}
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
  tierText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  tierTextLarge: {
    fontSize: 20,
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
