import { styles } from "@/components/styles/index.styles";
import { FoodItem } from "@/components/home/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";

interface FoodCardProps {
  // FoodCard is display-only; parent callbacks handle editing, deleting, and image preview.
  food: FoodItem;
  displayImageUri: string | null;
  hasUnsyncedImage: boolean;
  isWebMenuOpen: boolean;
  onAddWebImage: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onPreviewImage: (imageUri: string) => void;
  onShowOptions: () => void;
  onCloseWebMenu: () => void;
}

export function FoodCard({
  food,
  displayImageUri,
  hasUnsyncedImage,
  isWebMenuOpen,
  onAddWebImage,
  onDelete,
  onEdit,
  onPreviewImage,
  onShowOptions,
  onCloseWebMenu,
}: FoodCardProps) {
  return (
    <View style={styles.card}>
      {/* Tapping the saved image opens the full-screen preview modal. */}
      {displayImageUri && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPreviewImage(displayImageUri)}
        >
          <Image source={{ uri: displayImageUri }} style={styles.foodImage} />
        </TouchableOpacity>
      )}

      {/* Web users can reattach an image when only a native file path was saved. */}
      {!displayImageUri && hasUnsyncedImage && (
        <TouchableOpacity style={styles.unsyncedImageBox} onPress={onAddWebImage}>
          <Text style={styles.unsyncedImageText}>Click to add image</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.menuButton} onPress={onShowOptions}>
        <MaterialIcons
          size={28}
          name="more-vert"
          color="#111111"
          style={styles.menuIcon}
        />
      </TouchableOpacity>

      {/* Native uses Alert options; web uses this inline menu. */}
      {Platform.OS === "web" && isWebMenuOpen && (
        <View style={styles.webMenu}>
          <TouchableOpacity
            style={styles.webMenuItem}
            onPress={() => {
              onCloseWebMenu();
              onEdit();
            }}
          >
            <Text style={styles.webMenuText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.webMenuItem}
            onPress={() => {
              onCloseWebMenu();
              onDelete();
            }}
          >
            <Text style={[styles.webMenuText, styles.webMenuDeleteText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.cardTextBox}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodText}>Type: {food.type || "-"}</Text>
        <Text style={styles.foodText}>Expiry: {food.expiryDate || "-"}</Text>
        <Text style={styles.foodText}>Purchased: {food.purchaseDate || "-"}</Text>
        <Text style={styles.foodText}>
          Amount: {food.amount || "-"} {food.unit}
        </Text>
        <Text style={styles.foodText}>
          Description: {food.description || "-"}
        </Text>
      </View>
    </View>
  );
}
