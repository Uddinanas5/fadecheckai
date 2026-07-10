// HistoryCard — a saved look (try-on) or past rating, as a mini sticker card.
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors, { getLevelColor } from '../constants/Colors';
import { borderRadius, spacing, softShadow } from '../constants/Styles';
import { HistoryEntry } from '../types';

interface HistoryCardProps {
  entry: HistoryEntry;
  onPress: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HistoryCard({ entry, onPress }: HistoryCardProps) {
  const isTryOn = entry.kind === 'tryon';
  const imageUri = isTryOn ? entry.tryOn.generatedImageUri : entry.imageUri;
  const label = isTryOn ? entry.tryOn.styleName : entry.result.overall_level ?? 'Analysis';
  const labelColor = !isTryOn && entry.result.overall_level ? getLevelColor(entry.result.overall_level) : Colors.ink;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.topBadge}>
          <Ionicons name={isTryOn ? 'color-wand' : 'star'} size={12} color="#fff" />
        </View>
      </View>
      <View style={styles.label}>
        <Text style={[styles.name, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.kind}>{isTryOn ? 'Try-on' : 'Rating'}</Text>
          <Text style={styles.date}>{formatDate(entry.timestamp)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.ink,
    ...softShadow,
  },
  imageWrap: { width: '100%', aspectRatio: 0.9, backgroundColor: Colors.background.primary },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  topBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.ink,
    backgroundColor: '#FFFFFF',
  },
  name: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  kind: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: { fontSize: 10, color: Colors.text.tertiary, fontWeight: '700' },
});
