import { useEffect, useState } from "react";
import {Alert,KeyboardAvoidingView,Platform,ScrollView,Switch,Text,TextInput,TouchableOpacity,View} from "react-native";
import { useRouter } from "expo-router";
import {EmailAuthProvider,reauthenticateWithCredential,signOut,updateEmail,updatePassword} from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { getNotificationSettings, saveNotificationSettings } from "@/lib/notificationSettings";
import { getFriendlyErrorMessage } from "@/lib/userFriendlyError";
import { clearWebAuthSession } from "@/lib/webAuthSession";
import { styles } from "@/components/styles/SettingsScreen.styles";

export default function SettingsScreen() {
  const router = useRouter();

  // Show or hide Account dropdown
  const [showAccountOptions, setShowAccountOptions] = useState(false);

  // Show or hide Notifications dropdown
  const [showNotificationOptions, setShowNotificationOptions] = useState(false);

  // Account input fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Notification toggle states
  const [expiryNotification, setExpiryNotification] = useState(false);
  const [restockNotification, setRestockNotification] = useState(false);

  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const settings = await getNotificationSettings();
        setExpiryNotification(settings.expiryNotifications);
        setRestockNotification(settings.restockNotifications);
      } catch (error: any) {
        Alert.alert("Settings failed", getFriendlyErrorMessage(error, "Could not load settings."));
      }
    };

    loadNotificationSettings();
  }, []);

  const updateExpiryNotification = async (value: boolean) => {
    try {
      setExpiryNotification(value);
      await saveNotificationSettings({
        expiryNotifications: value,
        restockNotifications: restockNotification,
      });
    } catch (error: any) {
      Alert.alert("Settings failed", getFriendlyErrorMessage(error, "Could not update settings."));
    }
  };

  const updateRestockNotification = async (value: boolean) => {
    try {
      setRestockNotification(value);
      await saveNotificationSettings({
        expiryNotifications: expiryNotification,
        restockNotifications: value,
      });
    } catch (error: any) {
      Alert.alert("Settings failed", getFriendlyErrorMessage(error, "Could not update settings."));
    }
  };

  // Re-authenticate user before changing email or password
  const reauthenticateUser = async () => {
    // Firebase requires recent login before changing sensitive account details.
    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error("No user is logged in");
    }

    if (currentPassword.trim() === "") {
      throw new Error("Please enter your current password");
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);

    return user;
  };

  // Change user's email
  const handleChangeEmail = async () => {
    try {
      if (newEmail.trim() === "") {
        Alert.alert("Error", "Please enter a new email");
        return;
      }

      const user = await reauthenticateUser();

      await updateEmail(user, newEmail);

      Alert.alert("Success", "Email updated successfully");

      setNewEmail("");
      setCurrentPassword("");
    } catch (error: any) {
      Alert.alert("Change email failed", getFriendlyErrorMessage(error, "Could not update your email. Please try again."));
    }
  };

  // Change user's password
  const handleChangePassword = async () => {
    try {
      if (newPassword.trim() === "" || confirmNewPassword.trim() === "") {
        Alert.alert("Error", "Please enter your new password twice");
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        Alert.alert("Error", "New passwords do not match");
        return;
      }

      const user = await reauthenticateUser();

      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated successfully");

      setNewPassword("");
      setConfirmNewPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      Alert.alert("Change password failed", getFriendlyErrorMessage(error, "Could not update your password. Please try again."));
    }
  };

  // Log out current user
  const logout = async () => {
    try {
      // Clear the web-only session marker before ending the Firebase session.
      clearWebAuthSession();
      await signOut(auth);

      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Logout failed", getFriendlyErrorMessage(error, "Could not log out. Please try again."));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* Account row */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowAccountOptions(!showAccountOptions)}
          >
            <Text style={styles.rowText}>Account</Text>
            <Text style={styles.arrow}>{showAccountOptions ? "⌄" : "›"}</Text>
          </TouchableOpacity>

          {/* Account dropdown */}
          {showAccountOptions && (
            <View style={styles.dropdownBox}>
              <Text style={styles.label}>Current password</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#A8A8A8"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />

              <Text style={styles.label}>New email</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter new email"
                placeholderTextColor="#A8A8A8"
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleChangeEmail}
              >
                <Text style={styles.smallButtonText}>Change email</Text>
              </TouchableOpacity>

              <Text style={styles.label}>New password</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#A8A8A8"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm new password</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter new password again"
                placeholderTextColor="#A8A8A8"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.smallButtonText}>Change password</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Log out</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.divider} />

          {/* Notifications row */}
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              setShowNotificationOptions(!showNotificationOptions)
            }
          >
            <Text style={styles.rowText}>Notifications</Text>
            <Text style={styles.arrow}>
              {showNotificationOptions ? "⌄" : "›"}
            </Text>
          </TouchableOpacity>

          {/* Notifications dropdown */}
          {showNotificationOptions && (
            <View style={styles.dropdownBox}>
              <View style={styles.switchRow}>
                <Text style={styles.optionText}>Expiry notifications</Text>

                <Switch
                  value={expiryNotification}
                  onValueChange={updateExpiryNotification}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.optionText}>Restock notifications</Text>

                <Switch
                  value={restockNotification}
                  onValueChange={updateRestockNotification}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
