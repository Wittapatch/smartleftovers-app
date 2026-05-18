import { StyleSheet } from "react-native";

// Styles for the settings page.

export const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  container: {
    flexGrow: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 28,
    paddingTop: 90,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  row: {
    height: 54,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowText: {
    fontSize: 16,
    color: "#111111",
    fontWeight: "400",
  },

  arrow: {
    fontSize: 28,
    color: "#B5B5B5",
  },

  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginLeft: 18,
  },

  dropdownBox: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  label: {
    fontSize: 13,
    color: "#555555",
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    height: 42,
    backgroundColor: "#F0F1F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginBottom: 8,
    color: "#111111",
    borderWidth: 1,
    borderColor: "#D6D6D6",
  },

  feedbackText: {
    backgroundColor: "#E8F5E9",
    borderColor: "#8BC34A",
    borderRadius: 12,
    borderWidth: 1,
    color: "#1B5E20",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  feedbackErrorText: {
    backgroundColor: "#FDECEA",
    borderColor: "#F5A29A",
    color: "#B3261E",
  },

  smallButton: {
    height: 40,
    backgroundColor: "#F0F1F6",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
  },

  smallButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "500",
  },

  logoutButton: {
    paddingVertical: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#D0342C",
    fontWeight: "600",
    fontSize: 14,
  },

  optionText: {
    fontSize: 14,
    color: "#222222",
  },

  switchRow: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
