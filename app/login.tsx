import {useState} from "react";
import {View, TextInput, Button, Text, Alert} from "react-native";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "@/config/firebaseConfig";
import { blue } from "react-native-reanimated/lib/typescript/Colors";

export default function LoginScreen() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");

    const router = useRouter();

    // Register new user
    const register = async() => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert("Register success", userCredential.user.email ?? "");
            
            // Go to main tabs after successful registration
            router.replace("/(tabs)");
        } catch (error: any) {
            Alert.alert("Register failed", error.message);
        }
    };

    // Login existing user 
    const login = async() => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Login success", userCredential.user.email ?? "")
            router.replace("/(tabs)");
        } catch (error: any) {
            Alert.alert("Login failed", error.message);
        }
    };

    // Logout current user
    const logout = async() => {
        try {
            await signOut(auth);
            Alert.alert("Logged out");
        } catch (error: any) {
            Alert.alert("Logout failed", error.message);
        }
    };

    return (
        <View style={{ padding: 20, gap: 12}}>
            <Text> Email </Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                autoCapitalize="none"
                keyboardType="email-address"
                style= {{ borderWidth: 1, padding: 10, borderRadius: 8, color:"lightblue"}}
            />

            <Text> Password </Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
                style={{borderWidth: 1, padding: 10, borderRadius: 8, color:"lightblue"}}
            />

            <Button title="Register" onPress={register} />
            <Button title="Login" onPress={login} />
            <Button title="Logout" onPress={logout} />
        </View>
    );
}