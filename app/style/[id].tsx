// Style detail — swipeable reference gallery, "ask your barber" notes, try-on CTA.
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { popFor } from '../../constants/Colors';
import { spacing, borderRadius, typography, softShadow } from '../../constants/Styles';
import { getHaircutById } from '../../constants/haircuts';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
// Cap the gallery so it never swallows a small screen (SE-class phones).
const GALLERY_H = Math.min(SCREEN_W * (4 / 3), SCREEN_H * 0.55);

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

  const pop = popFor(haircut.id);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  const handleTryOn = () => {
    // No photo yet → route to Create to add one (CTA relabels itself below).
    if (!sourceImageUri) {
      router.replace('/(tabs)');
      return;
    }
    router.push({ pathname: '/tryon', params: { id: haircut.id, imageUri: sourceImageUri } });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 130 }} showsVerticalScrollIndicator={false}>
        {/* Gallery pager */}
        <View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
            {haircut.referenceImages.map((img, i) => (
              <Image key={i} source={img} style={styles.galleryImage} />
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.backButton, { top: insets.top + 8 }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <View style={styles.dots}>
            {haircut.referenceImages.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.categoryTag, { backgroundColor: pop.bg }]}>
            <Text style={[styles.categoryText, { color: pop.ink }]}>{haircut.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{haircut.name}</Text>
          <Text style={styles.tagline}>{haircut.tagline}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={14} color={Colors.ink} />
              <Text style={styles.metaText}>{haircut.maintenance}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="cut-outline" size={14} color={Colors.ink} />
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
            <Ionicons name="bulb-outline" size={18} color={Colors.pop.limeInk} />
            <Text style={styles.tipText}>
              Screenshot the reference photos above and show them to your barber for the clearest result.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA — relabels when no photo is loaded yet */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
        {!sourceImageUri && (
          <Text style={styles.ctaHint}>Add a photo of yourself to preview this on you</Text>
        )}
        <TouchableOpacity style={styles.cta} onPress={handleTryOn} activeOpacity={0.9}>
          <Ionicons name={sourceImageUri ? 'color-wand' : 'camera'} size={20} color="#fff" />
          <Text style={styles.ctaText}>{sourceImageUri ? 'Try it on' : 'Add your photo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  center: { justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: { ...typography.body, color: Colors.text.secondary },
  link: { color: Colors.accent.primary, fontWeight: '800' },
  galleryImage: { width: SCREEN_W, height: GALLERY_H, resizeMode: 'cover', backgroundColor: Colors.background.secondary },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.ink,
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
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: 'rgba(23,19,15,0.3)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 20, borderColor: Colors.ink },
  body: { padding: spacing.lg },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  categoryText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  name: { ...typography.h1, marginTop: spacing.sm },
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
  barberText: { flex: 1, ...typography.body, fontSize: 15, lineHeight: 21 },
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
  ctaHint: { ...typography.small, textAlign: 'center', marginBottom: spacing.sm },
  cta: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.pop.purple,
    borderWidth: 2,
    borderColor: Colors.ink,
    ...softShadow,
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
});
