import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Alert, Button, Image, Text, TouchableOpacity, View } from "react-native";

interface CameraCaptureProps {
  // Sends the captured local image URI back to the parent modal.
  onPhotoTaken?: (uri: string) => void;
}

export default function CameraCapture({ onPhotoTaken }: CameraCaptureProps) {
  // Reference to the camera, so the capture button can call takePictureAsync().
  const cameraRef = useRef<CameraView | null>(null);

  // permission is the current camera permission; requestPermission opens the prompt.
  const [permission, requestPermission] = useCameraPermissions();

  // Store the photo URI after taking a picture
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const takePhoto = async () => {

    // Stop early if the native camera view has not mounted yet.
    if (!cameraRef.current) {
      Alert.alert("Camera not ready");
      return;
    }
    
    // The picture is stored by Expo as a local file URI.
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    // Check if photo has a URI
    if (photo?.uri) {
      // Save a small preview locally and notify the parent screen.
      setPhotoUri(photo.uri);

      onPhotoTaken?.(photo.uri);

      // Show alert
      Alert.alert("Photo taken");
    }
  };

  // While permission is loading, avoid rendering the camera view.
  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading camera permission</Text>
      </View>
    );
  }

  // Ask for camera permission before showing the capture UI.
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


      {/* Camera preview connected to cameraRef so the button can take a photo. */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* Custom shutter button layered over the camera preview. */}
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

      {/* Show a small preview after capture so the user knows the photo was taken. */}
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
