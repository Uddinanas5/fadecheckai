import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors, { getLevelColor } from '../constants/Colors';
import { borderRadius, spacing } from '../constants/Styles';
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
  const labelColor =
    !isTryOn && entry.result.overall_level
      ? getLevelColor(entry.result.overall_level)
      : Colors.text.primary;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.topBadge}>
        <Ionicons
          name={isTryOn ? 'color-wand' : 'star'}
          size={12}
          color={isTryOn ? Colors.accent.secondary : Colors.accent.primary}
        />
      </View>

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={styles.overlay}>
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.dateRow}>
          <Text style={styles.kind}>{isTryOn ? 'Try-on' : 'Rating'}</Text>
          <Text style={styles.date}>{formatDate(entry.timestamp)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.glassBorder} pointerEvents="none" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 0.8,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    margin: spacing.xs,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  topBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(5,5,8,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  label: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  kind: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
