import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MultiAngleCapture from '../../components/MultiAngleCapture';
import AnalyzingOverlay from '../../components/AnalyzingOverlay';
import AIConsentModal, { useAIConsent } from '../../components/AIConsentModal';
import { useAnalyze } from '../../hooks/useAnalyze';
import { useHistory } from '../../hooks/useHistory';
import { CapturedImages } from '../../types';

// Bonus feature: the original "grade my cut" analysis, with no paywall gate.
export default function RateScreen() {
  const router = useRouter();
  const { analyze, isAnalyzing } = useAnalyze();
  const { addRating } = useHistory();
  const { needsConsent, hasConsent, updateConsent } = useAIConsent();
  const [captured, setCaptured] = useState<CapturedImages | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [pending, setPending] = useState<CapturedImages | null>(null);

  useEffect(() => {
    if (needsConsent) setShowConsent(true);
  }, [needsConsent]);

  const process = async (images: CapturedImages) => {
    setCaptured(images);
    const result = await analyze(images);
    if (result && !result.error) {
      await addRating(images.front, result);
    }
    router.push({
      pathname: '/results',
      params: {
        imageUri: images.front,
        result: JSON.stringify(
          result || {
            overall_level: null,
            scores: null,
            breakdown: 'Unable to analyze. Please try again.',
            verdict: 'Error occurred.',
          },
        ),
      },
    });
    setCaptured(null);
  };

  const handleComplete = (images: CapturedImages) => {
    if (hasConsent === false) {
      Alert.alert('AI Analysis Disabled', 'Enable AI analysis to rate your haircut?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable', onPress: () => { setPending(images); setShowConsent(true); } },
      ]);
      return;
    }
    if (needsConsent || hasConsent === null) {
      setPending(images);
      setShowConsent(true);
      return;
    }
    process(images);
  };

  const onAccept = () => {
    updateConsent(true);
    setShowConsent(false);
    if (pending) {
      const imgs = pending;
      setPending(null);
      process(imgs);
    }
  };

  const onDecline = () => {
    updateConsent(false);
    setShowConsent(false);
    setPending(null);
  };

  return (
    <View style={styles.container}>
      <MultiAngleCapture onComplete={handleComplete} />
      <AnalyzingOverlay images={captured} isVisible={isAnalyzing && !!captured} />
      <AIConsentModal visible={showConsent} onAccept={onAccept} onDecline={onDecline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
});
