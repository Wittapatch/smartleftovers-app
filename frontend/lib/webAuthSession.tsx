import { Platform } from "react-native";

const WEB_AUTH_SESSION_KEY = "smartleftovers_web_auth_session";

const canUseSessionStorage = () => {
  // sessionStorage exists only on web and resets when the browser tab closes.
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
  // Native Firebase sessions can persist normally; this guard is only for web demos.
  if (Platform.OS !== "web") {
    return true;
  }

  if (!canUseSessionStorage()) {
    return false;
  }

  return window.sessionStorage.getItem(WEB_AUTH_SESSION_KEY) === "true";
}
