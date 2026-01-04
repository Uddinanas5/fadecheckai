import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Colors, { getScoreColor } from '../constants/Colors';
import { borderRadius, spacing } from '../constants/Styles';
import { HistoryItem } from '../types';

interface HistoryCardProps {
  item: HistoryItem;
  onPress: () => void;
}

export default function HistoryCard({ item, onPress }: HistoryCardProps) {
  const score = item.result.overall_score;
  const scoreColor = score ? getScoreColor(score) : Colors.text.secondary;

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={[styles.score, { color: scoreColor }]}>
          {score ?? '—'}/10
        </Text>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  score: {
    fontSize: 20,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
