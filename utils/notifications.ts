import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for tracking notification state
const ABANDONED_PAYWALL_KEY = 'abandoned_paywall_notif_scheduled';
const LAST_ABANDONED_PAYWALL_DATE = 'last_abandoned_paywall_date';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Schedule an abandoned paywall notification
 * Only sends once per day max to avoid spam
 */
export async function scheduleAbandonedPaywallNotification(): Promise<boolean> {
  try {
    // Check if we already sent one today
    const lastSentDate = await AsyncStorage.getItem(LAST_ABANDONED_PAYWALL_DATE);
    const today = new Date().toDateString();

    if (lastSentDate === today) {
      console.log('Already sent abandoned paywall notification today, skipping');
      return false;
    }

    // Cancel any existing abandoned paywall notification
    await cancelAbandonedPaywallNotification();

    // Schedule notification for 1 hour from now
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your results are waiting! 👀',
        body: 'Your grooming tips are ready! See your personalized recommendations 💈',
        sound: true,
        data: { type: 'abandoned_paywall' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60, // 1 hour
      },
    });

    // Save notification ID and date
    await AsyncStorage.setItem(ABANDONED_PAYWALL_KEY, notificationId);
    await AsyncStorage.setItem(LAST_ABANDONED_PAYWALL_DATE, today);

    console.log('Scheduled abandoned paywall notification:', notificationId);
    return true;
  } catch (error) {
    console.error('Error scheduling abandoned paywall notification:', error);
    return false;
  }
}

/**
 * Cancel any scheduled abandoned paywall notification
 * Call this when user successfully purchases
 */
export async function cancelAbandonedPaywallNotification(): Promise<void> {
  try {
    const notificationId = await AsyncStorage.getItem(ABANDONED_PAYWALL_KEY);

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(ABANDONED_PAYWALL_KEY);
      console.log('Cancelled abandoned paywall notification');
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}
