import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { typography, spacing, borderRadius } from '../constants/Styles';

const AI_CONSENT_KEY = 'fadecheck_ai_consent';
const AI_CONSENT_SHOWN_KEY = 'fadecheck_ai_consent_shown';

interface AIConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function AIConsentModal({
  visible,
  onAccept,
  onDecline,
}: AIConsentModalProps) {
  const router = useRouter();

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(AI_CONSENT_KEY, 'true');
      await AsyncStorage.setItem(AI_CONSENT_SHOWN_KEY, 'true');
      onAccept();
    } catch (error) {
      console.error('Error saving AI consent:', error);
      onAccept();
    }
  };

  const handleDecline = async () => {
    try {
      await AsyncStorage.setItem(AI_CONSENT_KEY, 'false');
      await AsyncStorage.setItem(AI_CONSENT_SHOWN_KEY, 'true');
      onDecline();
    } catch (error) {
      console.error('Error saving AI consent:', error);
      onDecline();
    }
  };

  const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletContainer}>
      <Ionicons name="checkmark-circle" size={18} color={Colors.accent.primary} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={32} color={Colors.accent.primary} />
              </View>
              <Text style={styles.title}>Before we work our magic</Text>
              <Text style={styles.subtitle}>
                Quick heads-up on how your photo is used — please confirm
              </Text>
            </View>

            <ScrollView
              // RN-web's Modal focus-traps onto this ScrollView; kill the
              // browser focus ring it draws (native platforms ignore this).
              style={[styles.scrollContent, { outlineWidth: 0, outlineStyle: 'none' } as any]}
              showsVerticalScrollIndicator={false}
            >
              {/* Self-improvement agreement */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>I understand that:</Text>
                <BulletPoint>
                  This app is for personal self-improvement only
                </BulletPoint>
                <BulletPoint>
                  I will only analyze photos of my own haircuts
                </BulletPoint>
                <BulletPoint>
                  Results are AI-generated suggestions, not professional advice
                </BulletPoint>
              </View>

              {/* What happens */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What happens when you scan:</Text>
                <BulletPoint>
                  Your photos are securely sent to our AI for analysis
                </BulletPoint>
                <BulletPoint>
                  AI provides personalized feedback and grooming tips
                </BulletPoint>
                <BulletPoint>
                  Results are returned to your device and stored locally
                </BulletPoint>
              </View>

              {/* Data handling */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How your data is handled:</Text>
                <BulletPoint>
                  Photos are transmitted securely using encryption (HTTPS)
                </BulletPoint>
                <BulletPoint>
                  Images are processed in real-time and never permanently stored
                </BulletPoint>
                <BulletPoint>
                  Analysis results are returned and the original images are discarded
                </BulletPoint>
                <BulletPoint>
                  Your history stays only on your device
                </BulletPoint>
              </View>

              {/* Important note */}
              <View style={styles.noteBox}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={Colors.accent.secondary}
                />
                <Text style={styles.noteText}>
                  You can change this setting anytime in Settings {'->'} Privacy & Data.
                </Text>
              </View>

              {/* Privacy links */}
              <View style={styles.linksContainer}>
                <Text style={styles.linksText}>By continuing, you agree to our</Text>
                <View style={styles.linksRow}>
                  <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.linksText}> and </Text>
                  <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
                    <Text style={styles.linkText}>Terms of Service</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAccept}
              >
                <LinearGradient
                  colors={Colors.gradient.button}
                  style={styles.acceptGradient}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.text.primary}
                  />
                  <Text style={styles.acceptText}>I Agree, Continue</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={handleDecline}
              >
                <Text style={styles.declineText}>No Thanks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// Hook to check if AI consent is needed
export function useAIConsent() {
  const [needsConsent, setNeedsConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const [consentShown, consentValue] = await Promise.all([
        AsyncStorage.getItem(AI_CONSENT_SHOWN_KEY),
        AsyncStorage.getItem(AI_CONSENT_KEY),
      ]);

      // If consent dialog was never shown, we need to show it
      if (consentShown !== 'true') {
        setNeedsConsent(true);
        setHasConsent(null);
      } else {
        setNeedsConsent(false);
        setHasConsent(consentValue === 'true');
      }
    } catch (error) {
      console.error('Error checking AI consent:', error);
      setNeedsConsent(true);
      setHasConsent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsent = (value: boolean) => {
    setHasConsent(value);
    setNeedsConsent(false);
  };

  return {
    needsConsent,
    hasConsent,
    isLoading,
    updateConsent,
    recheckConsent: checkConsent,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '90%',
  },
  modalContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(122, 92, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  scrollContent: {
    maxHeight: 350,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  bulletText: {
    ...typography.body,
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    marginLeft: spacing.sm,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noteText: {
    ...typography.body,
    color: Colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: spacing.sm,
  },
  linksContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  linksText: {
    ...typography.small,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  linkText: {
    ...typography.small,
    color: Colors.accent.primary,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  acceptButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  acceptText: {
    ...typography.button,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  declineButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  declineText: {
    ...typography.body,
    color: Colors.text.tertiary,
  },
});
