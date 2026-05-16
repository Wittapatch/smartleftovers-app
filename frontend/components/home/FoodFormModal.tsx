import { styles } from "@/components/styles/index.styles";
import { FoodDraft } from "@/components/home/types";
import { Dispatch, SetStateAction } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FoodFormModalProps {
  // The parent owns draft state so save/cancel/edit behavior stays in HomeScreen.
  draft: FoodDraft;
  editingFoodId: string | null;
  loading: boolean;
  previewImageUri: string | null;
  visible: boolean;
  onCancel: () => void;
  onExtract: () => void;
  onSave: () => void;
  setDraft: Dispatch<SetStateAction<FoodDraft>>;
}

export function FoodFormModal({
  draft,
  editingFoodId,
  loading,
  previewImageUri,
  visible,
  onCancel,
  onExtract,
  onSave,
  setDraft,
}: FoodFormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.formBox}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.formTitle}>
              {editingFoodId ? "Edit Food" : "Add Food"}
            </Text>

            {previewImageUri && (
              <Image source={{ uri: previewImageUri }} style={styles.previewImage} />
            )}

            {/* Gemini extraction is optional; users can still type every field manually. */}
            {loading && (
              <Text style={styles.loadingText}>Extracting food information...</Text>
            )}

            <TouchableOpacity
              style={[
                styles.extractButton,
                (!previewImageUri || loading) && styles.extractButtonDisabled,
              ]}
              onPress={onExtract}
              disabled={!previewImageUri || loading}
            >
              <Text style={styles.extractButtonText}>
                {loading ? "Extracting..." : "Extract food info"}
              </Text>
            </TouchableOpacity>

            {/* Each input updates one field in the draft without saving to the backend yet. */}
            <TextInput
              style={styles.input}
              placeholder="Name *"
              placeholderTextColor="#999999"
              value={draft.name}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({ ...currentDraft, name: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Type"
              placeholderTextColor="#999999"
              value={draft.type}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({ ...currentDraft, type: text }))
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
                setDraft((currentDraft) => ({ ...currentDraft, amount: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Unit"
              placeholderTextColor="#999999"
              value={draft.unit}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({ ...currentDraft, unit: text }))
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

            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
