import { GoogleGenAI } from "@google/genai";

// Initialize the API
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY || "" });

export async function POST(req: Request) {
  if (!process.env.GOOGLE_AI_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { prompt } = await req.json();

    // Generate content using the simplified approach
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const result = await response;
    const text = result.text ?? "No text generated";

    return Response.json({ message: text });
  } catch (error: unknown) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate response";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
