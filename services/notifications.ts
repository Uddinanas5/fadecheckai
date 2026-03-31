import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_STORAGE_KEY = '@fadecheck_notification_settings';
const LAST_SCAN_KEY = '@fadecheck_last_scan';

interface NotificationSettings {
  enabled: boolean;
  haircutReminders: boolean;
  reminderFrequencyDays: number;
  preferredTime: { hour: number; minute: number };
  weeklyTips: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  haircutReminders: true,
  reminderFrequencyDays: 14, // Default 2 weeks
  preferredTime: { hour: 9, minute: 0 }, // 9 AM
  weeklyTips: true,
};

// Haircut reminder messages - friendly and non-pushy
const HAIRCUT_REMINDERS = [
  {
    title: "Time for a fresh cut? 💈",
    body: "It's been a while since your last FadeCheck. Your fade might be growing out!",
  },
  {
    title: "Fade check time! ✨",
    body: "Ready to see how your haircut is holding up? Quick scan takes 30 seconds.",
  },
  {
    title: "How's the fade looking? 👀",
    body: "Been a couple weeks – want to track how it's growing out?",
  },
  {
    title: "Fresh cut energy ⚡",
    body: "Missing that just-left-the-barber feeling? Check if it's time for a touch-up.",
  },
  {
    title: "Your barber misses you 😄",
    body: "Just kidding! But it might be time for a trim. Let's check your fade.",
  },
];

// Weekly tips based on different topics
const WEEKLY_TIPS = [
  {
    title: "Pro tip: Moisturize! 💧",
    body: "Keep your scalp and hairline healthy with a light moisturizer, especially around your edges.",
  },
  {
    title: "Did you know? 🧠",
    body: "Sleeping on a silk pillowcase helps maintain your haircut longer and reduces frizz.",
  },
  {
    title: "Barber communication tip 💬",
    body: "Show your barber a photo of your best FadeCheck score – they'll know exactly what works for you!",
  },
  {
    title: "Product tip 🧴",
    body: "Less is more! Start with a small amount of product – you can always add more.",
  },
  {
    title: "Maintenance tip ✂️",
    body: "For skin fades, booking every 2 weeks keeps it looking fresh. Tapers can go 3-4 weeks.",
  },
  {
    title: "Style tip 💡",
    body: "Your face shape affects what styles look best. Check your FadeCheck results for personalized recommendations!",
  },
  {
    title: "Edge care tip 📏",
    body: "Avoid touching your hairline too much – oils from your fingers can cause buildup and breakouts.",
  },
];

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  // Request permissions
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'FadeCheck',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#38BDF8',
      });
    }

    return true;
  }

  // Get notification settings
  static async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error getting notification settings:', error);
    }
    return defaultSettings;
  }

  // Save notification settings
  static async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));

      // Reschedule notifications based on new settings
      await this.scheduleNotifications(updated);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Record a scan (to track when to send reminders)
  static async recordScan(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SCAN_KEY, Date.now().toString());
      // Reschedule haircut reminder
      const settings = await this.getSettings();
      if (settings.haircutReminders) {
        await this.scheduleHaircutReminder(settings);
      }
    } catch (error) {
      console.error('Error recording scan:', error);
    }
  }

  // Get last scan date
  static async getLastScanDate(): Promise<Date | null> {
    try {
      const stored = await AsyncStorage.getItem(LAST_SCAN_KEY);
      if (stored) {
        return new Date(parseInt(stored));
      }
    } catch (error) {
      console.error('Error getting last scan date:', error);
    }
    return null;
  }

  // Calculate days since last scan
  static async getDaysSinceLastScan(): Promise<number | null> {
    const lastScan = await this.getLastScanDate();
    if (!lastScan) return null;

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastScan.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Schedule all notifications based on settings
  static async scheduleNotifications(settings?: NotificationSettings): Promise<void> {
    const notifSettings = settings || await this.getSettings();

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!notifSettings.enabled) return;

    // Schedule haircut reminders
    if (notifSettings.haircutReminders) {
      await this.scheduleHaircutReminder(notifSettings);
    }

    // Schedule weekly tips
    if (notifSettings.weeklyTips) {
      await this.scheduleWeeklyTip(notifSettings);
    }
  }

  // Schedule a haircut reminder
  private static async scheduleHaircutReminder(settings: NotificationSettings): Promise<void> {
    const lastScan = await this.getLastScanDate();
    const randomReminder = HAIRCUT_REMINDERS[Math.floor(Math.random() * HAIRCUT_REMINDERS.length)];

    // Calculate when to send (based on last scan or just use the frequency)
    let triggerDate = new Date();
    if (lastScan) {
      triggerDate = new Date(lastScan.getTime() + (settings.reminderFrequencyDays * 24 * 60 * 60 * 1000));
    } else {
      triggerDate.setDate(triggerDate.getDate() + settings.reminderFrequencyDays);
    }

    // Set preferred time
    triggerDate.setHours(settings.preferredTime.hour, settings.preferredTime.minute, 0, 0);

    // If the trigger date is in the past, schedule for next occurrence
    if (triggerDate <= new Date()) {
      triggerDate.setDate(triggerDate.getDate() + settings.reminderFrequencyDays);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: randomReminder.title,
        body: randomReminder.body,
        data: { type: 'haircut_reminder' },
        sound: true,
      },
      trigger: {
        date: triggerDate,
      },
    });

    console.log('Haircut reminder scheduled for:', triggerDate);
  }

  // Schedule a weekly tip
  private static async scheduleWeeklyTip(settings: NotificationSettings): Promise<void> {
    const randomTip = WEEKLY_TIPS[Math.floor(Math.random() * WEEKLY_TIPS.length)];

    // Schedule for next Sunday at preferred time
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(settings.preferredTime.hour, settings.preferredTime.minute, 0, 0);

    // If that's today and already past, go to next week
    if (nextSunday <= new Date()) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: randomTip.title,
        body: randomTip.body,
        data: { type: 'weekly_tip' },
        sound: true,
      },
      trigger: {
        date: nextSunday,
      },
    });

    console.log('Weekly tip scheduled for:', nextSunday);
  }

  // Send an immediate notification (for testing or special events)
  static async sendImmediateNotification(title: string, body: string, data?: object): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Immediate
    });
  }

  // Get all scheduled notifications (for debugging)
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Cancel all notifications
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default NotificationService;
