import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { spacing, borderRadius, typography } from '../../constants/Styles';
import StyleCard from '../../components/StyleCard';
import { useCatalog } from '../../hooks/useCatalog';
import { CATEGORY_LABELS } from '../../types';

export default function StylesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, activeCategory, setActiveCategory, filtered } = useCatalog();

  const openStyle = (id: string) => {
    router.push({ pathname: '/style/[id]', params: { id } });
  };

  // Render the grid in rows of two.
  const rows: (typeof filtered)[] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Styles</Text>
        <Text style={styles.count}>{filtered.length}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        <FilterChip
          label="All"
          active={activeCategory === 'all'}
          onPress={() => setActiveCategory('all')}
        />
        {categories.map((c) => (
          <FilterChip
            key={c}
            label={CATEGORY_LABELS[c]}
            active={activeCategory === c}
            onPress={() => setActiveCategory(c)}
          />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, idx) => (
          <View key={idx} style={styles.gridRow}>
            {row.map((h) => (
              <View key={h.id} style={styles.gridItem}>
                <StyleCard haircut={h} compact onPress={() => openStyle(h.id)} />
              </View>
            ))}
            {row.length === 1 && <View style={styles.gridItem} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h1 },
  count: { ...typography.h3, color: Colors.text.tertiary },
  chipsScroll: { flexGrow: 0, marginBottom: spacing.sm },
  chipsRow: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    height: 36,
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.background.secondary,
  },
  chipActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary },
  chipTextActive: { color: '#fff' },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  gridItem: { flex: 1 },
});
