import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRevenueCat } from '../contexts/RevenueCatContext';
import Colors from '../constants/Colors';
import { spacing, borderRadius } from '../constants/Styles';

const ACCENT_BLUE = '#0145F2';

export default function CustomerCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    customerInfo,
    isProUser,
    isPurchasing,
    restorePurchases,
  } = useRevenueCat();

  const handleManageSubscription = () => {
    // This opens the native subscription management on iOS
    Alert.alert(
      'Manage Subscription',
      'To manage your subscription, go to Settings > Apple ID > Subscriptions on your device.',
      [{ text: 'OK' }]
    );
  };

  const handleRestorePurchases = async () => {
    await restorePurchases();
  };

  // Get subscription details
  const getSubscriptionInfo = () => {
    if (!customerInfo || !isProUser) return null;

    const entitlement = customerInfo.entitlements.active['Fadecheck Pro'];
    if (!entitlement) return null;

    return {
      productId: entitlement.productIdentifier,
      expirationDate: entitlement.expirationDate
        ? new Date(entitlement.expirationDate).toLocaleDateString()
        : 'Lifetime',
      willRenew: entitlement.willRenew,
    };
  };

  const subscriptionInfo = getSubscriptionInfo();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            {isProUser ? (
              <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
            ) : (
              <Ionicons name="close-circle" size={48} color={Colors.text.secondary} />
            )}
          </View>
          <Text style={styles.statusTitle}>
            {isProUser ? 'FadeCheck Pro Active' : 'Free Plan'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isProUser
              ? 'You have access to all premium features'
              : 'Upgrade to unlock all features'}
          </Text>
        </View>

        {/* Subscription Details */}
        {subscriptionInfo && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Subscription Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: '#22C55E' }]}>Active</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {subscriptionInfo.willRenew ? 'Renews' : 'Expires'}
              </Text>
              <Text style={styles.detailValue}>{subscriptionInfo.expirationDate}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Auto-Renew</Text>
              <Text style={styles.detailValue}>
                {subscriptionInfo.willRenew ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          {isProUser && (
            <TouchableOpacity style={styles.actionRow} onPress={handleManageSubscription}>
              <View style={styles.actionLeft}>
                <Ionicons name="card-outline" size={22} color={ACCENT_BLUE} />
                <Text style={styles.actionText}>Manage Subscription</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleRestorePurchases}
            disabled={isPurchasing}
          >
            <View style={styles.actionLeft}>
              {isPurchasing ? (
                <ActivityIndicator size="small" color={ACCENT_BLUE} />
              ) : (
                <Ionicons name="refresh-outline" size={22} color={ACCENT_BLUE} />
              )}
              <Text style={styles.actionText}>Restore Purchases</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          {!isProUser && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                router.back();
                setTimeout(() => router.push('/paywall'), 100);
              }}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="star-outline" size={22} color={ACCENT_BLUE} />
                <Text style={styles.actionText}>Upgrade to Pro</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Help */}
        <View style={styles.helpCard}>
          <Text style={styles.helpText}>
            Having issues? Contact us at fadecheck.app@gmail.com
          </Text>
        </View>
      </View>
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  statusCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  statusIcon: {
    marginBottom: spacing.md,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  detailLabel: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionsCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  helpCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
