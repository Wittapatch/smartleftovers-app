import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Alert, Button, Image, Text, TouchableOpacity, View } from "react-native";

// Interface for props passed into this component
interface CameraCaptureProps {
  onPhotoTaken?: (uri: string) => void;
}

export default function CameraCapture({ onPhotoTaken }: CameraCaptureProps) {
  // Reference to the camera, so we can call takePictureAsync()
  const cameraRef = useRef<CameraView | null>(null);

  // permission = camera permission status
  // requestPermission = function that asks user for camera permission
  const [permission, requestPermission] = useCameraPermissions();

  // Store the photo URI after taking a picture
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Function that runs when user presses Take Picture
  const takePhoto = async () => {

    // If camera is not ready, stop the function
    if (!cameraRef.current) {
      Alert.alert("Camera not ready");
      return;
    }

    // If camera is not ready, stop the function
    if (!cameraRef.current) {
      Alert.alert("Camera not ready");
      return;
    }
    
    // The actual picture that is taken is saved here
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    // Check if photo has a URI
    if (photo?.uri) {
      // Save URI inside this component
      setPhotoUri(photo.uri);

      // Send URI back to parent screen
      onPhotoTaken?.(photo.uri);

      // Show alert
      Alert.alert("Photo taken");
    }
  };

  // While permission is loading
  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading camera permission</Text>
      </View>
    );
  }

  // If permission is not allowed yet
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Camera permission is needed</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  // Return the UI
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>


      {/* This line only shows the camera preview */}
      {/* facing="back" means it will use the back camera of your phone*/}
      {/* facing="front" means it will use your selfie camera*/}
      {/* Connect this CameraView to cameraRef so I can use it later*/}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* Button that takes picture */}
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

      {/* Show preview only after photoUri has value */}
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