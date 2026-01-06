import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Paywall from '../components/Paywall';
import { useFirstScan } from '../hooks/useFirstScan';

export default function PaywallScreen() {
  const router = useRouter();
  const { setProStatus } = useFirstScan();
  const params = useLocalSearchParams<{
    imageUri: string;
    result: string;
  }>();

  const handleClose = () => {
    // Go back to main screen
    router.back();
  };

  const handleUnlock = async () => {
    // TODO: Integrate with RevenueCat for actual purchase
    // For now, just unlock and show results
    await setProStatus(true);

    // Navigate to full results
    router.replace({
      pathname: '/results',
      params: {
        imageUri: params.imageUri,
        result: params.result,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Paywall
        onClose={handleClose}
        onUnlock={handleUnlock}
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
