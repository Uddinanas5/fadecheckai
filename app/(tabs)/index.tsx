import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CameraView from '../../components/CameraView';
import AnalyzingOverlay from '../../components/AnalyzingOverlay';
import Colors from '../../constants/Colors';
import { useAnalyze } from '../../hooks/useAnalyze';
import { useHistory } from '../../hooks/useHistory';

export default function CameraScreen() {
  const router = useRouter();
  const { analyze, isAnalyzing } = useAnalyze();
  const { addToHistory } = useHistory();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = async (uri: string) => {
    setCapturedImage(uri);

    const result = await analyze(uri);

    if (result && !result.error) {
      await addToHistory(uri, result);
      router.push({
        pathname: '/results',
        params: {
          imageUri: uri,
          result: JSON.stringify(result),
        },
      });
    } else {
      // Still navigate to results to show error
      router.push({
        pathname: '/results',
        params: {
          imageUri: uri,
          result: JSON.stringify(result || {
            overall_score: null,
            scores: null,
            score_label: null,
            breakdown: 'Unable to analyze. Please try again.',
            verdict: 'Error occurred.',
          }),
        },
      });
    }

    setCapturedImage(null);
  };

  return (
    <View style={styles.container}>
      <CameraView onCapture={handleCapture} />
      <AnalyzingOverlay
        imageUri={capturedImage || ''}
        isVisible={isAnalyzing && !!capturedImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});
