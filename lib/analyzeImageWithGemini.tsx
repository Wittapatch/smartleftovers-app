import * as FileSystem from "expo-file-system/legacy";

export async function analyzeImageWithGemini(localUri: string) {
    // Get Gemini API key from Expo .env.
    // This is only for temporary testing.

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Gemini API key");
    }

    // Convert the local image file into Base64 text.
    // where the localUri comes from camera photo.uri
    const base64Image = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64
    });

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",

    )


}