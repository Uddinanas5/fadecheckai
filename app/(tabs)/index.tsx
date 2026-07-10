import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { spacing, borderRadius, typography, softShadow } from '../../constants/Styles';
import AnalyzingOverlay from '../../components/AnalyzingOverlay';
import AIConsentModal, { useAIConsent } from '../../components/AIConsentModal';
import { analyzeSinglePhoto } from '../../services/openai';

const STEPS = [
  { icon: 'camera', title: 'Add your photo', desc: 'A clear, front-facing selfie works best', color: Colors.pop.lime, ink: Colors.pop.limeInk },
  { icon: 'sparkles', title: 'Get matched styles', desc: 'We suggest cuts that suit your features', color: Colors.pop.pink, ink: '#fff' },
  { icon: 'color-wand', title: 'Try it on', desc: 'See a preview of you with the new look', color: Colors.pop.yellow, ink: Colors.pop.yellowInk },
] as const;

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { needsConsent, hasConsent, updateConsent } = useAIConsent();
  const [showConsent, setShowConsent] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (needsConsent) setShowConsent(true);
  }, [needsConsent]);

  const proceed = async (uri: string) => {
    setIsAnalyzing(true);
    // Show the analyzing overlay against this single photo.
    setPreviewUri(uri);

    const [result] = await Promise.all([
      analyzeSinglePhoto(uri),
      new Promise((r) => setTimeout(r, 1800)),
    ]);

    setIsAnalyzing(false);
    setPreviewUri(null);

    // Proceed to recommendations regardless — the recommender falls back to a
    // sensible default ordering when analysis is unavailable.
    router.push({
      pathname: '/recommendations',
      params: { imageUri: uri, result: JSON.stringify(result) },
    });
  };

  const handlePhoto = async (uri: string) => {
    if (hasConsent === false) {
      Alert.alert(
        'AI Analysis Disabled',
        'Enable AI analysis to get personalized style recommendations?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => { setPendingUri(uri); setShowConsent(true); } },
        ],
      );
      return;
    }
    if (needsConsent || hasConsent === null) {
      setPendingUri(uri);
      setShowConsent(true);
      return;
    }
    proceed(uri);
  };

  const pickFromLibrary = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        handlePhoto(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Library pick error', e);
    }
  };

  const takePhoto = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera access needed', 'Please allow camera access to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        handlePhoto(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Camera error', e);
    }
  };

  const onConsentAccept = () => {
    updateConsent(true);
    setShowConsent(false);
    if (pendingUri) {
      const uri = pendingUri;
      setPendingUri(null);
      proceed(uri);
    }
  };

  const onConsentDecline = () => {
    updateConsent(false);
    setShowConsent(false);
    setPendingUri(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Wordmark */}
        <View style={styles.brandRow}>
          <View style={styles.brandDot}>
            <Ionicons name="cut" size={16} color="#fff" />
          </View>
          <Text style={styles.brand}>fadecheck</Text>
        </View>

        {/* Hero art slot — AI cartoon illustration drops in here */}
        <View style={styles.hero}>
          <View style={styles.heroStars}>
            <Text style={styles.starA}>✦</Text>
            <Text style={styles.starB}>✦</Text>
          </View>
          <View style={styles.heroArt}>
            <Ionicons name="happy" size={72} color={Colors.pop.purpleInk} />
            <Text style={styles.heroArtLabel}>your cartoon hero</Text>
          </View>
        </View>

        <Text style={styles.title}>Find your{'\n'}next haircut ✂️</Text>
        <Text style={styles.subtitle}>
          Snap a selfie, get styles that actually suit you, and see the look on your face before
          the barber touches it.
        </Text>

        {/* Steps as colorful sticker rows */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={[styles.step, { backgroundColor: s.color }]}>
              <View style={styles.stepIcon}>
                <Ionicons name={s.icon as any} size={22} color={s.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: s.ink }]}>{s.title}</Text>
                <Text style={[styles.stepDesc, { color: s.ink, opacity: 0.75 }]}>{s.desc}</Text>
              </View>
              <Text style={[styles.stepNum, { color: s.ink, opacity: 0.35 }]}>{i + 1}</Text>
            </View>
          ))}
        </View>

        {/* Primary chunky pill */}
        <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto} activeOpacity={0.9}>
          <Ionicons name="camera" size={22} color="#fff" />
          <Text style={styles.primaryText}>Take a photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromLibrary} activeOpacity={0.85}>
          <Ionicons name="images-outline" size={20} color={Colors.ink} />
          <Text style={styles.secondaryText}>Choose from library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/(tabs)/styles')} activeOpacity={0.7}>
          <Text style={styles.ghostText}>or browse all styles</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.accent.primary} />
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Previews are AI-generated and for inspiration only — results may vary. Bring your
          favourites to a real barber.
        </Text>
      </ScrollView>

      <AnalyzingOverlay
        images={null}
        singleImage={previewUri}
        isVisible={isAnalyzing && !!previewUri}
      />
      <AIConsentModal visible={showConsent} onAccept={onConsentAccept} onDecline={onConsentDecline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.pop.purple,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  brand: { fontSize: 20, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },

  hero: {
    marginTop: spacing.lg,
    height: 220,
    borderRadius: borderRadius.xxl,
    backgroundColor: Colors.pop.lime,
    borderWidth: 2,
    borderColor: Colors.ink,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...softShadow,
  },
  heroStars: { ...StyleSheet.absoluteFillObject },
  starA: { position: 'absolute', top: 18, right: 26, fontSize: 26, color: Colors.pop.purple },
  starB: { position: 'absolute', bottom: 22, left: 24, fontSize: 18, color: Colors.pop.pink },
  heroArt: { alignItems: 'center', gap: 8 },
  heroArtLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.pop.purpleInk,
    opacity: 0.6,
  },

  title: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.4,
    color: Colors.ink,
    marginTop: spacing.lg,
    lineHeight: 42,
  },
  subtitle: {
    ...typography.bodySecondary,
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  steps: { gap: spacing.sm, marginBottom: spacing.lg },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  stepDesc: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  stepNum: { fontSize: 26, fontWeight: '800' },

  primaryBtn: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.pop.purple,
    borderWidth: 2,
    borderColor: Colors.ink,
    marginBottom: spacing.md,
    ...softShadow,
  },
  primaryText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  secondaryBtn: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: Colors.background.secondary,
  },
  secondaryText: { color: Colors.ink, fontSize: 16, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  ghostText: { color: Colors.accent.primary, fontSize: 15, fontWeight: '800' },
  disclaimer: {
    ...typography.small,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
});
