import { StyleSheet } from "react-native";

// Styles for the ChefBot chat page.

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    paddingTop: 65,
    paddingBottom: 22,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
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

  inputBarKeyboardOpen: {
    paddingBottom: 8,
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
    backgroundColor: "#000000",
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
