import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRevenueCat } from '../../contexts/RevenueCatContext';
import Colors from '../../constants/Colors';
import { typography, spacing, borderRadius } from '../../constants/Styles';

export default function ProfileScreen() {
  const router = useRouter();
  const { isProUser } = useRevenueCat();
  const [historyCount, setHistoryCount] = useState(0);
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const history = await AsyncStorage.getItem('fadecheck_history');

      if (history) {
        const parsed = JSON.parse(history);
        if (Array.isArray(parsed)) {
          setHistoryCount(parsed.length);
          setTotalScans(parsed.length);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showBadge,
    badgeText,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showBadge?: boolean;
    badgeText?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon as any} size={22} color={Colors.accent.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showBadge && badgeText && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={Colors.gradient.blue}
              style={styles.avatarGradient}
            >
              <Ionicons name="person" size={32} color={Colors.text.primary} />
            </LinearGradient>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>FadeCheck User</Text>
            <View style={styles.statusContainer}>
              {isProUser ? (
                <View style={styles.proBadge}>
                  <Ionicons name="star" size={12} color={Colors.accent.primary} />
                  <Text style={styles.proText}>PRO</Text>
                </View>
              ) : (
                <Text style={styles.freeText}>Free Plan</Text>
              )}
            </View>
          </View>
          {!isProUser && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/paywall')}
            >
              <LinearGradient
                colors={Colors.gradient.button}
                style={styles.upgradeGradient}
              >
                <Text style={styles.upgradeText}>Upgrade</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{historyCount}</Text>
            <Text style={styles.statLabel}>In History</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{isProUser ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLabel}>Pro Status</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="Privacy, data, and preferences"
            onPress={() => router.push('/settings')}
          />
          <MenuItem
            icon="time-outline"
            title="History"
            subtitle="View past analyses"
            onPress={() => router.push('/(tabs)/history')}
            showBadge={historyCount > 0}
            badgeText={historyCount.toString()}
          />
        </View>

        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="FAQ and contact us"
            onPress={() => router.push('/support')}
          />
          <MenuItem
            icon="chatbubble-outline"
            title="Send Feedback"
            subtitle="Help us improve"
            onPress={() => router.push('/support')}
          />
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="information-circle-outline"
            title="About FadeCheck"
            subtitle="Version and legal info"
            onPress={() => router.push('/about')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
          />
          <MenuItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => router.push('/terms-of-service')}
          />
        </View>

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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  headerTitle: {
    ...typography.h1,
    color: Colors.text.primary,
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 69, 242, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  proText: {
    ...typography.small,
    color: Colors.accent.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  freeText: {
    ...typography.small,
    color: Colors.text.tertiary,
  },
  upgradeButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  upgradeGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  upgradeText: {
    ...typography.button,
    color: Colors.text.primary,
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: Colors.accent.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.small,
    color: Colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.glass.border,
    marginHorizontal: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: Colors.text.tertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(1, 69, 242, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  menuSubtitle: {
    ...typography.small,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...typography.small,
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
