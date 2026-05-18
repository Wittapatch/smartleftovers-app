import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { auth } from '@/config/firebaseConfig';
import { clearWebAuthSession, hasWebAuthSession } from '@/lib/webAuthSession';

// This is the main app layout.
// It controls the login, sign up, and tab screens.

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // On web, send the user back to login if this tab has no login session.
    if (hasWebAuthSession()) {
      return;
    }

    clearWebAuthSession();
    signOut(auth).finally(() => {
      router.replace("/login");
    });
  }, [router]);

  return (
    <ThemeProvider value={DefaultTheme}>
      {/* Expo Router connects these screen names to files in the app folder. */}
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
