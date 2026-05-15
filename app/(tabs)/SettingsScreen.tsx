import { useState } from "react";
import {Alert,KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Switch,Text,TextInput,TouchableOpacity,View} from "react-native";
import { useRouter } from "expo-router";
import {EmailAuthProvider,reauthenticateWithCredential,signOut,updateEmail,updatePassword} from "firebase/auth";
import { auth } from "@/config/firebaseConfig";

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

  // Re-authenticate user before changing email or password
  const reauthenticateUser = async () => {
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
      Alert.alert("Change email failed", error.message);
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
      Alert.alert("Change password failed", error.message);
    }
  };

  // Log out current user
  const logout = async () => {
    try {
      await signOut(auth);

      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message);
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
                  onValueChange={setExpiryNotification}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.optionText}>Restock notifications</Text>

                <Switch
                  value={restockNotification}
                  onValueChange={setRestockNotification}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  container: {
    flexGrow: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 28,
    paddingTop: 90,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  row: {
    height: 54,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowText: {
    fontSize: 16,
    color: "#111111",
    fontWeight: "400",
  },

  arrow: {
    fontSize: 28,
    color: "#B5B5B5",
  },

  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginLeft: 18,
  },

  dropdownBox: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  label: {
    fontSize: 13,
    color: "#555555",
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    height: 42,
    backgroundColor: "#F0F1F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginBottom: 8,
    color: "#111111",
    borderWidth: 1,
    borderColor: "#D6D6D6",
  },

  smallButton: {
    height: 40,
    backgroundColor: "#F0F1F6",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
  },

  smallButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "500",
  },

  logoutButton: {
    paddingVertical: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#D0342C",
    fontWeight: "600",
    fontSize: 14,
  },

  optionText: {
    fontSize: 14,
    color: "#222222",
  },

  switchRow: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});