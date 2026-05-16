import { apiJsonFetch } from "@/lib/api";

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export interface ChatIngredient {
  name: string;
  type?: string;
  quantity?: string;
  unit?: string;
  expiryDate?: string;
  description?: string;
}

interface ChatResponse {
  reply?: string;
  error?: string;
}

export interface ChatOptions {
  servings?: string;
}

export async function chatWithGemini(
  message: string,
  history: ChatMessage[],
  ingredients: ChatIngredient[] = [],
  options: ChatOptions = {},
) {
  // Send the visible conversation plus selected inventory items to the backend ChefBot route.
  const { data, response } = await apiJsonFetch<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({
      message: message,
      history: history,
      ingredients: ingredients,
      servings: options.servings,
    }),
  });

  console.log("Backend response =", data);

  if (!response.ok) {
    throw new Error(data.error || "Chat request failed");
  }

  if (!data.reply) {
    throw new Error("Chat response was empty");
  }

  return data.reply;
}
