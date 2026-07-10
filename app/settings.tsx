import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRevenueCat } from '../contexts/RevenueCatContext';
import { useAuth } from '../hooks/useAuth';
import Colors from '../constants/Colors';
import { typography, spacing, borderRadius } from '../constants/Styles';

const AI_CONSENT_KEY = 'fadecheck_ai_consent';
const NOTIFICATIONS_KEY = 'fadecheck_notifications_enabled';

export default function SettingsScreen() {
  const router = useRouter();
  const { isProUser } = useRevenueCat();
  const { deleteAccount, isAuthenticated, loading: authLoading } = useAuth();
  const [aiConsentEnabled, setAiConsentEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [aiConsent, notifications, history] = await Promise.all([
        AsyncStorage.getItem(AI_CONSENT_KEY),
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
        AsyncStorage.getItem('fadecheck_history'),
      ]);

      setAiConsentEnabled(aiConsent !== 'false');
      setNotificationsEnabled(notifications === 'true');

      if (history) {
        const parsed = JSON.parse(history);
        setHistoryCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleAiConsentToggle = async (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Disable AI Analysis?',
        'If you disable AI consent, the app will not be able to analyze your haircut photos. You can re-enable this at any time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.setItem(AI_CONSENT_KEY, 'false');
              setAiConsentEnabled(false);
            },
          },
        ]
      );
    } else {
      await AsyncStorage.setItem(AI_CONSENT_KEY, 'true');
      setAiConsentEnabled(true);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, value ? 'true' : 'false');
    setNotificationsEnabled(value);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All History?',
      'This will permanently delete all your haircut analysis history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('fadecheck_history');
            setHistoryCount(0);
            Alert.alert('Done', 'Your history has been cleared.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete All Data?',
      'This will permanently delete all your data including history, preferences, and any account information. If you signed in with Apple, your Apple Sign In credentials will also be revoked. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Use the deleteAccount function which handles:
              // 1. Apple Sign In token revocation (Guideline 5.1.1(v))
              // 2. Supabase sign out
              // 3. AsyncStorage clear
              const result = await deleteAccount();

              if (result.success) {
                Alert.alert(
                  'Data Deleted',
                  'All your data has been deleted. The app will now reset.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to delete data. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Your Data',
      'To request a copy of your data, please email us at fadecheck.app@gmail.com with the subject "Data Export Request".',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Email',
          onPress: () => Linking.openURL('mailto:fadecheck.app@gmail.com?subject=Data%20Export%20Request'),
        },
      ]
    );
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingsRow = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    destructive,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.iconContainer, destructive && styles.iconContainerDestructive]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={destructive ? Colors.accent.tertiary : Colors.accent.primary}
        />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDestructive]}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Subscription">
          <SettingsRow
            icon={isProUser ? "checkmark-circle" : "star-outline"}
            title={isProUser ? "FadeCheck Pro" : "Free Plan"}
            subtitle={isProUser ? "You have access to all features" : "Upgrade to unlock all features"}
            onPress={() => router.push('/customer-center')}
          />
        </SettingsSection>

        <SettingsSection title="Privacy & Data">
          <SettingsRow
            icon="sparkles"
            title="AI Analysis Consent"
            subtitle="Allow photos to be analyzed by AI"
            rightElement={
              <Switch
                value={aiConsentEnabled}
                onValueChange={handleAiConsentToggle}
                trackColor={{ false: Colors.background.tertiary, true: Colors.accent.primary }}
                thumbColor={Colors.text.primary}
              />
            }
          />
          <SettingsRow
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive updates and reminders"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: Colors.background.tertiary, true: Colors.accent.primary }}
                thumbColor={Colors.text.primary}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Your Data">
          <SettingsRow
            icon="time-outline"
            title="Analysis History"
            subtitle={`${historyCount} ${historyCount === 1 ? 'item' : 'items'} stored locally`}
            onPress={() => router.push('/(tabs)/history')}
          />
          <SettingsRow
            icon="download-outline"
            title="Export Your Data"
            subtitle="Request a copy of your data"
            onPress={handleExportData}
          />
          <SettingsRow
            icon="trash-outline"
            title="Clear History"
            subtitle="Delete all analysis history"
            onPress={handleClearHistory}
            destructive
          />
        </SettingsSection>

        <SettingsSection title="Legal">
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => router.push('/privacy-policy')}
          />
          <SettingsRow
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Rules for using FadeCheck"
            onPress={() => router.push('/terms-of-service')}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsRow
            icon="trash-outline"
            title={isDeleting ? "Deleting..." : "Delete All Data"}
            subtitle={isDeleting ? "Please wait..." : "Permanently delete account and data"}
            onPress={isDeleting ? undefined : handleDeleteAccount}
            destructive
            rightElement={isDeleting ? <ActivityIndicator color={Colors.accent.tertiary} /> : undefined}
          />
        </SettingsSection>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: Colors.text.tertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionContent: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(122, 92, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconContainerDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  rowTitleDestructive: {
    color: Colors.accent.tertiary,
  },
  rowSubtitle: {
    ...typography.small,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
