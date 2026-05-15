import { auth } from "@/config/firebaseConfig";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  // Login existing user
  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      Alert.alert("Login success", userCredential.user.email ?? "");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Logo box */}
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

      {/* Login button */}
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Go to sign up page */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/signUp")}
      >
        <Text style={styles.buttonText}>Sign up</Text>
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

  logoBigLetter: {
    fontSize: 70,
    fontWeight: "800",
  },

  logoContainer: {
    marginBottom: 70,
    alignItems: "center",
  },

  logoText: {
    color: "#111111",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
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
