import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MultiAngleCapture from '../../components/MultiAngleCapture';
import AnalyzingOverlay from '../../components/AnalyzingOverlay';
import AIConsentModal, { useAIConsent } from '../../components/AIConsentModal';
import { useAnalyze } from '../../hooks/useAnalyze';
import { useHistory } from '../../hooks/useHistory';
import { useRevenueCat } from '../../contexts/RevenueCatContext';
import { CapturedImages } from '../../types';

export default function CameraScreen() {
  const router = useRouter();
  const { analyze, isAnalyzing } = useAnalyze();
  const { addToHistory } = useHistory();
  const { isProUser } = useRevenueCat();
  const { needsConsent, hasConsent, updateConsent, recheckConsent } = useAIConsent();
  const [capturedImages, setCapturedImages] = useState<CapturedImages | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingImages, setPendingImages] = useState<CapturedImages | null>(null);

  // Show consent modal on first use
  useEffect(() => {
    if (needsConsent) {
      setShowConsentModal(true);
    }
  }, [needsConsent]);

  const handleConsentAccept = () => {
    updateConsent(true);
    setShowConsentModal(false);
    // If there were pending images, process them now
    if (pendingImages) {
      processImages(pendingImages);
      setPendingImages(null);
    }
  };

  const handleConsentDecline = () => {
    updateConsent(false);
    setShowConsentModal(false);
    setPendingImages(null);
    Alert.alert(
      'AI Analysis Disabled',
      'You can enable AI analysis anytime in Settings > Privacy & Data.',
      [{ text: 'OK' }]
    );
  };

  const processImages = async (images: CapturedImages) => {
    setCapturedImages(images);

    const result = await analyze(images);

    if (result && !result.error) {
      // Use front image as the primary for history
      await addToHistory(images.front, result);

      // If not a pro user, show reveal screen first (paywall gate)
      if (!isProUser) {
        router.push({
          pathname: '/reveal',
          params: {
            imageUri: images.front,
            images: JSON.stringify(images),
            result: JSON.stringify(result),
          },
        });
      } else {
        // Pro user, go directly to full results
        router.push({
          pathname: '/results',
          params: {
            imageUri: images.front,
            images: JSON.stringify(images),
            result: JSON.stringify(result),
          },
        });
      }
    } else {
      // Error case - show results with error
      router.push({
        pathname: '/results',
        params: {
          imageUri: images.front,
          images: JSON.stringify(images),
          result: JSON.stringify(result || {
            overall_level: null,
            scores: null,
            breakdown: 'Unable to analyze. Please try again.',
            verdict: 'Error occurred.',
          }),
        },
      });
    }

    setCapturedImages(null);
  };

  const handleComplete = async (images: CapturedImages) => {
    // Check if user has given AI consent
    if (hasConsent === false) {
      // User explicitly declined consent - show settings prompt
      Alert.alert(
        'AI Analysis Disabled',
        'You need to enable AI analysis to analyze your haircut. Would you like to enable it now?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setPendingImages(images);
              setShowConsentModal(true);
            },
          },
        ]
      );
      return;
    }

    // If consent hasn't been given yet, show modal first
    if (needsConsent || hasConsent === null) {
      setPendingImages(images);
      setShowConsentModal(true);
      return;
    }

    // User has consent, proceed with analysis
    processImages(images);
  };

  return (
    <View style={styles.container}>
      <MultiAngleCapture onComplete={handleComplete} />
      <AnalyzingOverlay
        images={capturedImages}
        isVisible={isAnalyzing && !!capturedImages}
      />
      <AIConsentModal
        visible={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
});
