import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Alert, Button, Image, Text, TouchableOpacity, View } from "react-native";

// This component opens the phone camera for adding food by photo.
// It asks for camera permission and sends the photo URI back to Home.

interface CameraCaptureProps {
  // Send the captured image URI back to the parent.
  onPhotoTaken?: (uri: string) => void;
}

export default function CameraCapture({ onPhotoTaken }: CameraCaptureProps) {
  // Keep a reference to the camera so the button can take a photo.
  const cameraRef = useRef<CameraView | null>(null);

  // permission stores the current camera permission.
  const [permission, requestPermission] = useCameraPermissions();

  // Store the photo URI after taking a picture.
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const takePhoto = async () => {

    // Stop if the camera is not ready yet.
    if (!cameraRef.current) {
      Alert.alert("Camera not ready");
      return;
    }
    
    // Expo saves the picture as a local file URI.
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    // Only continue if the photo has a URI.
    if (photo?.uri) {
      // Save a small preview and tell the parent screen.
      setPhotoUri(photo.uri);

      onPhotoTaken?.(photo.uri);

      // Let the user know the photo was taken.
      Alert.alert("Photo taken");
    }
  };

  // Wait for permission info before showing the camera.
  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading camera permission</Text>
      </View>
    );
  }

  // Ask for camera permission before showing the camera UI.
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Camera permission is needed</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>


      {/* Camera preview connected to cameraRef for taking photos. */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* Custom capture button on top of the camera preview. */}
      <TouchableOpacity
        onPress={takePhoto}
        activeOpacity={0.7}
        style={{
          position: "absolute",
          bottom: 90,
          alignSelf: "center",
          width: 82,
          height: 82,
          borderRadius: 41,
          backgroundColor: "rgba(255,255,255,0.35)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          elevation: 10,
        }}
      >
        <View
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            backgroundColor: "white",
            borderWidth: 3,
            borderColor: "#E5E5E5",
          }}
        />
      </TouchableOpacity>

      {/* Show a small preview after the photo is taken. */}
      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          style={{
            position: "absolute",
            top: 110,
            left: 20,
            width: 150,
            height: 150,
            borderRadius: 10,
            borderWidth: 3,
            borderColor: "white",
            zIndex: 10,
          }}
        />
      )}
    </View>
  );
}
