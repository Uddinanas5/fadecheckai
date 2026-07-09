import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { spacing, borderRadius, typography } from '../../constants/Styles';
import AnalyzingOverlay from '../../components/AnalyzingOverlay';
import AIConsentModal, { useAIConsent } from '../../components/AIConsentModal';
import { analyzeSinglePhoto } from '../../services/openai';
import { CapturedImages } from '../../types';

const STEPS = [
  { icon: 'camera', title: 'Add your photo', desc: 'A clear, front-facing selfie works best' },
  { icon: 'sparkles', title: 'Get matched styles', desc: 'We suggest cuts that suit your features' },
  { icon: 'color-wand', title: 'Try it on', desc: 'See a preview of you with the new look' },
] as const;

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { needsConsent, hasConsent, updateConsent } = useAIConsent();
  const [showConsent, setShowConsent] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImages, setPreviewImages] = useState<CapturedImages | null>(null);

  useEffect(() => {
    if (needsConsent) setShowConsent(true);
  }, [needsConsent]);

  const proceed = async (uri: string) => {
    setIsAnalyzing(true);
    // Show the analyzing overlay against this image.
    setPreviewImages({ front: uri, leftSide: uri, rightSide: uri, back: uri });

    const [result] = await Promise.all([
      analyzeSinglePhoto(uri),
      new Promise((r) => setTimeout(r, 1800)),
    ]);

    setIsAnalyzing(false);
    setPreviewImages(null);

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
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>FADECHECK</Text>
        <Text style={styles.title}>See it before{'\n'}you cut it</Text>
        <Text style={styles.subtitle}>
          Upload a photo, get haircut ideas that suit you, and preview the look before you sit
          in the chair.
        </Text>

        <View style={styles.stepsCard}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={[styles.step, i < STEPS.length - 1 && styles.stepDivider]}>
              <View style={styles.stepIcon}>
                <Ionicons name={s.icon as any} size={20} color={Colors.accent.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto} activeOpacity={0.9}>
          <LinearGradient colors={Colors.gradient.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGradient}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.primaryText}>Take a photo</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromLibrary} activeOpacity={0.85}>
          <Ionicons name="images-outline" size={20} color={Colors.text.primary} />
          <Text style={styles.secondaryText}>Choose from library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/(tabs)/styles')} activeOpacity={0.7}>
          <Text style={styles.ghostText}>or browse all styles</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.accent.primary} />
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Previews are AI-generated and for inspiration only — results may vary. Bring your
          reference photos to a professional barber.
        </Text>
      </ScrollView>

      <AnalyzingOverlay images={previewImages} isVisible={isAnalyzing && !!previewImages} />
      <AIConsentModal visible={showConsent} onAccept={onConsentAccept} onDecline={onConsentDecline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  eyebrow: { ...typography.label, color: Colors.accent.secondary, marginTop: spacing.md },
  title: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: Colors.text.primary,
    marginTop: spacing.sm,
    lineHeight: 44,
  },
  subtitle: {
    ...typography.bodySecondary,
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  stepsCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  stepDivider: { borderBottomWidth: 1, borderBottomColor: Colors.glass.border },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(1,69,242,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: { ...typography.h3, fontSize: 16 },
  stepDesc: { ...typography.caption, fontSize: 13, marginTop: 2 },
  stepNum: { ...typography.h2, color: 'rgba(255,255,255,0.12)', fontWeight: '800' },
  primaryBtn: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md },
  primaryGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: -0.3 },
  secondaryBtn: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.background.secondary,
  },
  secondaryText: { color: Colors.text.primary, fontSize: 16, fontWeight: '600' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  ghostText: { color: Colors.accent.primary, fontSize: 15, fontWeight: '600' },
  disclaimer: {
    ...typography.small,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
});
