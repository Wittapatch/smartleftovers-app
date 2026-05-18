// This file has helper functions for calling our Flask backend.
// It keeps the API URL and JSON handling in one place.

export function getApiUrl() {
  // Expo reads this public backend URL from the .env file.
  return process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
}

export async function apiJsonFetch<T = any>(
  path: string,
  options: RequestInit = {},
) {
  // This helper makes JSON API calls with the same headers every time.
  const API_URL = getApiUrl();

  if (!API_URL) {
    throw new Error("Missing EXPO_PUBLIC_API_URL");
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  // This is needed when mobile testing uses an ngrok backend link.
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
    // Most backend routes return JSON, even when there is an error.
    const data = responseText ? (JSON.parse(responseText) as T) : ({} as T);

    return {
      data,
      response,
    };
  } catch {
    // If the server returns HTML instead of JSON, show a short preview.
    const preview = responseText.replace(/\s+/g, " ").trim().slice(0, 160);

    throw new Error(
      `Server returned non-JSON (${response.status}). ${preview || "No response body"}`,
    );
  }
}
