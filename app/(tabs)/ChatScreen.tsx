import { useState } from "react";
import {Alert,Button,FlatList,Text,TextInput,View} from "react-native";

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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: item.role === "user" ? "#DCF8C6" : "#EEEEEE",
              padding: 10,
              borderRadius: 10,
              marginVertical: 5,
              maxWidth: "80%",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              {item.role === "user" ? "You" : "Bot"}
            </Text>

            <Text>{item.text}</Text>
          </View>
        )}
      />

      {loading && (
        <Text style={{ textAlign: "center", marginBottom: 8 }}>
          Bot is thinking...
        </Text>
      )}

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#CCCCCC",
            borderRadius: 8,
            padding: 10,
          }}
        />

        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}