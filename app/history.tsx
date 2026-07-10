// History — every saved try-on and rating in one grid.
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { spacing, typography, borderRadius, softShadow } from '../constants/Styles';
import { ScreenHeader, PopButton } from '../components/ui';
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
        params: { imageUri: entry.imageUri, result: JSON.stringify(entry.result), fromHistory: 'true' },
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
      <ScreenHeader
        title="Your looks"
        onBack={() => router.back()}
        right={
          entries.length > 0 ? (
            <TouchableOpacity onPress={confirmClear}>
              <Ionicons name="trash-outline" size={20} color={Colors.accent.tertiary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Loading…</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="images-outline" size={40} color={Colors.pop.purpleInk} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyText}>Your try-ons and ratings will show up here.</Text>
          <PopButton
            label="Create a look"
            icon="color-wand"
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.sm, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HistoryCard entry={item} onPress={() => openEntry(item)} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  muted: { ...typography.body, color: Colors.text.secondary },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: borderRadius.xl,
    backgroundColor: Colors.pop.lime,
    borderWidth: 2,
    borderColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    transform: [{ rotate: '-6deg' }],
    ...softShadow,
  },
  emptyTitle: { ...typography.h2, textAlign: 'center' },
  emptyText: { ...typography.bodySecondary, textAlign: 'center', marginBottom: spacing.sm },
});
