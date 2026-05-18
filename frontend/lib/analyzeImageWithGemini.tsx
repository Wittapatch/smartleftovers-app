import { Platform } from "react-native";
import { getApiUrl } from "./api";

// This file sends a food photo to the backend for Gemini to analyze.
// The result is used to fill the add-food form.

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
    // Sometimes Gemini wraps JSON in markdown, so we clean that first.
    return text.replace(/```json/g, "").replace(/```/g,"").trim();
}

export async function analyzeImageWithGemini(localUri: string) {
    const API_URL = getApiUrl();

    if (!API_URL) {
        throw new Error("Missing API");
    }

    const formData = new FormData();

    // Web and mobile attach image files in different ways, so we handle both.
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
        // Keep the raw Gemini text too in case the JSON parsing fails.
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
