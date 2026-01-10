import React from 'react';
import { View, StyleSheet, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RevealResults from '../components/RevealResults';

export default function RevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    imageUri: string;
    result: string;
    images: string;
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

  const handleInviteFriends = async () => {
    try {
      // TODO: Replace with actual App Store URL after app is published
      const appStoreUrl = 'https://apps.apple.com/app/fadecheck';
      const result = await Share.share({
        message: `Check out FadeCheck - AI-powered haircut analysis! Get instant feedback on your fade. Download it here: ${appStoreUrl}`,
        title: 'Try FadeCheck!',
      });

      if (result.action === Share.sharedAction) {
        // User shared successfully - unlock results
        router.replace({
          pathname: '/results',
          params: {
            imageUri: params.imageUri,
            images: params.images,
            result: params.result,
          },
        });
      }
      // If dismissed, do nothing - user can try again
    } catch (error) {
      Alert.alert('Error', 'Could not open share dialog. Please try again.');
    }
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
