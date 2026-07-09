import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { spacing, borderRadius, typography } from '../constants/Styles';
import { useHistory } from '../hooks/useHistory';
import HistoryCard from '../components/HistoryCard';
import { HistoryEntry } from '../types';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, isLoading, clearHistory } = useHistory();

  const openEntry = (entry: HistoryEntry) => {
    if (entry.kind === 'rating') {
      router.push({
        pathname: '/results',
        params: {
          imageUri: entry.imageUri,
          result: JSON.stringify(entry.result),
          fromHistory: 'true',
        },
      });
    } else {
      router.push({
        pathname: '/style/[id]',
        params: { id: entry.tryOn.styleId, imageUri: entry.tryOn.sourceImageUri },
      });
    }
  };

  const confirmClear = () => {
    Alert.alert('Clear history', 'Delete all saved looks and ratings?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your looks</Text>
        {entries.length > 0 ? (
          <TouchableOpacity style={styles.iconBtn} onPress={confirmClear}>
            <Ionicons name="trash-outline" size={20} color={Colors.accent.tertiary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Loading…</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <LinearGradient
              colors={['rgba(1,69,242,0.2)', 'rgba(1,69,242,0.05)']}
              style={styles.emptyIconGradient}
            >
              <Ionicons name="images-outline" size={44} color={Colors.accent.primary} />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyText}>Your try-ons and ratings will show up here.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace('/(tabs)')}>
            <LinearGradient colors={Colors.gradient.button} style={styles.emptyBtnGradient}>
              <Ionicons name="color-wand" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>Create a look</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.sm, paddingBottom: insets.bottom + 40 }}
          columnWrapperStyle={{ gap: 0 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HistoryCard entry={item} onPress={() => openEntry(item)} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h3 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  muted: { ...typography.body, color: Colors.text.secondary },
  emptyIcon: { borderRadius: 40, overflow: 'hidden', marginBottom: spacing.sm },
  emptyIconGradient: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(1,69,242,0.3)',
  },
  emptyTitle: { ...typography.h2, textAlign: 'center' },
  emptyText: { ...typography.bodySecondary, textAlign: 'center', marginBottom: spacing.md },
  emptyBtn: { borderRadius: borderRadius.full, overflow: 'hidden' },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
