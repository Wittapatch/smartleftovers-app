import { useState } from "react";
import { Text, View } from "react-native";
import CameraCapture from "@/components/CameraCapture";

export default function CameraScreen() {
  // Store photo URI from CameraCapture component
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);

  return (
    <View style={{ flex: 1 }}>
      {/* Use CameraCapture component */}
      {/* The taken photo will be send back to this screen */}
      <CameraCapture
        onPhotoTaken={(uri) => {
          // Save photo URI into this screen
          setSelectedPhotoUri(uri);
          // Print URI in terminal
          console.log("Photo URI:", uri);
        }}
      />

      {/* Show message after photo is taken */}
      {selectedPhotoUri && (
        <Text
          style={{
            position: "absolute",
            bottom: 50,
            alignSelf: "center",
            color: "white",
            backgroundColor: "black",
            padding: 8,
            borderRadius: 8,
          }}
        >
          Photo saved in screen state
        </Text>
      )}
    </View>
  );
}