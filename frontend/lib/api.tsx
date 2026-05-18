// Shared backend request helpers used by screens and feature-specific API files.
// Keeping the base URL and JSON parsing here avoids repeating fetch setup everywhere.

export function getApiUrl() {
  // Expo exposes public runtime config through EXPO_PUBLIC_* variables.
  return process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
}

export async function apiJsonFetch<T = any>(
  path: string,
  options: RequestInit = {},
) {
  // Central helper for JSON API calls so headers and errors stay consistent.
  const API_URL = getApiUrl();

  if (!API_URL) {
    throw new Error("Missing EXPO_PUBLIC_API_URL");
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  // Required when the backend URL is an ngrok tunnel during mobile testing.
  headers.set("ngrok-skip-browser-warning", "true");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const responseText = await response.text();

  try {
    // Most backend routes return JSON even for errors.
    const data = responseText ? (JSON.parse(responseText) as T) : ({} as T);

    return {
      data,
      response,
    };
  } catch {
    // Surface a short preview when Flask/ngrok returns HTML instead of JSON.
    const preview = responseText.replace(/\s+/g, " ").trim().slice(0, 160);

    throw new Error(
      `Server returned non-JSON (${response.status}). ${preview || "No response body"}`,
    );
  }
}
