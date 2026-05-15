import { auth } from "@/config/firebaseConfig";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();

  // Store email input
  const [email, setEmail] = useState("");

  // Store password input
  const [password, setPassword] = useState("");

  // Store confirm password input
  const [confirmPassword, setConfirmPassword] = useState("");

  // Register new user
  const signUp = async () => {
    if (
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      Alert.alert("Sign up success", userCredential.user.email ?? "");
      await fetch("http://192.168.1.48:5000/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: userCredential.user.uid,
        }),
      });

      // Go to main tabs after successful signup
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Sign up failed", error.message);
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  logoContainer: {
    marginBottom: 70,
    alignItems: "center",
    width: "100%",
  },

  logoText: {
    color: "#111111",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  logoBigLetter: {
    fontSize: 50,
    fontWeight: "800",
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#F0F1F6",
    borderRadius: 24,
    paddingHorizontal: 18,
    marginBottom: 18,
    fontSize: 15,
    color: "#111111",

    borderWidth: 1,
    borderColor: "#D6D6D6",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  button: {
    width: "75%",
    height: 48,
    backgroundColor: "#F0F1F6",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,

    borderWidth: 1,
    borderColor: "#D6D6D6",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },

  buttonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "500",
  },
});
