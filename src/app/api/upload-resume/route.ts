import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY || "" });

function parsePdfBuffer(
  buffer: Buffer
): Promise<{ pdfData: unknown; rawText: string }> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError);
    });
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const rawText = pdfParser.getRawTextContent();
      resolve({ pdfData, rawText });
    });
    pdfParser.parseBuffer(buffer);
  });
}

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

  try {
    const { pdfData, rawText } = await parsePdfBuffer(buffer);

    const prompt = `
    You are a world-class career coach and resume analyst.
    Given the following resume data, extract and return a JSON object with these keys:
    
    - summary: A concise summary of what this resume is for (role, industry, seniority).
    - skills: An array of objects, each with:
        - name: The skill name.
        - percentage: A number (0-100) representing how strongly this skill is emphasized in the resume, based on frequency, context, and detail.
        - reason: A short explanation of why this percentage was assigned, referencing the resume content.
    - highlights: 3-5 key highlights or achievements (as a JSON array).
    - value: A one-sentence value proposition for the candidate.
    - segments: An array listing all major sections/segments found in the resume (e.g., Education, Experience, Projects, Certifications).
    - improvementSuggestions: Array of actionable suggestions to improve the resume, based on the analysis above.
    - experience: Array of objects with company, role, duration, and key responsibilities.
    - education: Array of objects with degree, institution, year, and honors.
    - formatting: Short assessment of formatting/readability.
    - keywordMatch: List of missing keywords for the target role/industry.
    
    Example output:
    {
      "summary": "...",
      "skills": [
        {
          "name": "JavaScript",
          "percentage": 80,
          "reason": "Mentioned in multiple projects and work experience, with detailed descriptions."
        }
      ],
      "highlights": ["...", "..."],
      "value": "...",
      "segments": ["Education", "Experience", "Skills", "Projects"],
      "improvementSuggestions": ["Add more quantifiable achievements.", "Include a Certifications section."],
      "experience": [
        {
          "company": "Acme Corp",
          "role": "Software Engineer",
          "duration": "2021-2023",
          "responsibilities": "Developed web applications using React and Node.js."
        }
      ],
      "education": [
        {
          "degree": "B.Tech Computer Science",
          "institution": "XYZ University",
          "year": "2021",
          "honors": "First Class"
        }
      ],
      "formatting": "Good use of headings and bullet points, but font size is inconsistent.",
      "keywordMatch": ["React", "Node.js", "Agile"]
    }
    
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

    return NextResponse.json({
      ...analysis,
      rawText,
      pdfData,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
