import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const BACKGROUND = '#0A0A0F';
const CARD_BG = '#1A1A24';
const TEXT_PRIMARY = '#EDF1F5';
const TEXT_SECONDARY = '#9CA3AF';
const ACCENT_RED = '#EF4444';
const ACCENT_GREEN = '#22C55E';

export default function DebugScreen() {
  const [status, setStatus] = useState<string>('');

  const showStatus = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(''), 3000);
  };

  const resetOnboarding = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await AsyncStorage.removeItem('fadecheck_onboarding_completed');
      showStatus('Onboarding reset! Restart the app.');
      Alert.alert('Done', 'Onboarding reset. Close and reopen the app to see onboarding.');
    } catch (e) {
      showStatus('Error resetting onboarding');
    }
  };

  const resetFirstScan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await AsyncStorage.removeItem('fadecheck_first_scan_completed');
      showStatus('First scan reset! Restart the app.');
      Alert.alert('Done', 'First scan reset. Close and reopen the app.');
    } catch (e) {
      showStatus('Error resetting first scan');
    }
  };

  const resetProStatus = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await AsyncStorage.removeItem('fadecheck_pro_user');
      showStatus('Pro status reset!');
      Alert.alert('Done', 'Pro status removed. You will see the paywall again.');
    } catch (e) {
      showStatus('Error resetting pro status');
    }
  };

  const clearAllData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Clear All Data?',
      'This will reset everything: onboarding, history, pro status. The app will restart.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              showStatus('All data cleared!');
              Alert.alert(
                'Data Cleared',
                'Please close the app completely and reopen it to see the full flow from the beginning.',
                [{ text: 'OK' }]
              );
            } catch (e) {
              showStatus('Error clearing data');
            }
          },
        },
      ]
    );
  };

  const viewStorageKeys = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      const data = items.map(([key, value]) => `${key}: ${value}`).join('\n');
      Alert.alert('Storage Contents', data || 'Empty');
    } catch (e) {
      showStatus('Error reading storage');
    }
  };

  const DebugButton = ({
    title,
    subtitle,
    onPress,
    color = ACCENT_BLUE,
  }: {
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.button, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonTitle, { color }]}>{title}</Text>
      <Text style={styles.buttonSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Debug Panel</Text>
        <Text style={styles.subheader}>Reset app states for testing</Text>

        {status ? (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reset Individual States</Text>

          <DebugButton
            title="Reset Onboarding"
            subtitle="Show 5-step onboarding again"
            onPress={resetOnboarding}
          />

          <DebugButton
            title="Reset First Scan"
            subtitle="Show 'Begin Scan' screen again"
            onPress={resetFirstScan}
          />

          <DebugButton
            title="Reset Pro Status"
            subtitle="Show paywall again after scan"
            onPress={resetProStatus}
            color={ACCENT_GREEN}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <DebugButton
            title="Clear All Data"
            subtitle="Reset everything and restart app"
            onPress={clearAllData}
            color={ACCENT_RED}
          />

          <DebugButton
            title="View Storage"
            subtitle="See all saved data"
            onPress={viewStorageKeys}
            color={TEXT_SECONDARY}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How to test the full flow:</Text>
          <Text style={styles.infoText}>1. Tap "Clear All Data"</Text>
          <Text style={styles.infoText}>2. Close and reopen the app</Text>
          <Text style={styles.infoText}>3. You'll see: Onboarding - Begin Scan - Camera - Reveal Results - Paywall</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    letterSpacing: -1,
  },
  subheader: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    marginBottom: 24,
  },
  statusBar: {
    backgroundColor: CARD_BG,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  statusText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  button: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  buttonSubtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  infoSection: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 6,
    lineHeight: 20,
  },
});
