import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_SETTINGS_KEY = "smartleftovers-notification-settings";

export interface NotificationSettings {
  // User-controlled switches that affect locally generated notification cards.
  expiryNotifications: boolean;
  restockNotifications: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  expiryNotifications: true,
  restockNotifications: true,
};

export async function getNotificationSettings() {
  // Merge stored settings with defaults so new settings can be added safely later.
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
  // AsyncStorage keeps preferences on the device/browser between app launches.
  await AsyncStorage.setItem(
    NOTIFICATION_SETTINGS_KEY,
    JSON.stringify(settings),
  );
}
