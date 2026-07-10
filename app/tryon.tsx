import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { spacing, borderRadius, typography, softShadow } from '../constants/Styles';
import { getHaircutById } from '../constants/haircuts';
import { useTryOn } from '../hooks/useTryOn';
import { useHistory } from '../hooks/useHistory';

export default function TryOnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; imageUri: string }>();
  const haircut = getHaircutById(params.id);
  const sourceImageUri = params.imageUri;

  const { status, result, error, run } = useTryOn();
  const { addTryOn } = useHistory();
  const [showBefore, setShowBefore] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedRef = useRef(false);

  // Kick off generation once.
  useEffect(() => {
    if (!haircut || !sourceImageUri) return;
    run({ sourceImageUri, haircut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to history once, when done.
  useEffect(() => {
    if (status === 'done' && result && !savedRef.current) {
      savedRef.current = true;
      addTryOn(result);
    }
  }, [status, result, addTryOn]);

  if (!haircut || !sourceImageUri) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.text.secondary} />
        <Text style={styles.errText}>Missing photo or style.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.link}>Start over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayedUri = showBefore ? sourceImageUri : result?.generatedImageUri ?? sourceImageUri;

  const handleSave = async () => {
    if (!result) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo access to save this preview.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(result.generatedImageUri);
      setSaved(true);
      Alert.alert('Saved', 'The preview was saved to your photos.');
    } catch (e) {
      Alert.alert('Could not save', 'Something went wrong saving the image.');
    }
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      const can = await Sharing.isAvailableAsync();
      if (!can) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(result.generatedImageUri);
    } catch (e) {
      // user cancelled or error — no-op
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {haircut.name}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.stage}>
        {status === 'generating' && (
          <View style={styles.center}>
            <View style={styles.loaderRing}>
              <ActivityIndicator size="large" color={Colors.accent.primary} />
            </View>
            <Text style={styles.loadingTitle}>Creating your preview…</Text>
            <Text style={styles.loadingSub}>Applying the {haircut.name} to your photo</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.text.secondary} />
            <Text style={styles.loadingTitle}>Preview failed</Text>
            <Text style={styles.loadingSub}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => run({ sourceImageUri, haircut })}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'done' && result && (
          <>
            <View style={styles.imageWrap}>
              <Image source={{ uri: displayedUri }} style={styles.image} />
              {result.demo && (
                <View style={styles.demoBadge}>
                  <Ionicons name="flask-outline" size={12} color="#fff" />
                  <Text style={styles.demoText}>Demo preview</Text>
                </View>
              )}
              <View style={styles.beforeAfterBadge}>
                <Text style={styles.beforeAfterText}>{showBefore ? 'BEFORE' : 'AFTER'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggle}
              onPressIn={() => setShowBefore(true)}
              onPressOut={() => setShowBefore(false)}
              activeOpacity={0.9}
            >
              <Ionicons name="eye-outline" size={18} color={Colors.accent.secondary} />
              <Text style={styles.toggleText}>Hold to compare with original</Text>
            </TouchableOpacity>

            {result.demo && (
              <Text style={styles.demoNote}>
                This is a demo — connect the try-on service to generate a real AI preview. See
                supabase/functions/tryon/README.md.
              </Text>
            )}
          </>
        )}
      </View>

      {status === 'done' && result && (
        <View style={[styles.actions, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryAction} onPress={handleSave}>
              <Ionicons
                name={saved ? 'checkmark' : 'download-outline'}
                size={20}
                color={Colors.text.primary}
              />
              <Text style={styles.secondaryActionText}>{saved ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={Colors.text.primary} />
              <Text style={styles.secondaryActionText}>Share</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.replace('/(tabs)/styles')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={Colors.gradient.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGradient}
            >
              <Ionicons name="color-wand" size={20} color="#fff" />
              <Text style={styles.primaryText}>Try another style</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  errText: { ...typography.body, color: Colors.text.secondary },
  link: { color: Colors.accent.primary, fontWeight: '600', marginTop: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center' },
  stage: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  loaderRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(122,92,255,0.3)',
    backgroundColor: 'rgba(122,92,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loadingTitle: { ...typography.h2, textAlign: 'center', marginTop: spacing.sm },
  loadingSub: { ...typography.bodySecondary, fontSize: 14, textAlign: 'center', marginTop: 4 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  imageWrap: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.background.tertiary,
    borderWidth: 2,
    borderColor: Colors.ink,
    alignSelf: 'center',
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: '82%',
    ...softShadow,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  demoBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5,5,8,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  demoText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  beforeAfterBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: Colors.pop.purple,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  beforeAfterText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  toggleText: { color: Colors.accent.secondary, fontSize: 14, fontWeight: '600' },
  demoNote: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.ink,
  },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  secondaryAction: {
    flex: 1,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: Colors.background.secondary,
  },
  secondaryActionText: { color: Colors.ink, fontSize: 15, fontWeight: '800' },
  primaryAction: {
    height: 58,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.ink,
    ...softShadow,
  },
  primaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
