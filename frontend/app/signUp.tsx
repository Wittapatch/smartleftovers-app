import { auth } from "@/config/firebaseConfig";
import { apiJsonFetch, getApiUrl } from "@/lib/api";
import { getFriendlyErrorMessage } from "@/lib/userFriendlyError";
import { allowWebAuthSession } from "@/lib/webAuthSession";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {Alert,KeyboardAvoidingView,Platform,Text,TextInput,TouchableOpacity,View} from "react-native";
import { styles } from "@/components/styles/signUp.styles";

// Sign up screen: creates the Firebase account first, then creates the matching
// MongoDB user document through the Flask backend.

export default function SignUpScreen() {
  const router = useRouter();

  // Store email input
  const [email, setEmail] = useState("");

  // Store password input
  const [password, setPassword] = useState("");

  // Store confirm password input
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (title: string, message: string) => {
    setErrorMessage(message);

    if (Platform.OS !== "web") {
      Alert.alert(title, message);
    }
  };

  // Register new user after checking required fields and matching passwords.
  const signUp = async () => {
    setErrorMessage("");

    if (
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      showError("Sign up failed", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Sign up failed", "Passwords do not match.");
      return;
    }

    try {
      const API_URL = getApiUrl();

      if (!API_URL) {
        showError("Sign up failed", "The server is not configured yet.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      Alert.alert("Sign up success", userCredential.user.email ?? "");
      // Create the matching backend profile after Firebase account creation.
      await apiJsonFetch("/create-user", {
        method: "POST",
        body: JSON.stringify({
          _id: userCredential.user.uid,
        }),
      });

      // Mark this tab as intentionally signed in for the web demo flow.
      allowWebAuthSession();
      // Go to main tabs after successful signup
      router.replace("/(tabs)");
    } catch (error: any) {
      showError(
        "Sign up failed",
        getFriendlyErrorMessage(error, "Could not create your account. Please try again."),
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Logo text */}
      <View style={styles.logoContainer}>
        <Text
          style={styles.logoText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          <Text style={styles.logoBigLetter}>S</Text>
          mart Leftovers
        </Text>
      </View>

      {/* Email input */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#C7C7C7"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      {/* Password input */}
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#C7C7C7"
        secureTextEntry
        style={styles.input}
      />

      {/* Confirm password input */}
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        placeholderTextColor="#C7C7C7"
        secureTextEntry
        style={styles.input}
      />

      {/* Sign up button */}
      <TouchableOpacity style={styles.button} onPress={signUp}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      {/* Go back to login page */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </KeyboardAvoidingView>
  );
}
