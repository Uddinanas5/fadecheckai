import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { spacing } from '../constants/Styles';
import { AnalysisResult } from '../types';
import ResultsDisplay from '../components/ResultsDisplay';

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    imageUri: string;
    result: string;
    fromHistory?: string;
  }>();

  const imageUri = params.imageUri;
  const result: AnalysisResult = params.result ? JSON.parse(params.result) : null;
  const fromHistory = params.fromHistory === 'true';

  const handleBack = () => {
    if (fromHistory) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleNewScan = () => {
    router.replace('/(tabs)');
  };

  if (!imageUri || !result) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.text.secondary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-down" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ResultsDisplay
        imageUri={imageUri}
        result={result}
        onNewScan={handleNewScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
