import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { borderRadius, spacing } from '../constants/Styles';
import { Haircut } from '../types';

interface StyleCardProps {
  haircut: Haircut;
  onPress: () => void;
  reason?: string; // optional recommendation reason
  score?: number; // optional match score 0-100
  compact?: boolean; // smaller grid card
}

export default function StyleCard({ haircut, onPress, reason, score, compact }: StyleCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={haircut.thumbnail}
        style={styles.image}
        imageStyle={styles.imageInner}
      >
        <LinearGradient
          colors={['transparent', 'rgba(5,5,8,0.85)']}
          style={styles.imageOverlay}
        />
        {typeof score === 'number' && (
          <View style={styles.scorePill}>
            <Ionicons name="sparkles" size={11} color={Colors.accent.secondary} />
            <Text style={styles.scoreText}>{score}% match</Text>
          </View>
        )}
        <View style={styles.imageTextWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {haircut.name}
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {haircut.tagline}
          </Text>
        </View>
      </ImageBackground>

      {reason ? (
        <View style={styles.reasonWrap}>
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={Colors.accent.primary}
            style={{ marginTop: 1 }}
          />
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
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardCompact: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    justifyContent: 'flex-end',
  },
  imageInner: {
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageTextWrap: {
    padding: spacing.md,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  scorePill: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5,5,8,0.7)',
    borderColor: 'rgba(56,189,248,0.4)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent.secondary,
  },
  reasonWrap: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reason: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.text.secondary,
  },
});
