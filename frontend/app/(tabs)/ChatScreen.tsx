import { useEffect, useMemo, useState } from "react";
import {ActivityIndicator, Keyboard,KeyboardAvoidingView, TouchableOpacity, Platform, Alert,FlatList,Text,TextInput,View} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { chatWithGemini, ChatIngredient, ChatMessage } from "@/lib/chatWithGemini";
import { styles } from "@/components/styles/ChatScreen.styles";

const parseIngredients = (ingredientsParam: string | string[] | undefined) => {
  const rawIngredients = Array.isArray(ingredientsParam)? ingredientsParam[0]: ingredientsParam;

  if (!rawIngredients) {
    return [];
  }

  try {
    const parsedIngredients = JSON.parse(rawIngredients);
    return Array.isArray(parsedIngredients)? (parsedIngredients as ChatIngredient[]): [];
  } catch {
    return [];
  }
};

const parseParamText = (param: string | string[] | undefined) => {
  return Array.isArray(param) ? param[0] ?? "" : param ?? "";
};

export default function ChatScreen() {
  // ChefBot can receive selected foods through route params from the Home screen.
  const router = useRouter();
  const params = useLocalSearchParams();
  const ingredients = useMemo(
    () => parseIngredients(params.ingredients),
    [params.ingredients],
  );
  const servings = useMemo(
    () => parseParamText(params.servings),
    [params.servings],
  );

  // Store all chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text:
        ingredients.length > 0
          ? `I can help make dish ideas with: ${ingredients
              .map((ingredient) => `${ingredient.quantity || "-"} ${ingredient.unit || ""} ${ingredient.name}`.trim())
              .join(", ")}${servings ? ` for ${servings} serving(s)` : ""}. Ask me for quick meals, healthy options, or step-by-step recipes.`
          : "Select saved ingredients from the home screen, or tell me what you have and I will suggest dish ideas.",
    },
  ]);

  // Store current user input
  const [input, setInput] = useState("");

  // Store loading state
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Listen for when the keyboard opens so the screen can adjust the input bar.
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });

    // Listen for when the keyboard closes so the input bar can return to normal.
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    // Remove both keyboard listeners when this screen unmounts to prevent memory leaks.
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const sendMessage = async () => {
    // Do not send empty messages to the backend.
    if (input.trim() === "") {
      return;
    }

    // Convert the current text input into a chat message from the user.
    const userMessage: ChatMessage = {
      role: "user",
      text: input,
    };

    // Add the user's message immediately so the chat feels responsive.
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Ask the backend ChefBot route for a reply using the conversation and selected foods.
      const botReply = await chatWithGemini(input, updatedMessages, ingredients, {
        servings,
      });

      // Add ChefBot's answer to the chat after the backend returns.
      const botMessage: ChatMessage = {
        role: "bot",
        text: botReply,
      };

      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      // Keep the user on the chat screen and show a simple error if the request fails.
      console.log(error);
      Alert.alert("Error", "Could not get chatbot reply");
    } finally {
      // Stop the loading state whether the request succeeded or failed.
      setLoading(false);
    }
  };

  const goBack = () => {
    // Return to the previous screen when this chat was opened from Home.
    if (router.canGoBack()) {
      router.back();
      return;
    }

    // If there is no navigation history, safely return to the main tabs.
    router.replace("/(tabs)");
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isUser = item.role === "user";

    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.botBubble,
      ]}>
        <Text style={styles.senderText}>{isUser ? "You": "Bot"} </Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <MaterialIcons name="arrow-back" size={26} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartLeftovers Chat</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Ask ChefBot what you can cook with your selected foods.
            </Text>
          </View>
        }
      />

      {/* Loading */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Bot is thinking...</Text>
        </View>
      )}

      {/* Input area */}
      <View style={[styles.inputBar, keyboardVisible && styles.inputBarKeyboardOpen]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask for dish ideas..."
          placeholderTextColor="#999999"
          style={styles.input}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            input.trim() === "" && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={input.trim() === "" || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
