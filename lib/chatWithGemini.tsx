export interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export async function chatWithGemini(
  message: string,
  history: ChatMessage[]
) {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  console.log("API_URL =", API_URL);
  console.log("Calling backend =", `${API_URL}/chat`);

  if (!API_URL) {
    throw new Error("Missing EXPO_PUBLIC_API_URL");
  }

  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      // Add this only helps if you are using ngrok
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      message: message,
      history: history,
    }),
  });

  const data = await response.json();

  console.log("Backend response =", data);

  if (!response.ok) {
    throw new Error(data.error || "Chat request failed");
  }

  return data.reply;
}