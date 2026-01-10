import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Paywall from '../components/Paywall';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    imageUri: string;
    result: string;
  }>();

  const handleClose = () => {
    router.back();
  };

  const handleUnlock = () => {
    // Purchase was successful - navigate to full results
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
