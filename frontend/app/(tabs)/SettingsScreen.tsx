import { useEffect, useState } from "react";
import {Alert,KeyboardAvoidingView,Platform,ScrollView,Switch,Text,TextInput,TouchableOpacity,View} from "react-native";
import { useRouter } from "expo-router";
import {EmailAuthProvider,reauthenticateWithCredential,signOut,updatePassword,verifyBeforeUpdateEmail} from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { getNotificationSettings, saveNotificationSettings } from "@/lib/notificationSettings";
import { getFriendlyErrorMessage } from "@/lib/userFriendlyError";
import { clearWebAuthSession } from "@/lib/webAuthSession";
import { styles } from "@/components/styles/SettingsScreen.styles";

// Settings screen: manages account changes through Firebase and stores
// notification preferences locally with AsyncStorage.

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
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  // Notification toggle states
  const [expiryNotification, setExpiryNotification] = useState(false);
  const [restockNotification, setRestockNotification] = useState(false);

  const showFeedback = (
    title: string,
    message: string,
    type: "success" | "error" = "success",
  ) => {
    // Browser alerts are more reliable than React Native Alert on web.
    setFeedbackType(type);
    setFeedbackMessage(message);

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${title}\n${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const getTechnicalErrorMessage = (error: unknown) => {
    return (
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : ""
    );
  };

  useEffect(() => {
    const loadNotificationSettings = async () => {
      // Load saved switches when the settings screen opens.
      try {
        const settings = await getNotificationSettings();
        setExpiryNotification(settings.expiryNotifications);
        setRestockNotification(settings.restockNotifications);
      } catch (error: any) {
        showFeedback(
          "Settings failed",
          getFriendlyErrorMessage(error, "Could not load settings."),
          "error",
        );
      }
    };

    loadNotificationSettings();
  }, []);

  const updateExpiryNotification = async (value: boolean) => {
    // Save expiry reminder preference immediately when the switch changes.
    try {
      setFeedbackMessage("");
      setExpiryNotification(value);
      await saveNotificationSettings({
        expiryNotifications: value,
        restockNotifications: restockNotification,
      });
    } catch (error: any) {
      showFeedback(
        "Settings failed",
        getFriendlyErrorMessage(error, "Could not update settings."),
        "error",
      );
    }
  };

  const updateRestockNotification = async (value: boolean) => {
    // Save restock reminder preference immediately when the switch changes.
    try {
      setFeedbackMessage("");
      setRestockNotification(value);
      await saveNotificationSettings({
        expiryNotifications: expiryNotification,
        restockNotifications: value,
      });
    } catch (error: any) {
      showFeedback(
        "Settings failed",
        getFriendlyErrorMessage(error, "Could not update settings."),
        "error",
      );
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
      setFeedbackMessage("");

      const trimmedNewEmail = newEmail.trim();

      if (trimmedNewEmail === "") {
        showFeedback("Error", "Please enter a new email.", "error");
        return;
      }

      const user = await reauthenticateUser();

      if (trimmedNewEmail.toLowerCase() === user.email?.toLowerCase()) {
        showFeedback("Error", "The new email is the same as the current email.", "error");
        return;
      }

      // Send a Firebase verification link to the new email. The email changes only after
      // the user clicks that link, which works better across Firebase security settings.
      await verifyBeforeUpdateEmail(user, trimmedNewEmail);

      showFeedback(
        "Verification email sent",
        `Please open ${trimmedNewEmail} and click the Firebase verification link. The email will change after verification. If you do not see it, check your spam or junk folder too.`,
      );

      setNewEmail("");
      setCurrentPassword("");
    } catch (error: any) {
      const technicalMessage = getTechnicalErrorMessage(error);
      showFeedback(
        "Change email failed",
        `${getFriendlyErrorMessage(error, "Could not update your email. Please try again.")}${technicalMessage ? `\n\nFirebase error: ${technicalMessage}` : ""}`,
        "error",
      );
    }
  };

  // Change user's password
  const handleChangePassword = async () => {
    try {
      setFeedbackMessage("");

      if (newPassword.trim() === "" || confirmNewPassword.trim() === "") {
        showFeedback("Error", "Please enter your new password twice.", "error");
        return;
      }

      if (newPassword.length < 6) {
        showFeedback("Error", "Password must be at least 6 characters.", "error");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        showFeedback("Error", "New passwords do not match.", "error");
        return;
      }

      const user = await reauthenticateUser();

      await updatePassword(user, newPassword);

      showFeedback("Success", "Password updated successfully.");

      setNewPassword("");
      setConfirmNewPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      showFeedback(
        "Change password failed",
        getFriendlyErrorMessage(error, "Could not update your password. Please try again."),
        "error",
      );
    }
  };

  // Log out current user
  const logout = async () => {
    try {
      setFeedbackMessage("");
      // Clear the web-only session marker before ending the Firebase session.
      clearWebAuthSession();
      await signOut(auth);

      router.replace("/login");
    } catch (error: any) {
      showFeedback(
        "Logout failed",
        getFriendlyErrorMessage(error, "Could not log out. Please try again."),
        "error",
      );
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
              {feedbackMessage ? (
                <Text
                  style={[
                    styles.feedbackText,
                    feedbackType === "error" && styles.feedbackErrorText,
                  ]}
                >
                  {feedbackMessage}
                </Text>
              ) : null}

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
