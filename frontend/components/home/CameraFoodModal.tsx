import CameraCapture from "@/components/CameraCapture";
import { styles } from "@/components/styles/index.styles";
import { Modal, Text, TouchableOpacity, View } from "react-native";

// This modal shows the camera full screen.

interface CameraFoodModalProps {
  // Home only needs the final photo URI from this modal.
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
}

export function CameraFoodModal({
  visible,
  onClose,
  onPhotoTaken,
}: CameraFoodModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <CameraCapture onPhotoTaken={onPhotoTaken} />

        <TouchableOpacity style={styles.closeCameraButton} onPress={onClose}>
          <Text style={styles.closeCameraText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
