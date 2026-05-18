import { auth } from "@/config/firebaseConfig";
import { apiJsonFetch, getApiUrl } from "@/lib/api";
import { getNotificationSettings, NotificationSettings } from "@/lib/notificationSettings";
import { getFriendlyErrorMessage } from "@/lib/userFriendlyError";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {ActivityIndicator,Alert,FlatList,Text,TouchableOpacity,View} from "react-native";
import { styles } from "@/components/styles/NotificationsScreen.styles";

// This is the notifications page.
// It checks saved foods and creates reminder cards for expiry and restock.

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

interface FoodWriteResponse {
  error?: string;
}

type NoticeKind = "expired" | "expiry" | "restock";

interface Notice {
  id: string;
  foodId: string;
  kind: NoticeKind;
  title: string;
  message: string;
}

const parseFoodDate = (value?: string | null) => {
  // Food dates are saved as DD/MM/YY or DD/MM/YYYY.
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
  // Make notification cards from the user's foods and settings.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return foods.flatMap((food) => {
    const notices: Notice[] = [];
    const foodName = food.name || "Food";
    const quantity = food.quantity == null ? null : Number(food.quantity);

    if (settings.restockNotifications && quantity === 0) {
      notices.push({
        id: `${food.food_id}-restock`,
        foodId: food.food_id,
        kind: "restock",
        title: "Restock notice",
        message: `${foodName} is empty.`,
      });
    }

    const expiryDate = parseFoodDate(food.expiry_date);

    if (expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / 86400000,
      );

      if (settings.expiryNotifications && daysUntilExpiry < 0) {
        notices.push({
          id: `${food.food_id}-expired`,
          foodId: food.food_id,
          kind: "expired",
          title: "Expired food",
          message: `${foodName} has expired (${food.expiry_date}) and is hidden from Home. Delete removes it from your account.`,
        });
      } else if (
        settings.expiryNotifications &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 7
      ) {
        notices.push({
          id: `${food.food_id}-expiry`,
          foodId: food.food_id,
          kind: "expiry",
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
  const [confirmingNoticeId, setConfirmingNoticeId] = useState<string | null>(null);
  const [deletingNoticeId, setDeletingNoticeId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  const loadNotices = useCallback(async (user: User) => {
    // Load foods and settings, then create the notification cards.
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
    // For normal notices, just remove the card from this screen.
    setConfirmingNoticeId(null);
    setNotices((currentNotices) =>
      currentNotices.filter((notice) => notice.id !== noticeId),
    );
  };

  const handleExpiredDeletePress = (notice: Notice) => {
    // Use two taps to confirm deleting expired food.
    if (confirmingNoticeId !== notice.id) {
      setConfirmingNoticeId(notice.id);
      return;
    }

    deleteExpiredFood(notice);
  };

  const deleteExpiredFood = async (notice: Notice) => {
    // Delete expired food from MongoDB through the backend.
    const user = auth.currentUser;

    if (!API_URL) {
      Alert.alert("Error", "Missing EXPO_PUBLIC_API_URL");
      return;
    }

    if (!user) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    try {
      setDeletingNoticeId(notice.id);

      const { data, response } = await apiJsonFetch<FoodWriteResponse>("/delete-food", {
        method: "DELETE",
        body: JSON.stringify({
          _id: user.uid,
          food_id: notice.foodId,
        }),
      });

      if (!response.ok) {
        Alert.alert("Delete food failed", getFriendlyErrorMessage(data.error, "Could not delete this food. Please try again."));
        return;
      }

      setConfirmingNoticeId(null);
      setNotices((currentNotices) =>
        currentNotices.filter((currentNotice) => currentNotice.foodId !== notice.foodId),
      );
    } catch (error: any) {
      Alert.alert("Delete food failed", getFriendlyErrorMessage(error, "Could not delete this food. Please try again."));
    } finally {
      setDeletingNoticeId(null);
    }
  };

  const renderNotice = ({ item }: { item: Notice }) => {
    return (
      <View style={styles.noticeCard}>
        <View style={styles.noticeTextBox}>
          <Text style={styles.noticeTitle}>{item.title}</Text>
          <Text style={styles.noticeMessage}>{item.message}</Text>
        </View>

        <TouchableOpacity
          style={[
            item.kind === "expired" ? styles.deleteButton : styles.dismissButton,
            deletingNoticeId === item.id && styles.noticeButtonDisabled,
          ]}
          onPress={() =>
            item.kind === "expired" ? handleExpiredDeletePress(item) : dismissNotice(item.id)
          }
          disabled={deletingNoticeId === item.id}
        >
          <Text
            style={
              item.kind === "expired" ? styles.deleteText : styles.dismissText
            }
          >
            {item.kind === "expired"
              ? deletingNoticeId === item.id
                ? "Deleting..."
                : confirmingNoticeId === item.id
                  ? "Confirm"
                : "Delete"
              : "x"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => {
          setConfirmingNoticeId(null);
          setNotices([]);
        }}
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
