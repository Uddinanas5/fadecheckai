import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { spacing, borderRadius, typography } from '../constants/Styles';
import StyleCard from '../components/StyleCard';
import { recommendStyles } from '../services/recommend';
import { getHaircutById } from '../constants/haircuts';
import { AnalysisResult } from '../types';

export default function RecommendationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ imageUri?: string; result?: string }>();

  const sourceImageUri = params.imageUri;
  const result: AnalysisResult | null = useMemo(() => {
    if (!params.result) return null;
    try {
      return JSON.parse(params.result) as AnalysisResult;
    } catch {
      return null;
    }
  }, [params.result]);

  const recommendations = useMemo(() => recommendStyles(result, 6), [result]);

  const faceShape = result?.face_analysis?.face_shape;
  const hairType = result?.hair_profile?.hair_type_name || result?.hair_profile?.hair_type;

  const openStyle = (styleId: string) => {
    router.push({
      pathname: '/style/[id]',
      params: { id: styleId, imageUri: sourceImageUri ?? '' },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommended for you</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile summary */}
        {(faceShape || hairType) && (
          <View style={styles.profileCard}>
            {sourceImageUri ? (
              <Image source={{ uri: sourceImageUri }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Ionicons name="person" size={24} color={Colors.text.tertiary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.profileLabel}>Based on your photo</Text>
              <View style={styles.chipRow}>
                {faceShape ? (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{faceShape} face</Text>
                  </View>
                ) : null}
                {hairType ? (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{hairType}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}

        <Text style={styles.intro}>
          Tap a style to see reference photos and try it on. These are picked to suit your
          features — but you can browse every style too.
        </Text>

        {recommendations.map((rec) => {
          const haircut = getHaircutById(rec.styleId);
          if (!haircut) return null;
          return (
            <StyleCard
              key={rec.styleId}
              haircut={haircut}
              reason={rec.reason}
              score={rec.score}
              onPress={() => openStyle(rec.styleId)}
            />
          );
        })}

        <TouchableOpacity
          style={styles.browseAll}
          onPress={() => router.replace('/(tabs)/styles')}
          activeOpacity={0.85}
        >
          <Ionicons name="grid-outline" size={18} color={Colors.accent.primary} />
          <Text style={styles.browseAllText}>Browse all styles</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.accent.primary} />
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...typography.h3, color: Colors.text.primary },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background.secondary,
  },
  profileImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  profileLabel: { ...typography.label, color: Colors.text.secondary, marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    backgroundColor: 'rgba(1,69,242,0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent.highlight,
    textTransform: 'capitalize',
  },
  intro: {
    ...typography.bodySecondary,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  browseAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(1,69,242,0.4)',
    backgroundColor: 'rgba(1,69,242,0.08)',
    marginTop: spacing.sm,
  },
  browseAllText: { fontSize: 16, fontWeight: '600', color: Colors.accent.primary },
});
