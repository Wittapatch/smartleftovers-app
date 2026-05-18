import { useEffect, useMemo, useState } from "react";
import {ActivityIndicator, Keyboard,KeyboardAvoidingView, TouchableOpacity, Platform, Alert,FlatList,Text,TextInput,View} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { chatWithGemini, ChatIngredient, ChatMessage } from "@/lib/chatWithGemini";
import { styles } from "@/components/styles/ChatScreen.styles";

// This is the ChefBot chat screen.
// It takes selected ingredients from Home and asks the backend for recipe ideas.

const parseIngredients = (ingredientsParam: string | string[] | undefined) => {
  // Ingredients come through the route as JSON text, so we parse them here.
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
  // Route params can be one string or an array, so this makes it one string.
  return Array.isArray(param) ? param[0] ?? "" : param ?? "";
};

export default function ChatScreen() {
  // ChefBot receives selected foods from the Home screen through route params.
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

  // Store all chat messages on this screen.
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

  // Store what the user is typing.
  const [input, setInput] = useState("");

  // Store loading state while waiting for ChefBot.
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Watch when the keyboard opens so the input bar can move nicely.
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });

    // Watch when the keyboard closes so the input bar goes back.
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    // Remove listeners when leaving this screen.
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const sendMessage = async () => {
    // Do not send an empty message.
    if (input.trim() === "") {
      return;
    }

    // Turn the typed text into a user chat message.
    const userMessage: ChatMessage = {
      role: "user",
      text: input,
    };

    // Show the user's message right away before the bot replies.
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Ask the backend for ChefBot's reply.
      const botReply = await chatWithGemini(input, updatedMessages, ingredients, {
        servings,
      });

      // Add ChefBot's answer after the backend responds.
      const botMessage: ChatMessage = {
        role: "bot",
        text: botReply,
      };

      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      // If something fails, keep the user here and show an error.
      console.log(error);
      Alert.alert("Error", "Could not get chatbot reply");
    } finally {
      // Stop loading whether it worked or failed.
      setLoading(false);
    }
  };

  const goBack = () => {
    // Go back to Home if this chat was opened from there.
    if (router.canGoBack()) {
      router.back();
      return;
    }

    // If there is no back history, go to the main tabs.
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
