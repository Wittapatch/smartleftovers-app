export interface ExtractedFoodData {
    name:string;
    food_type: string;
    price: string;
    quantity: string;
    unit: string;
    expiry_date: string;
    purchase_date: string;
    description: string;
}

function cleanGeminiJsonText(text: string) {
    return text.replace(/```json/g, "").replace(/```/g,"").trim();
}

export async function analyzeImageWithGemini(localUri: string) {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    if (!API_URL) {
        throw new Error("Missing API");
    }

    const formData = new FormData();

    formData.append("image", {
        uri:localUri,
        name:`food-${Date.now()}.jpg`,
        type: "image/jpeg",
    } as any);

    const response = await fetch(`${API_URL}/analyze-image`, {
        method: "POST",
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Image analysize failed");
    }

    const rawText = data.response || "";

    let extractedData: ExtractedFoodData | null = null;

    try {
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