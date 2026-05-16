import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 28,
    paddingTop: 78,
  },

  clearButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  clearText: {
    color: "#111111",
    fontSize: 15,
    textDecorationLine: "underline",
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 18,
    color: "#555555",
    fontWeight: "600",
  },

  noticeList: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 28,
    paddingTop: 24,
  },

  noticeCard: {
    minHeight: 82,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#A7A7A7",
    borderRadius: 7,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 46,
    marginBottom: 14,
    justifyContent: "center",
  },

  noticeTextBox: {
    gap: 6,
  },

  noticeTitle: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "700",
  },

  noticeMessage: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 21,
  },

  dismissButton: {
    position: "absolute",
    top: 13,
    right: 13,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  dismissText: {
    color: "#333333",
    fontSize: 24,
    lineHeight: 26,
  },
});
