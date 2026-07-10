import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { spacing, borderRadius, typography, softShadow } from '../../constants/Styles';
import { getHaircutById } from '../../constants/haircuts';

const { width: SCREEN_W } = Dimensions.get('window');

export default function StyleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; imageUri?: string }>();
  const haircut = getHaircutById(params.id);
  const sourceImageUri = params.imageUri && params.imageUri.length > 0 ? params.imageUri : undefined;

  const [activeIndex, setActiveIndex] = useState(0);

  if (!haircut) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.text.secondary} />
        <Text style={styles.errorText}>Style not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  const handleTryOn = () => {
    // Without a source photo we can't generate a preview — send the user to the
    // Create tab to add one. (The CTA also relabels itself in this case, so this
    // is an obvious, cross-platform action rather than a hidden Alert.)
    if (!sourceImageUri) {
      router.replace('/(tabs)');
      return;
    }
    router.push({
      pathname: '/tryon',
      params: { id: haircut.id, imageUri: sourceImageUri },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {haircut.referenceImages.map((img, i) => (
              <Image key={i} source={img} style={styles.galleryImage} />
            ))}
          </ScrollView>
          <LinearGradient
            colors={['rgba(5,5,8,0.6)', 'transparent']}
            style={styles.topScrim}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          {/* Dots */}
          <View style={styles.dots}>
            {haircut.referenceImages.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.category}>{haircut.category.toUpperCase()}</Text>
          <Text style={styles.name}>{haircut.name}</Text>
          <Text style={styles.tagline}>{haircut.tagline}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={14} color={Colors.accent.secondary} />
              <Text style={styles.metaText}>{haircut.maintenance}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="cut-outline" size={14} color={Colors.accent.secondary} />
              <Text style={styles.metaText}>{haircut.difficulty}</Text>
            </View>
          </View>

          <Text style={styles.description}>{haircut.description}</Text>

          <Text style={styles.sectionTitle}>Ask your barber for</Text>
          <View style={styles.barberCard}>
            {haircut.barberInstructions.map((line, i) => (
              <View key={i} style={styles.barberRow}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.accent.primary} />
                <Text style={styles.barberText}>{line}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={18} color={Colors.accent.secondary} />
            <Text style={styles.tipText}>
              Screenshot the reference photos above and show them to your barber for the clearest
              result.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA — relabels when no source photo is available yet */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
        {!sourceImageUri && (
          <Text style={styles.ctaHint}>Add a photo of yourself to preview this on you</Text>
        )}
        <TouchableOpacity style={styles.cta} onPress={handleTryOn} activeOpacity={0.9}>
          <LinearGradient
            colors={Colors.gradient.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name={sourceImageUri ? 'color-wand' : 'camera'} size={20} color="#fff" />
            <Text style={styles.ctaText}>{sourceImageUri ? 'Try it on' : 'Add your photo'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  center: { justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: { ...typography.body, color: Colors.text.secondary },
  link: { color: Colors.accent.primary, fontWeight: '600' },
  galleryImage: { width: SCREEN_W, aspectRatio: 3 / 4, backgroundColor: Colors.background.tertiary },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5,5,8,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  body: { padding: spacing.lg },
  category: { ...typography.label, color: Colors.accent.primary },
  name: { ...typography.h1, marginTop: 4 },
  tagline: { ...typography.bodySecondary, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.pop.yellow,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  metaText: { fontSize: 13, fontWeight: '800', color: Colors.ink, textTransform: 'capitalize' },
  description: { ...typography.body, color: Colors.text.secondary, marginTop: spacing.lg, lineHeight: 23 },
  sectionTitle: { ...typography.h3, marginTop: spacing.xl, marginBottom: spacing.sm },
  barberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.ink,
    padding: spacing.md,
    gap: spacing.sm,
    ...softShadow,
  },
  barberRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  barberText: { flex: 1, ...typography.body, fontSize: 15, color: Colors.text.primary, lineHeight: 21 },
  tipBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: Colors.pop.lime,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.ink,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  tipText: { flex: 1, ...typography.caption, color: Colors.pop.limeInk, lineHeight: 19 },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(251,243,228,0.96)',
    borderTopWidth: 2,
    borderTopColor: Colors.ink,
  },
  ctaHint: {
    ...typography.small,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: Colors.text.secondary,
  },
  cta: {
    height: 60,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.ink,
    ...softShadow,
  },
  ctaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
});
