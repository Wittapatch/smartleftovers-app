import { useState } from "react";
import {Alert,FlatList,Image,KeyboardAvoidingView,Modal,Platform,ScrollView,StyleSheet,Switch,Text,TextInput,TouchableOpacity,View,} from "react-native";
import CameraCapture from "@/components/CameraCapture";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";

interface FoodItem {
  id: string;
  imageUri: string | null;
  name: string;
  type: string;
  expiryDate: string;
  purchaseDate: string;
  amount: string;
  unit: string;
  description: string;
  useExtractFeature: boolean;
}

interface FoodDraft {
  imageUri: string | null;
  name: string;
  type: string;
  expiryDate: string;
  purchaseDate: string;
  amount: string;
  unit: string;
  description: string;
  useExtractFeature: boolean;
}

const getTodayDate = () => {
  const today = new Date();

  return today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
};

const createEmptyDraft = (): FoodDraft => {
  return {
    imageUri: null,
    name: "",
    type: "",
    expiryDate: "",
    purchaseDate: getTodayDate(),
    amount: "",
    unit: "",
    description: "",
    useExtractFeature: false,
  };
};

export default function HomeScreen() {

  const router = useRouter();

  const [foods, setFoods] = useState<FoodItem[]>([]);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const [draft, setDraft] = useState<FoodDraft>(createEmptyDraft());

  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  const openCamera = () => {
    setEditingFoodId(null);
    setDraft(createEmptyDraft());
    setShowCameraModal(true);
  };

  const openEditFood = (food: FoodItem) => {
    setEditingFoodId(food.id);

    setDraft({
      imageUri: food.imageUri,
      name: food.name,
      type: food.type,
      expiryDate: food.expiryDate,
      purchaseDate: food.purchaseDate,
      amount: food.amount,
      unit: food.unit,
      description: food.description,
      useExtractFeature: food.useExtractFeature,
    });

    setShowFormModal(true);
  };

  const deleteFood = (foodId: string) => {
    setFoods((currentFoods) =>
      currentFoods.filter((food) => food.id !== foodId)
    );
  };

  const showFoodOptions = (food: FoodItem) => {
    Alert.alert(food.name, "Choose an action", [
      {
        text: "Edit",
        onPress: () => openEditFood(food),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteFood(food.id),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const saveFood = () => {
    if (draft.name.trim() === "") {
      Alert.alert("Missing name", "Name is important. Please enter food name.");
      return;
    }

    if (editingFoodId) {
      setFoods((currentFoods) =>
        currentFoods.map((food) =>
          food.id === editingFoodId
            ? {
                ...food,
                imageUri: draft.imageUri,
                name: draft.name,
                type: draft.type,
                expiryDate: draft.expiryDate,
                purchaseDate: draft.purchaseDate,
                amount: draft.amount,
                unit: draft.unit,
                description: draft.description,
                useExtractFeature: draft.useExtractFeature,
              }
            : food
        )
      );
    } else {
      const newFood: FoodItem = {
        id: Date.now().toString(),
        imageUri: draft.imageUri,
        name: draft.name,
        type: draft.type,
        expiryDate: draft.expiryDate,
        purchaseDate: draft.purchaseDate,
        amount: draft.amount,
        unit: draft.unit,
        description: draft.description,
        useExtractFeature: draft.useExtractFeature,
      };

      setFoods((currentFoods) => [newFood, ...currentFoods]);
    }

    setShowFormModal(false);
    setEditingFoodId(null);
    setDraft(createEmptyDraft());
  };

  const renderFoodCard = ({ item }: { item: FoodItem }) => {
    return (
      <View style={styles.card}>
        {/* Only show image if this food has an image */}
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.foodImage} />
        )}

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => showFoodOptions(item)}
        >
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.cardTextBox}>
          <Text style={styles.foodName}>{item.name}</Text>

          <Text style={styles.foodText}>Type: {item.type || "-"}</Text>
          <Text style={styles.foodText}>Expiry: {item.expiryDate || "-"}</Text>
          <Text style={styles.foodText}>
            Purchased: {item.purchaseDate || "-"}
          </Text>
          <Text style={styles.foodText}>
            Amount: {item.amount || "-"} {item.unit}
          </Text>
          <Text style={styles.foodText}>
            Description: {item.description || "-"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {foods.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No food added yet</Text>
          <Text style={styles.emptyText}>
            Press + to take a picture and add your first food item.
          </Text>
        </View>
      ) : (
        <FlatList
          data={foods}
          renderItem={renderFoodCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.cardRow}
          contentContainerStyle={styles.foodList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom action buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => Alert.alert("Filter", "Add filter feature later")}
        >
          <IconSymbol size={30} name="line.3.horizontal.decrease.circle.fill" color="#222222" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleButton} onPress={openCamera}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.push("/ChatScreen")}
        >
          <IconSymbol size={30} name="message.fill" color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Camera modal */}
      <Modal visible={showCameraModal} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraCapture
            onPhotoTaken={(uri) => {
              setDraft((currentDraft) => ({
                ...currentDraft,
                imageUri: uri,
              }));

              setShowCameraModal(false);
              setShowFormModal(true);
            }}
          />

          <TouchableOpacity
            style={styles.closeCameraButton}
            onPress={() => setShowCameraModal(false)}
          >
            <Text style={styles.closeCameraText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add/Edit food form modal */}
      <Modal visible={showFormModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.formBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>
                {editingFoodId ? "Edit Food" : "Add Food"}
              </Text>

              {draft.imageUri && (
                <Image source={{ uri: draft.imageUri }} style={styles.previewImage} />
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Use extract feature</Text>

                <Switch
                  value={draft.useExtractFeature}
                  onValueChange={(value) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      useExtractFeature: value,
                    }))
                  }
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Name *"
                placeholderTextColor="#999999"
                value={draft.name}
                onChangeText={(text) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    name: text,
                  }))
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Type"
                placeholderTextColor="#999999"
                value={draft.type}
                onChangeText={(text) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    type: text,
                  }))
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Expiry date"
                placeholderTextColor="#999999"
                value={draft.expiryDate}
                onChangeText={(text) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    expiryDate: text,
                  }))
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Purchase date"
                placeholderTextColor="#999999"
                value={draft.purchaseDate}
                onChangeText={(text) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    purchaseDate: text,
                  }))
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor="#999999"
                value={draft.amount}
                keyboardType="numeric"
                onChangeText={(text) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    amount: text,
                  }))
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Unit"
                placeholderTextColor="#999999"
                value={draft.unit}
                onChangeText={(text) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    unit: text,
                  }))
                }
              />

              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description"
                placeholderTextColor="#999999"
                value={draft.description}
                multiline
                onChangeText={(text) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    description: text,
                  }))
                }
              />

              <TouchableOpacity style={styles.saveButton} onPress={saveFood}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowFormModal(false);
                  setEditingFoodId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  foodList: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 190,
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
  },

  foodImage: {
    width: "100%",
    height: 90,
  },

  menuButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  menuText: {
    fontSize: 18,
    color: "#222222",
    fontWeight: "700",
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
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#F3F4FA",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },

  circleIcon: {
    fontSize: 28,
    color: "#222222",
  },

  plusIcon: {
    fontSize: 36,
    color: "#222222",
    marginTop: -3,
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

  closeCameraButton: {
    position: "absolute",
    top: 55,
    left: 20,
    backgroundColor: "black",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  closeCameraText: {
    color: "white",
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

  saveButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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