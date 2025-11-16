
import { GoogleGenAI, Modality } from "@google/genai";

interface ImagePayload {
  data: string; // base64 encoded string
  mimeType: string;
}

export async function generateOrEditImage(
  prompt: string,
  image?: ImagePayload
): Promise<string> {
  // It's recommended to create a new instance for each call if the API key
  // could change, but for this app, a single instance is fine.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts = [];

  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    });
  }

  if (prompt) {
    parts.push({
      text: prompt,
    });
  }

  if (parts.length === 0) {
    throw new Error("Prompt and/or image must be provided.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        // Must be an array with a single `Modality.IMAGE` element.
        responseModalities: [Modality.IMAGE], 
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in the API response.");
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Enhance error message for common issues
    if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
      throw new Error("The provided API key is invalid. Please check your environment configuration.");
    }
    throw new Error("Failed to generate image. Please check the console for more details.");
  }
}
