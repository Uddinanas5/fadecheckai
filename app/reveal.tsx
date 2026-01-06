import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RevealResults from '../components/RevealResults';

export default function RevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    imageUri: string;
    result: string;
  }>();

  const handleGetPro = () => {
    // Navigate to paywall, passing along the result data
    router.push({
      pathname: '/paywall',
      params: {
        imageUri: params.imageUri,
        result: params.result,
      },
    });
  };

  const handleInviteFriends = () => {
    // TODO: Implement invite friends flow
    // For now, just go to results
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
      <RevealResults
        imageUri={params.imageUri || ''}
        onGetPro={handleGetPro}
        onInviteFriends={handleInviteFriends}
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
