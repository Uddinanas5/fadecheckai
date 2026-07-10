// Recommendations — the payoff of the photo: styles matched to your features.
// Falls back to a neutral "Popular styles" set when no analysis is available.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { spacing, borderRadius, typography, softShadow } from '../constants/Styles';
import { ScreenHeader, PopButton } from '../components/ui';
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
  const hasAnalysis = Boolean(faceShape || hairType);

  const openStyle = (styleId: string) => {
    router.push({ pathname: '/style/[id]', params: { id: styleId, imageUri: sourceImageUri ?? '' } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={hasAnalysis ? 'Recommended for you' : 'Popular styles'}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
      >
        {hasAnalysis && (
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
                  <View style={styles.popChip}>
                    <Text style={styles.popChipText}>{faceShape} face</Text>
                  </View>
                ) : null}
                {hairType ? (
                  <View style={[styles.popChip, { backgroundColor: Colors.pop.pink }]}>
                    <Text style={styles.popChipText}>{hairType}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}

        <Text style={styles.intro}>
          {hasAnalysis
            ? 'Tap a style to see reference photos and try it on. These are picked to suit your features — but you can browse every style too.'
            : 'A few crowd-pleasers to explore. Tap any style to see reference photos and try it on, or browse the full catalog.'}
        </Text>

        {recommendations.map((rec) => {
          const haircut = getHaircutById(rec.styleId);
          if (!haircut) return null;
          return (
            <StyleCard
              key={rec.styleId}
              haircut={haircut}
              reason={hasAnalysis ? rec.reason : undefined}
              score={hasAnalysis ? rec.score : undefined}
              onPress={() => openStyle(rec.styleId)}
            />
          );
        })}

        <PopButton
          label="Browse all styles"
          icon="grid-outline"
          color={Colors.pop.lime}
          textColor={Colors.pop.limeInk}
          onPress={() => router.replace('/(tabs)/styles')}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.ink,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...softShadow,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  profileImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  profileLabel: { ...typography.label, marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  popChip: {
    backgroundColor: Colors.pop.purple,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popChipText: { fontSize: 12, fontWeight: '800', color: '#fff', textTransform: 'capitalize' },
  intro: { ...typography.bodySecondary, fontSize: 14, marginBottom: spacing.lg },
});
