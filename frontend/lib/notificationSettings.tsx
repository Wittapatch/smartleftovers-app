import AsyncStorage from "@react-native-async-storage/async-storage";

// This file saves the user's notification settings on their device/browser.
// The app uses these settings when it creates notification cards.

const NOTIFICATION_SETTINGS_KEY = "smartleftovers-notification-settings";

export interface NotificationSettings {
  // These are the two switches the user can turn on or off.
  expiryNotifications: boolean;
  restockNotifications: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  expiryNotifications: true,
  restockNotifications: true,
};

export async function getNotificationSettings() {
  // Combine saved settings with defaults in case we add more settings later.
  const storedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);

  if (!storedSettings) {
    return defaultNotificationSettings;
  }

  try {
    return {
      ...defaultNotificationSettings,
      ...(JSON.parse(storedSettings) as Partial<NotificationSettings>),
    };
  } catch {
    return defaultNotificationSettings;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings) {
  // AsyncStorage keeps these settings after the app closes.
  await AsyncStorage.setItem(
    NOTIFICATION_SETTINGS_KEY,
    JSON.stringify(settings),
  );
}
