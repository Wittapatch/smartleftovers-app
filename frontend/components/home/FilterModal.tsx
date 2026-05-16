import { styles } from "@/components/styles/index.styles";
import { SortMode } from "@/components/home/types";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface FilterModalProps {
  // Filter state lives in HomeScreen; this modal only presents choices.
  foodTypes: string[];
  selectedFoodType: string | null;
  sortMode: SortMode;
  visible: boolean;
  onClose: () => void;
  onSelectFoodType: (foodType: string | null) => void;
  onSelectSortMode: (sortMode: SortMode) => void;
}

export function FilterModal({
  foodTypes,
  selectedFoodType,
  sortMode,
  visible,
  onClose,
  onSelectFoodType,
  onSelectSortMode,
}: FilterModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.filterBox}>
          <Text style={styles.formTitle}>Filter food</Text>

          <Text style={styles.filterSectionTitle}>Food type</Text>

          {/* null means no food type filter is applied. */}
          <TouchableOpacity
            style={[
              styles.sortOption,
              selectedFoodType === null && styles.sortOptionSelected,
            ]}
            onPress={() => onSelectFoodType(null)}
          >
            <Text style={styles.sortOptionText}>All types</Text>
            <View
              style={[
                styles.ingredientCheck,
                selectedFoodType === null && styles.ingredientCheckSelected,
              ]}
            />
          </TouchableOpacity>

          {/* Food types are generated from the saved food list. */}
          {foodTypes.map((foodType) => (
            <TouchableOpacity
              key={foodType}
              style={[
                styles.sortOption,
                selectedFoodType === foodType && styles.sortOptionSelected,
              ]}
              onPress={() => onSelectFoodType(foodType)}
            >
              <Text style={styles.sortOptionText}>{foodType}</Text>
              <View
                style={[
                  styles.ingredientCheck,
                  selectedFoodType === foodType && styles.ingredientCheckSelected,
                ]}
              />
            </TouchableOpacity>
          ))}

          <Text style={styles.filterSectionTitle}>Sort</Text>

          <TouchableOpacity
            style={[
              styles.sortOption,
              sortMode === "none" && styles.sortOptionSelected,
            ]}
            onPress={() => onSelectSortMode("none")}
          >
            <Text style={styles.sortOptionText}>Default order</Text>
            <View
              style={[
                styles.ingredientCheck,
                sortMode === "none" && styles.ingredientCheckSelected,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortOption,
              sortMode === "name_az" && styles.sortOptionSelected,
            ]}
            onPress={() => onSelectSortMode("name_az")}
          >
            <Text style={styles.sortOptionText}>Name A to Z</Text>
            <View
              style={[
                styles.ingredientCheck,
                sortMode === "name_az" && styles.ingredientCheckSelected,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Apply</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
