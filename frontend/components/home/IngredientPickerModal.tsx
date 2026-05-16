import { styles } from "@/components/styles/index.styles";
import { FoodItem } from "@/components/home/types";
import {
  FlatList,
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface IngredientPickerModalProps {
  // Lets the user choose which saved foods should be sent to ChefBot.
  chatServings: string;
  foods: FoodItem[];
  selectedFoodIds: string[];
  visible: boolean;
  onCancel: () => void;
  onOpenChefBot: () => void;
  onSetChatServings: (servings: string) => void;
  onToggleFood: (foodId: string) => void;
}

export function IngredientPickerModal({
  chatServings,
  foods,
  selectedFoodIds,
  visible,
  onCancel,
  onOpenChefBot,
  onSetChatServings,
  onToggleFood,
}: IngredientPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.modalOverlay}>
          <View style={styles.ingredientPickerBox}>
            <Text style={styles.formTitle}>Choose ingredients</Text>
            <Text style={styles.ingredientPickerSubtitle}>
              ChefBot will create dish ideas from the foods you select.
            </Text>

            <TextInput
              // Serving count is sent as context; it does not change inventory amounts.
              style={styles.input}
              placeholder="Number of servings"
              placeholderTextColor="#999999"
              value={chatServings}
              keyboardType="numeric"
              onChangeText={onSetChatServings}
            />

            <FlatList
              // The checkmark state is controlled by selectedFoodIds from HomeScreen.
              data={foods}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.ingredientList}
              renderItem={({ item }) => {
                const isSelected = selectedFoodIds.includes(item.id);

                return (
                  <TouchableOpacity
                    style={[
                      styles.ingredientRow,
                      isSelected && styles.ingredientRowSelected,
                    ]}
                    onPress={() => onToggleFood(item.id)}
                  >
                    <View style={styles.ingredientTextBox}>
                      <Text style={styles.ingredientName}>{item.name}</Text>
                      <Text style={styles.ingredientMeta}>
                        {item.amount || "-"} {item.unit}
                        {item.expiryDate ? ` - Expiry: ${item.expiryDate}` : ""}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.ingredientCheck,
                        isSelected && styles.ingredientCheckSelected,
                      ]}
                    />
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity style={styles.saveButton} onPress={onOpenChefBot}>
              <Text style={styles.saveButtonText}>Ask ChefBot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
