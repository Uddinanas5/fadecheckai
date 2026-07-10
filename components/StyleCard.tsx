import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors, { popFor } from '../constants/Colors';
import { borderRadius, spacing, softShadow } from '../constants/Styles';
import { Haircut } from '../types';

interface StyleCardProps {
  haircut: Haircut;
  onPress: () => void;
  reason?: string; // optional recommendation reason
  score?: number; // optional match score 0-100
  compact?: boolean; // smaller grid card
}

export default function StyleCard({ haircut, onPress, reason, score, compact }: StyleCardProps) {
  const pop = popFor(haircut.id);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.image}>
        <Image source={haircut.thumbnail} style={styles.imageInner} />
        {typeof score === 'number' && (
          <View style={styles.scorePill}>
            <Ionicons name="sparkles" size={11} color={Colors.ink} />
            <Text style={styles.scoreText}>{score}%</Text>
          </View>
        )}
      </View>

      {/* Label bar */}
      <View style={styles.label}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {haircut.name}
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {haircut.tagline}
          </Text>
        </View>
        <View style={[styles.arrow, { backgroundColor: pop.bg }]}>
          <Ionicons name="arrow-forward" size={16} color={pop.ink} />
        </View>
      </View>

      {reason ? (
        <View style={styles.reasonWrap}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.accent.primary} style={{ marginTop: 1 }} />
          <Text style={styles.reason} numberOfLines={2}>
            {reason}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.background.secondary,
    borderWidth: 2,
    borderColor: Colors.ink,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...softShadow,
  },
  cardCompact: { flex: 1 },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    alignItems: 'flex-end',
    padding: spacing.sm,
  },
  imageInner: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.pop.yellow,
    borderColor: Colors.ink,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  scoreText: { fontSize: 12, fontWeight: '800', color: Colors.ink },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.ink,
    backgroundColor: '#FFFFFF',
  },
  name: { fontSize: 16, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  tagline: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary, marginTop: 1 },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonWrap: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  reason: { flex: 1, fontSize: 12, lineHeight: 17, color: Colors.text.secondary, fontWeight: '600' },
});
