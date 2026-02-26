import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function translateText(text: string, targetLanguage: string = "Burmese"): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a professional translator for web novels.
      Translate the following text into natural, fluent ${targetLanguage}.
      Maintain the original tone and style.
      Do not add any explanations or notes, just the translation.
      
      Original Text:
      "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("AI Translation Error:", error);
    throw new Error("Failed to translate text.");
  }
}
