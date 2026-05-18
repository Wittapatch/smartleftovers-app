import { styles } from "@/components/styles/index.styles";
import { Image, Modal, Text, TouchableOpacity } from "react-native";

// This modal shows a saved food photo in full screen.

interface ImagePreviewModalProps {
  // null hides the modal, and a real URI shows the image.
  imageUri: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUri, onClose }: ImagePreviewModalProps) {
  return (
    <Modal visible={Boolean(imageUri)} animationType="fade" transparent>
      <TouchableOpacity
        style={styles.imagePreviewOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.fullImagePreview}
            resizeMode="contain"
          />
        )}

        <TouchableOpacity style={styles.closeImagePreviewButton} onPress={onClose}>
          <Text style={styles.closeImagePreviewText}>Close</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
