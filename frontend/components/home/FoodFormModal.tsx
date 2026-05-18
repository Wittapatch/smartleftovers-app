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

// This modal is used for both adding and editing food.
// It edits the draft, while Home handles the actual saving.

interface FoodFormModalProps {
  // The parent owns the draft so Home can control saving and cancelling.
  draft: FoodDraft;
  editingFoodId: string | null;
  errorMessage: string;
  loading: boolean;
  previewImageUri: string | null;
  saving: boolean;
  visible: boolean;
  onCancel: () => void;
  onExtract: () => void;
  onSave: () => void;
  setDraft: Dispatch<SetStateAction<FoodDraft>>;
}

export function FoodFormModal({
  draft,
  editingFoodId,
  errorMessage,
  loading,
  previewImageUri,
  saving,
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

            {/* Gemini extraction is optional, so users can still type manually. */}
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

            {/* These inputs update the draft before saving to the backend. */}
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Food name"
              placeholderTextColor="#999999"
              value={draft.name}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({ ...currentDraft, name: text }))
              }
            />

            <Text style={styles.inputLabel}>Type</Text>
            <TextInput
              style={styles.input}
              placeholder="Food type"
              placeholderTextColor="#999999"
              value={draft.type}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({ ...currentDraft, type: text }))
              }
            />

            <Text style={styles.inputLabel}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YY"
              placeholderTextColor="#999999"
              value={draft.expiryDate}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  expiryDate: text,
                }))
              }
            />

            <Text style={styles.inputLabel}>Purchase Date</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YY"
              placeholderTextColor="#999999"
              value={draft.purchaseDate}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  purchaseDate: text,
                }))
              }
            />

            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Number, for example 1 or 0.5"
              placeholderTextColor="#999999"
              value={draft.amount}
              keyboardType="numeric"
              onChangeText={(text) =>
                setDraft((currentDraft) => ({ ...currentDraft, amount: text }))
              }
            />

            <Text style={styles.inputLabel}>Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="kg, g, pieces, bottle"
              placeholderTextColor="#999999"
              value={draft.unit}
              onChangeText={(text) =>
                setDraft((currentDraft) => ({ ...currentDraft, unit: text }))
              }
            />

            <Text style={styles.inputLabel}>Description</Text>
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

            {errorMessage ? (
              <Text style={styles.formErrorText}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.saveButtonDisabled,
              ]}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save"}
              </Text>
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
