import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";

export default function HomeScreen() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (user === undefined) {
    return <Text>Loading...</Text>;
  }

  if (user === null) {
    return <Redirect href="/login" />;
  }

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome {user.email}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}