import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { auth } from '@/config/firebaseConfig';
import { clearWebAuthSession, hasWebAuthSession } from '@/lib/webAuthSession';

// Root layout controls the top-level navigation stack and protects the app tabs
// from opening on web when the user has not logged in during this browser tab.

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // On web, force a fresh login when the tab did not log in this session.
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
      {/* Expo Router maps these screen names to files and folders inside app/. */}
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
