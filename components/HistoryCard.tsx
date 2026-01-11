import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Colors, { getScoreColor } from '../constants/Colors';
import { borderRadius, spacing } from '../constants/Styles';
import { HistoryItem } from '../types';

interface HistoryCardProps {
  item: HistoryItem;
  onPress: () => void;
  index?: number;
}

export default function HistoryCard({ item, onPress, index = 0 }: HistoryCardProps) {
  const score = item.result.overall_score;
  const scoreColor = score ? getScoreColor(score) : Colors.text.secondary;

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = index * 80; // Staggered animation

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getScoreEmoji = (s: number | null): string => {
    if (!s) return '✂️';
    if (s >= 9) return '🔥';
    if (s >= 8) return '✨';
    if (s >= 7) return '👌';
    if (s >= 6) return '👍';
    return '📈';
  };

  // Get mini scores for display
  const fadeScore = item.result.scores?.fade ?? null;
  const lineupScore = item.result.scores?.lineup ?? null;

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
        {/* Glow effect behind card */}
        <View style={[styles.glowEffect, { backgroundColor: scoreColor }]} />

        <Image source={{ uri: item.imageUri }} style={styles.image} />

        {/* Top badge with emoji */}
        <View style={styles.topBadge}>
          <BlurView intensity={40} tint="dark" style={styles.badgeBlur}>
            <Text style={styles.badgeEmoji}>{getScoreEmoji(score)}</Text>
          </BlurView>
        </View>

        {/* Bottom overlay with score info */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)'] as const}
          style={styles.overlay}
        >
          {/* Score display */}
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreMain, { color: scoreColor }]}>
              {score?.toFixed(1) ?? '—'}
            </Text>
            <Text style={styles.scoreTen}>/10</Text>
          </View>

          {/* Mini scores row */}
          {(fadeScore || lineupScore) && (
            <View style={styles.miniScoresRow}>
              {fadeScore && (
                <View style={styles.miniScore}>
                  <Text style={styles.miniLabel}>Fade</Text>
                  <Text style={[styles.miniValue, { color: getScoreColor(fadeScore) }]}>
                    {fadeScore.toFixed(1)}
                  </Text>
                </View>
              )}
              {fadeScore && lineupScore && <View style={styles.miniDivider} />}
              {lineupScore && (
                <View style={styles.miniScore}>
                  <Text style={styles.miniLabel}>Line</Text>
                  <Text style={[styles.miniValue, { color: getScoreColor(lineupScore) }]}>
                    {lineupScore.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Date */}
          <View style={styles.dateContainer}>
            <View style={styles.dateDot} />
            <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
          </View>
        </LinearGradient>

        {/* Glass border overlay */}
        <View style={styles.glassBorder} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    margin: spacing.xs,
  },
  container: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    opacity: 0.15,
    borderRadius: borderRadius.xl + 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeBlur: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreMain: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  scoreTen: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  miniScoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  miniScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  miniDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginRight: 6,
  },
  date: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
});
