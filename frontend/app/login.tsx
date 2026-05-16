import { auth } from "@/config/firebaseConfig";
import { apiJsonFetch, getApiUrl } from "@/lib/api";
import { getFriendlyErrorMessage } from "@/lib/userFriendlyError";
import { allowWebAuthSession } from "@/lib/webAuthSession";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {Alert,KeyboardAvoidingView,Platform,Text,TextInput,TouchableOpacity,View} from "react-native";
import { styles } from "@/components/styles/login.styles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const showError = (title: string, message: string) => {
    setErrorMessage(message);

    if (Platform.OS !== "web") {
      Alert.alert(title, message);
    }
  };

  // Login existing user
  const login = async () => {
    setErrorMessage("");

    if (email.trim() === "" || password.trim() === "") {
      showError("Login failed", "Please enter your email and password.");
      return;
    }

    try {
      const API_URL = getApiUrl();

      if (!API_URL) {
        showError("Login failed", "The server is not configured yet.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Ensure this Firebase account has a matching MongoDB user document.
      await apiJsonFetch("/create-user", {
        method: "POST",
        body: JSON.stringify({
          _id: userCredential.user.uid,
        }),
      });

      // Web uses sessionStorage so a browser restart returns to the login screen.
      allowWebAuthSession();
      Alert.alert("Login success", userCredential.user.email ?? "");
      router.replace("/(tabs)");
    } catch (error: any) {
      showError(
        "Login failed",
        getFriendlyErrorMessage(error, "Could not log in. Please try again."),
      );
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

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </KeyboardAvoidingView>
  );
}
