import { useState } from "react";
import {StyleSheet, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity, Platform, Alert, Button,FlatList,Text,TextInput,View} from "react-native";
import { chatWithGemini, ChatMessage } from "@/lib/chatWithGemini";

export default function ChatScreen() {
  // Store all chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Store current user input
  const [input, setInput] = useState("");

  // Store loading state
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === "") {
      return;
    }
    // Save input into a variable before clearing it
    const messageText = input;

    const userMessage: ChatMessage = {
      role: "user",
      text: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const botReply = await chatWithGemini(input, updatedMessages);

      const botMessage: ChatMessage = {
        role: "bot",
        text: botReply,
      };

      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not get chatbot reply");
    } finally {
      setLoading(false);
    }
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
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Leftovers Chat</Text>
        <Text style={styles.headerSubtitle}>
          Ask about food, storage, and leftovers
        </Text>
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
              Type a message below to start chatting.
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
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
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


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    paddingTop: 65,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#666666",
    marginTop: 4,
  },

  messageList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },

  messageBubble: {
    maxWidth: "82%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 5,
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
  },

  senderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555555",
    marginBottom: 4,
  },

  messageText: {
    fontSize: 15,
    color: "#111111",
    lineHeight: 21,
  },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 150,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },

  loadingText: {
    fontSize: 13,
    color: "#555555",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
    gap: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 8,
  },
  
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: "#F0F1F6",
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111111",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  sendButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});