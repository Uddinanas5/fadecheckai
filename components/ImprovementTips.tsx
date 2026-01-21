import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Styles';
import { HaircutScores } from '../types';

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';

interface ImprovementTipsProps {
  scores: HaircutScores;
  improvements?: string[] | null;
  // Legacy support
  defects?: string[] | null;
}

interface Tip {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const getTipsForScores = (scores: HaircutScores, improvements?: string[] | null): Tip[] => {
  const tips: Tip[] = [];

  // Lineup tips
  if (scores.lineup < 7) {
    tips.push({
      title: 'Sharper Lineup Next Time',
      description: 'Ask your barber to use a straight razor for the edges. A crisp lineup makes all the difference.',
      icon: 'cut',
      color: '#FF6B6B',
    });
  }

  // Fade tips
  if (scores.fade < 7) {
    tips.push({
      title: 'Request a Smoother Fade',
      description: 'Tell your barber to take more time blending. A good fade should look airbrushed with no visible lines.',
      icon: 'layers',
      color: '#F59E0B',
    });
  }

  // Blend tips
  if (scores.blend < 7) {
    tips.push({
      title: 'Better Weight Line Blend',
      description: 'The transition between top and sides needs more attention. Ask for extra clipper-over-comb work.',
      icon: 'git-merge',
      color: ACCENT_BLUE,
    });
  }

  // Shape tips
  if (scores.shape < 7) {
    tips.push({
      title: 'Improve Overall Shape',
      description: 'Discuss what style suits your head shape best. Sometimes a different fade height works better.',
      icon: 'ellipse',
      color: CYAN_GLOW,
    });
  }

  // Freshness tips
  if (scores.freshness < 7) {
    tips.push({
      title: 'Time for a Touch-Up',
      description: 'Your cut is growing out. For the crispiest look, get a lineup every 1-2 weeks.',
      icon: 'time',
      color: '#22C55E',
    });
  }

  // If all scores are decent, give maintenance tips
  if (tips.length === 0) {
    tips.push({
      title: 'Keep It Fresh',
      description: 'Great cut! Maintain it with regular visits every 2-3 weeks for that always-crispy look.',
      icon: 'checkmark-circle',
      color: '#22C55E',
    });
  }

  // Add improvement-specific tips
  if (improvements && improvements.length > 0) {
    const improvementStr = improvements.join(' ').toLowerCase();

    if (improvementStr.includes('asymmetr') || improvementStr.includes('uneven')) {
      tips.push({
        title: 'Check Symmetry',
        description: 'Ask your barber to step back and check both sides in the mirror before finishing.',
        icon: 'git-compare',
        color: '#FF6B6B',
      });
    }
  }

  return tips.slice(0, 3); // Max 3 tips
};

export default function ImprovementTips({ scores, improvements, defects }: ImprovementTipsProps) {
  // Support both new 'improvements' and legacy 'defects' prop
  const tips = getTipsForScores(scores, improvements || defects);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tips to Improve</Text>
      <View style={styles.tipsContainer}>
        {tips.map((tip, index) => (
          <View key={index} style={[styles.tipCard, { borderLeftColor: tip.color }]}>
            <View style={[styles.iconContainer, { backgroundColor: tip.color + '15' }]}>
              <Ionicons name={tip.icon} size={20} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={tip.color} style={{ opacity: 0.6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
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
  tipsContainer: {
    gap: spacing.sm,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  tipDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
