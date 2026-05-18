import { Platform, StyleSheet } from "react-native";

// Styles for Home, food cards, modals, and the bottom buttons.

export const styles = StyleSheet.create({


  loadingText: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 12,
    textAlign: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  foodList: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 190,
  },

  foodListWeb: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },

  cardRow: {
    justifyContent: "space-between",
  },

  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 18,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,

    ...(Platform.OS === "web"
      ? {
          width: "100%" as const,
        }
      : null),
  },

  foodImage: {
    width: "100%",
    height: 90,
  },

  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 58,
  },

  fullImagePreview: {
    width: "100%",
    height: "100%",
  },

  closeImagePreviewButton: {
    position: "absolute",
    top: 48,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  closeImagePreviewText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },

  unsyncedImageBox: {
    width: "100%",
    height: 90,
    backgroundColor: "#F0F1F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  unsyncedImageText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },

  menuButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  menuIcon: {
    lineHeight: 28,
  },

  webMenu: {
    position: "absolute",
    top: 42,
    right: 8,
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 20,
  },

  webMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  webMenuText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
  },

  webMenuDeleteText: {
    color: "#D0342C",
  },

  cardTextBox: {
    padding: 9,
  },

  foodName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },

  foodText: {
    fontSize: 12,
    color: "#111111",
    marginBottom: 2,
  },

  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 25,
    flexDirection: "row",
    justifyContent: "center",
    gap: 34,
  },

  circleButton: {
    width: 72,
    height: 72,
    borderRadius: 23,
    backgroundColor: "#F7F7FF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },

  circleIcon: {
    fontSize: 28,
    color: "#222222",
  },

  plusIcon: {
    fontSize: 38,
    color: "#222222",
    lineHeight: 42,
  },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
  },

  statusBanner: {
    position: "absolute",
    top: 54,
    left: 20,
    right: 20,
    zIndex: 30,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: "#E8F7EE",
    borderWidth: 1,
    borderColor: "#35C759",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  statusBannerText: {
    color: "#1F7A3A",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  closeCameraButton: {
    position: "absolute",
    top: 55,
    left: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  closeCameraText: {
    color: "#111111",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  formBox: {
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
  },

  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 14,
  },

  ingredientPickerBox: {
    maxHeight: "78%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
  },

  filterBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
  },

  sortOption: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sortOptionSelected: {
    borderColor: "#222222",
    backgroundColor: "#EFEFEF",
  },

  sortOptionText: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "600",
  },

  filterSectionTitle: {
    fontSize: 13,
    color: "#555555",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4,
  },

  ingredientPickerSubtitle: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 14,
    lineHeight: 20,
  },

  ingredientList: {
    maxHeight: 360,
    marginBottom: 12,
  },

  ingredientRow: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  ingredientRowSelected: {
    borderColor: "#222222",
    backgroundColor: "#EFEFEF",
  },

  ingredientSelectArea: {
    flex: 1,
  },

  ingredientTextBox: {
    flex: 1,
  },

  ingredientName: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "700",
    marginBottom: 3,
  },

  ingredientMeta: {
    fontSize: 12,
    color: "#555555",
  },

  ingredientQuantityInput: {
    width: 72,
    height: 40,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6D6D6",
    paddingHorizontal: 10,
    color: "#111111",
    textAlign: "center",
  },

  ingredientCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#CFCFCF",
  },

  ingredientCheckSelected: {
    backgroundColor: "#35C759",
    borderColor: "#35C759",
  },

  previewImage: {
    width: "100%",
    height: 170,
    borderRadius: 14,
    marginBottom: 14,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  switchText: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "500",
  },

  extractButton: {
    height: 46,
    borderRadius: 22,
    backgroundColor: "#35C759",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  extractButtonDisabled: {
    opacity: 0.45,
  },

  extractButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  inputLabel: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginLeft: 4,
  },

  input: {
    height: 46,
    backgroundColor: "#F0F1F6",
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    color: "#111111",
  },

  descriptionInput: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  formErrorText: {
    color: "#D0342C",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },

  saveButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  cancelButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0F1F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelButtonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "500",
  },
});
