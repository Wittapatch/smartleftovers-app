import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  logoContainer: {
    marginBottom: 70,
    alignItems: "center",
    width: "100%",
  },

  logoText: {
    color: "#111111",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
  },

  logoBigLetter: {
    fontSize: 50,
    fontWeight: "800",
  },

  input: {
    width: "100%",
    maxWidth: 520,
    height: 48,
    backgroundColor: "#F0F1F6",
    borderRadius: 24,
    paddingHorizontal: 18,
    marginBottom: 18,
    fontSize: 15,
    color: "#111111",

    borderWidth: 1,
    borderColor: "#D6D6D6",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  button: {
    width: "75%",
    maxWidth: 390,
    height: 48,
    backgroundColor: "#F0F1F6",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,

    borderWidth: 1,
    borderColor: "#D6D6D6",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },

  buttonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "500",
  },

  errorText: {
    maxWidth: 520,
    color: "#D0342C",
    fontSize: 14,
    marginTop: 14,
    textAlign: "center",
  },
});
