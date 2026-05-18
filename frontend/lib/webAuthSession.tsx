import { Platform } from "react-native";

// This is only for the web version.
// It helps the app know if the user logged in during this browser tab.

const WEB_AUTH_SESSION_KEY = "smartleftovers_web_auth_session";

const canUseSessionStorage = () => {
  // sessionStorage only exists on web and resets when the tab closes.
  return Platform.OS === "web" && typeof window !== "undefined" && Boolean(window.sessionStorage);
};

export function allowWebAuthSession() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(WEB_AUTH_SESSION_KEY, "true");
}

export function clearWebAuthSession() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(WEB_AUTH_SESSION_KEY);
}

export function hasWebAuthSession() {
  // Mobile can keep the normal Firebase session, so this check is mainly for web.
  if (Platform.OS !== "web") {
    return true;
  }

  if (!canUseSessionStorage()) {
    return false;
  }

  return window.sessionStorage.getItem(WEB_AUTH_SESSION_KEY) === "true";
}
