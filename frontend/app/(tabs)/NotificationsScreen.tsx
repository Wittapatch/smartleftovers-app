import { auth } from "@/config/firebaseConfig";
import { apiJsonFetch, getApiUrl } from "@/lib/api";
import { getNotificationSettings, NotificationSettings } from "@/lib/notificationSettings";
import { getFriendlyErrorMessage } from "@/lib/userFriendlyError";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {ActivityIndicator,Alert,FlatList,Text,TouchableOpacity,View} from "react-native";
import { styles } from "@/components/styles/NotificationsScreen.styles";

interface StoredFoodItem {
  food_id: string;
  name?: string | null;
  expiry_date?: string | null;
  quantity?: number | string | null;
}

interface FoodListResponse {
  food_items?: StoredFoodItem[];
  error?: string;
}

interface Notice {
  id: string;
  title: string;
  message: string;
}

const parseFoodDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const parts = value.split("/");

  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const yearPart = Number(parts[2]);
  const year = yearPart < 100 ? 2000 + yearPart : yearPart;

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const createNotices = (
  foods: StoredFoodItem[],
  settings: NotificationSettings,
) => {
  // Notifications are calculated locally from saved food dates and settings.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return foods.flatMap((food) => {
    const notices: Notice[] = [];
    const foodName = food.name || "Food";
    const quantity = food.quantity == null ? null : Number(food.quantity);

    if (settings.restockNotifications && quantity === 0) {
      notices.push({
        id: `${food.food_id}-restock`,
        title: "Restock notice",
        message: `${foodName} is empty.`,
      });
    }

    const expiryDate = parseFoodDate(food.expiry_date);

    if (expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / 86400000,
      );

      if (
        settings.expiryNotifications &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 7
      ) {
        notices.push({
          id: `${food.food_id}-expiry`,
          title: "Near expiry notice",
          message: `${foodName} will expire soon (${food.expiry_date})`,
        });
      }
    }

    return notices;
  });
};

export default function NotificationsScreen() {
  const API_URL = getApiUrl();

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);

  const loadNotices = useCallback(async (user: User) => {
    if (!API_URL) {
      Alert.alert("Error", "Missing EXPO_PUBLIC_API_URL");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settings = await getNotificationSettings();

      const { data, response } = await apiJsonFetch<FoodListResponse>(
        `/foods?_id=${encodeURIComponent(user.uid)}`,
      );

      if (!response.ok) {
        Alert.alert("Load notifications failed", getFriendlyErrorMessage(data.error, "Could not load notifications. Please try again."));
        return;
      }

      setNotices(createNotices(data.food_items ?? [], settings));
    } catch (error: any) {
      Alert.alert("Load notifications failed", getFriendlyErrorMessage(error, "Could not load notifications. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setNotices([]);
        setLoading(false);
        return;
      }

      loadNotices(user);
    });

    return unsubscribe;
  }, [loadNotices]);

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;

      if (user) {
        loadNotices(user);
      }
    }, [loadNotices]),
  );

  const dismissNotice = (noticeId: string) => {
    setNotices((currentNotices) =>
      currentNotices.filter((notice) => notice.id !== noticeId),
    );
  };

  const renderNotice = ({ item }: { item: Notice }) => {
    return (
      <View style={styles.noticeCard}>
        <View style={styles.noticeTextBox}>
          <Text style={styles.noticeTitle}>{item.title}</Text>
          <Text style={styles.noticeMessage}>{item.message}</Text>
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => dismissNotice(item.id)}
        >
          <Text style={styles.dismissText}>x</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => setNotices([])}
        disabled={notices.length === 0}
      >
        <Text style={styles.clearText}>Clear all</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" />
        </View>
      ) : notices.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          renderItem={renderNotice}
          contentContainerStyle={styles.noticeList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
