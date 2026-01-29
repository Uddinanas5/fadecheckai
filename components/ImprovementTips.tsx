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
  defects?: string[] | null;
}

interface Tip {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const getTipsForScores = (scores: HaircutScores, defects?: string[] | null): Tip[] => {
  const tips: Tip[] = [];

  // Lineup coaching tips
  if (scores.lineup < 7) {
    tips.push({
      title: 'Level Up Your Lineup',
      description: 'Try asking your barber for a straight razor finish on edges. This gives that extra crisp definition.',
      icon: 'cut',
      color: '#FF6B6B',
    });
  }

  // Fade coaching tips
  if (scores.fade < 7) {
    tips.push({
      title: 'Enhance Your Fade',
      description: 'Request extra blending time at your next visit. The smoothest fades take patience to perfect.',
      icon: 'layers',
      color: '#F59E0B',
    });
  }

  // Blend coaching tips
  if (scores.blend < 7) {
    tips.push({
      title: 'Perfect Your Blend',
      description: 'Ask for clipper-over-comb work on the top-to-side transition. This creates seamless flow.',
      icon: 'git-merge',
      color: ACCENT_BLUE,
    });
  }

  // Shape coaching tips
  if (scores.shape < 7) {
    tips.push({
      title: 'Refine Your Style',
      description: 'Chat with your barber about trying new techniques. Small adjustments can make a big difference.',
      icon: 'ellipse',
      color: CYAN_GLOW,
    });
  }

  // Freshness tips
  if (scores.freshness < 7) {
    tips.push({
      title: 'Schedule Your Touch-Up',
      description: 'Your style is ready for a refresh. Regular visits every 1-2 weeks keep you looking sharp.',
      icon: 'time',
      color: '#22C55E',
    });
  }

  // High scores - maintenance tips
  if (tips.length === 0) {
    tips.push({
      title: 'Maintain Your Look',
      description: 'Excellent work! Keep this fresh with regular visits every 2-3 weeks.',
      icon: 'checkmark-circle',
      color: '#22C55E',
    });
  }

  // Add constructive tips based on areas to improve
  if (defects && defects.length > 0) {
    const defectStr = defects.join(' ').toLowerCase();

    if (defectStr.includes('asymmetr') || defectStr.includes('uneven')) {
      tips.push({
        title: 'Pro Tip: Symmetry Check',
        description: 'Ask your barber to do a mirror check from both sides before finishing up.',
        icon: 'git-compare',
        color: '#FF6B6B',
      });
    }
  }

  return tips.slice(0, 3); // Max 3 tips
};

export default function ImprovementTips({ scores, defects }: ImprovementTipsProps) {
  const tips = getTipsForScores(scores, defects);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Grooming Guide</Text>
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
