import { NextRequest, NextResponse } from "next/server";
import  PDFParser  from "pdf2json";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY || "" });

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_AI_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("resume") as File;
  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // pdf2json is event-based, so we wrap in a Promise
  return new Promise((resolve) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      resolve(
        NextResponse.json({ error: errData.parserError }, { status: 500 })
      );
    });

    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      const rawText = pdfParser.getRawTextContent();
      // You can also send pdfData (the full JSON) for more context
      const prompt = `
You are a world-class career coach and resume analyst.
Given the following resume data, extract:
- A concise summary of what this resume is for (role, industry, seniority).
- The top 8-10 technical and soft skills (as a JSON array).
- 3-5 key highlights or achievements (as a JSON array).
- A one-sentence value proposition for the candidate.

Return your answer as a JSON object with keys: summary, skills, highlights, value.

Resume JSON:
${JSON.stringify(pdfData, null, 2)}

Raw extracted text:
"""${rawText}"""
`;

      let analysis = {};
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const text = response.text ?? "";
        analysis = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch (e) {
        analysis = {
          summary: e instanceof Error ? e.message : "AI analysis failed.",
          skills: [],
          highlights: [],
          value: "",
          raw: "AI analysis failed.",
        };
      }

      resolve(
        NextResponse.json({
          ...analysis,
          rawText,
          pdfData,
        })
      );
    });

    pdfParser.parseBuffer(buffer);
  });
}
