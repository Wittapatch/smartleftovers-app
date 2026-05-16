import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const getMimeType = (uri: string) => {
  // Preserve the correct image type when converting a local file to a data URI.
  const lowerUri = uri.toLowerCase();

  if (lowerUri.endsWith(".png")) {
    return "image/png";
  }

  if (lowerUri.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
};

const blobToDataUri = (blob: Blob) => {
  // Browser FileReader converts uploaded/selected image blobs into base64 data URIs.
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function prepareImageUriForStorage(imageUri: string | null) {
  // Store images as data URIs so they can be displayed across web and native sessions.
  if (!imageUri || imageUri.startsWith("data:") || imageUri.startsWith("http")) {
    return imageUri;
  }

  if (Platform.OS === "web") {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return blobToDataUri(blob);
  }

  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `data:${getMimeType(imageUri)};base64,${base64Image}`;
}

export function chooseWebImageData() {
  // Web cannot use the native camera component, so open a file picker instead.
  return new Promise<string | null>((resolve, reject) => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      resolve(null);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        resolve(null);
        return;
      }

      try {
        resolve(await blobToDataUri(file));
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}
