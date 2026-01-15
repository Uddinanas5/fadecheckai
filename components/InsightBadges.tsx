import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Styles';
import { AnalysisResult } from '../types';

interface InsightBadgesProps {
  result: AnalysisResult;
  onBadgePress?: (section: string) => void;
}

interface Badge {
  icon: string;
  label: string;
  value: string;
  section: string;
  color: string;
}

export default function InsightBadges({ result, onBadgePress }: InsightBadgesProps) {
  const badges: Badge[] = [];

  // Hair Type Badge
  if (result.hair_profile?.hair_type) {
    badges.push({
      icon: '🧬',
      label: 'Hair',
      value: result.hair_profile.hair_type,
      section: 'hair',
      color: Colors.accent.primary,
    });
  }

  // Face Shape Badge
  if (result.face_analysis?.face_shape) {
    const shapeEmoji = {
      oval: '⬭',
      square: '▢',
      round: '○',
      oblong: '⬯',
      heart: '♡',
      diamond: '◇',
    };
    badges.push({
      icon: '💎',
      label: 'Face',
      value: result.face_analysis.face_shape.charAt(0).toUpperCase() + result.face_analysis.face_shape.slice(1),
      section: 'face',
      color: Colors.accent.secondary,
    });
  }

  // Fade Type Badge
  if (result.fade_details?.fade_type && result.fade_details.fade_type !== 'none') {
    badges.push({
      icon: '✂️',
      label: 'Fade',
      value: result.fade_details.fade_type_name?.split(' ')[0] || result.fade_details.fade_type.charAt(0).toUpperCase() + result.fade_details.fade_type.slice(1),
      section: 'fade',
      color: Colors.score.great,
    });
  }

  // Maintenance Badge
  if (result.maintenance?.days_until_touchup) {
    badges.push({
      icon: '📅',
      label: 'Next',
      value: result.maintenance.days_until_touchup,
      section: 'maintenance',
      color: Colors.score.fair,
    });
  }

  // Density Badge
  if (result.hair_profile?.density) {
    badges.push({
      icon: '📊',
      label: 'Density',
      value: result.hair_profile.density.charAt(0).toUpperCase() + result.hair_profile.density.slice(1),
      section: 'density',
      color: Colors.accent.highlight,
    });
  }

  if (badges.length === 0) return null;

  const handlePress = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBadgePress?.(section);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {badges.map((badge, index) => (
          <TouchableOpacity
            key={badge.section}
            style={[
              styles.badge,
              { borderColor: `${badge.color}30` },
            ]}
            onPress={() => handlePress(badge.section)}
            activeOpacity={0.7}
          >
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <View style={styles.badgeText}>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
              <Text style={[styles.badgeValue, { color: badge.color }]}>{badge.value}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  badgeIcon: {
    fontSize: 18,
  },
  badgeText: {
    alignItems: 'flex-start',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
});
