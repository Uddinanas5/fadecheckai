// Create — the front door. Photo in, personalized styles out.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { spacing, borderRadius, typography, softShadow } from '../../constants/Styles';
import { Screen, PopButton, OutlineButton } from '../../components/ui';
import AnalyzingOverlay from '../../components/AnalyzingOverlay';
import AIConsentModal, { useAIConsent } from '../../components/AIConsentModal';
import { analyzeSinglePhoto } from '../../services/openai';

const STEPS = [
  {
    icon: 'camera' as const,
    title: 'Add your photo',
    desc: 'A clear, front-facing selfie works best',
    color: Colors.pop.lime,
    ink: Colors.pop.limeInk,
  },
  {
    icon: 'sparkles' as const,
    title: 'Get matched styles',
    desc: 'We suggest cuts that suit your features',
    color: Colors.pop.pink,
    ink: '#FFFFFF',
  },
  {
    icon: 'color-wand' as const,
    title: 'Try it on',
    desc: 'See a preview of you with the new look',
    color: Colors.pop.yellow,
    ink: Colors.pop.yellowInk,
  },
];

export default function CreateScreen() {
  const router = useRouter();
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
    setPreviewUri(uri);

    const [result] = await Promise.all([
      analyzeSinglePhoto(uri),
      new Promise((r) => setTimeout(r, 1800)),
    ]);

    setIsAnalyzing(false);
    setPreviewUri(null);

    // The recommender falls back gracefully when analysis is unavailable.
    router.push({
      pathname: '/recommendations',
      params: { imageUri: uri, result: JSON.stringify(result) },
    });
  };

  const handlePhoto = (uri: string) => {
    if (hasConsent === false) {
      Alert.alert('AI Analysis Disabled', 'Enable AI analysis to get personalized style recommendations?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable', onPress: () => { setPendingUri(uri); setShowConsent(true); } },
      ]);
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
      if (!result.canceled && result.assets[0]?.uri) handlePhoto(result.assets[0].uri);
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
      if (!result.canceled && result.assets[0]?.uri) handlePhoto(result.assets[0].uri);
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
    <>
      <Screen>
        {/* Wordmark */}
        <View style={styles.brandRow}>
          <View style={styles.brandDot}>
            <Ionicons name="cut" size={15} color="#fff" />
          </View>
          <Text style={styles.brand}>fadecheck</Text>
        </View>

        {/* Hero — AI-generated realistic-cartoon character */}
        <View style={styles.hero}>
          <Image source={require('../../assets/art/hero-create.png')} style={styles.heroImg} />
          <Text style={styles.starA}>✦</Text>
          <Text style={styles.starB}>✦</Text>
        </View>

        <Text style={styles.title}>Find your{'\n'}next haircut ✂️</Text>
        <Text style={styles.subtitle}>
          Snap a selfie, get styles that actually suit you, and see the look on your face before
          the barber touches it.
        </Text>

        {/* Steps — color-block sticker rows */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={[styles.step, { backgroundColor: s.color }]}>
              <View style={styles.stepIcon}>
                <Ionicons name={s.icon} size={22} color={s.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: s.ink }]}>{s.title}</Text>
                <Text style={[styles.stepDesc, { color: s.ink }]}>{s.desc}</Text>
              </View>
              <Text style={[styles.stepNum, { color: s.ink }]}>{i + 1}</Text>
            </View>
          ))}
        </View>

        <PopButton label="Take a photo" icon="camera" onPress={takePhoto} style={{ marginBottom: spacing.md }} />
        <OutlineButton label="Choose from library" icon="images-outline" onPress={pickFromLibrary} />

        <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/(tabs)/styles')} activeOpacity={0.7}>
          <Text style={styles.ghostText}>or browse all styles</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.accent.primary} />
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Previews are AI-generated and for inspiration only — results may vary. Bring your
          favourites to a real barber.
        </Text>
      </Screen>

      <AnalyzingOverlay images={null} singleImage={previewUri} isVisible={isAnalyzing && !!previewUri} />
      <AIConsentModal visible={showConsent} onAccept={onConsentAccept} onDecline={onConsentDecline} />
    </>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.pop.purple,
    borderWidth: 2,
    borderColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  brand: { fontSize: 20, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },

  hero: {
    marginTop: spacing.lg,
    height: 260,
    borderRadius: borderRadius.xxl,
    backgroundColor: Colors.pop.yellow,
    borderWidth: 2,
    borderColor: Colors.ink,
    overflow: 'hidden',
    ...softShadow,
  },
  heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  starA: { position: 'absolute', top: 14, right: 20, fontSize: 26, color: Colors.pop.pink },
  starB: { position: 'absolute', bottom: 16, left: 18, fontSize: 18, color: Colors.pop.purple },

  title: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.4,
    color: Colors.ink,
    marginTop: spacing.lg,
    lineHeight: 42,
  },
  subtitle: { ...typography.bodySecondary, fontSize: 15, marginTop: spacing.sm, marginBottom: spacing.lg },

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
  stepDesc: { fontSize: 13, fontWeight: '600', marginTop: 2, opacity: 0.75 },
  stepNum: { fontSize: 26, fontWeight: '800', opacity: 0.35 },

  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  ghostText: { color: Colors.accent.primary, fontSize: 15, fontWeight: '800' },
  disclaimer: { ...typography.small, textAlign: 'center', lineHeight: 16, paddingHorizontal: spacing.md },
});
