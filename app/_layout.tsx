import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboarding } from '../hooks/useOnboarding';
import { useFirstScan } from '../hooks/useFirstScan';
import Onboarding from '../components/Onboarding';
import BeginScan from '../components/BeginScan';

type AppPhase = 'loading' | 'onboarding' | 'begin_scan' | 'main_app';

// TEMPORARY: Set to true to reset all app state for testing
// Set to false when done testing!
const RESET_APP_FOR_TESTING = false;

export default function RootLayout() {
  const [resetComplete, setResetComplete] = useState(!RESET_APP_FOR_TESTING);
  const { hasCompletedOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();
  const { hasCompletedFirstScan, isLoading: firstScanLoading, completeFirstScan } = useFirstScan();
  const [showBeginScan, setShowBeginScan] = useState(true);

  // Reset app state for testing (run once on app start)
  useEffect(() => {
    if (RESET_APP_FOR_TESTING && !resetComplete) {
      const resetAll = async () => {
        try {
          await AsyncStorage.clear(); // Clear ALL storage for fresh start
          console.log('🔄 App state reset for testing - restart app');
        } catch (e) {
          console.error('Reset error:', e);
        }
        setResetComplete(true);
      };
      resetAll();
    }
  }, [resetComplete]);

  const isLoading = onboardingLoading || firstScanLoading || !resetComplete;

  // Show loading screen while checking status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Onboarding onComplete={completeOnboarding} />
      </View>
    );
  }

  // Show BeginScan after onboarding, before first scan
  if (!hasCompletedFirstScan && showBeginScan) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <BeginScan
          onBeginScan={() => {
            setShowBeginScan(false);
            completeFirstScan();
          }}
        />
      </View>
    );
  }

  // Show main app
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0D0D' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="results"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="reveal"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
