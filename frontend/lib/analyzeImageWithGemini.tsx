import { Platform } from "react-native";
import { getApiUrl } from "./api";

export interface ExtractedFoodData {
    name:string;
    food_type: string;
    quantity: string;
    unit: string;
    expiry_date: string;
    purchase_date: string;
    description: string;
}

function cleanGeminiJsonText(text: string) {
    // Gemini can occasionally wrap JSON in markdown fences; remove those first.
    return text.replace(/```json/g, "").replace(/```/g,"").trim();
}

export async function analyzeImageWithGemini(localUri: string) {
    const API_URL = getApiUrl();

    if (!API_URL) {
        throw new Error("Missing API");
    }

    const formData = new FormData();

    // Web gives a blob URL, while native expects a { uri, name, type } file object.
    if (Platform.OS === "web") {
        const imageResponse = await fetch(localUri);
        const imageBlob = await imageResponse.blob();
        formData.append("image", imageBlob, `food-${Date.now()}.jpg`);
    } else {
        formData.append("image", {
            uri:localUri,
            name:`food-${Date.now()}.jpg`,
            type: "image/jpeg",
        } as any);
    }

    const response = await fetch(`${API_URL}/analyze-image`, {
        method: "POST",
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
        body: formData,
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
        throw new Error(data.error || "Image analysize failed");
    }

    const rawText = data.response || "";

    let extractedData: ExtractedFoodData | null = null;

    try {
        // Keep the raw Gemini text too, so the UI can show/debug extraction failures.
        const cleanedText = cleanGeminiJsonText(rawText);
        extractedData = JSON.parse(cleanedText);
    } catch (error) {
        console.log("Error Gemini text", rawText);
    }

    return {
        rawText,
        extractedData,
    };
}
