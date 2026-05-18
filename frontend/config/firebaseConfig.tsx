import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// This file sets up Firebase for the app.
// Other files import auth from here when they need login or account features.

const firebaseConfig = {
  // These Firebase values are public app config, not private backend secrets.
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// This stops Firebase from starting again during Expo fast refresh.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
