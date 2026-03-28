import { GoogleGenAI } from "@google/genai";

const BASE_URL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const API_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

let _ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_ai) {
    if (!API_KEY) {
      throw new Error("AI API key not configured.");
    }
    _ai = new GoogleGenAI({
      apiKey: API_KEY,
      ...(BASE_URL
        ? { httpOptions: { apiVersion: "", baseUrl: BASE_URL } }
        : {}),
    });
  }
  return _ai;
}

export interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

export async function explainText(text: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Siz tibbiy ta'lim yordamchisisiz. Quyidagi tibbiy matnni o'zbek tilida, oddiy va tushunarli tilda tushuntiring. Haqiqiy hayotiy misollar keltiring. Matn:\n\n"${text}"\n\nTushuntirish:`,
          },
        ],
      },
    ],
    config: { maxOutputTokens: 8192 },
  });
  return response.text ?? "";
}

export async function generateTest(text: string): Promise<McqQuestion[]> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a medical education assistant. Based on the following medical text, generate 5-10 multiple choice questions in Uzbek language.

Text: "${text}"

Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "question": "Savol matni?",
    "options": ["A variant", "B variant", "C variant", "D variant"],
    "correctIndex": 0,
    "explanation": "Tushuntirish"
  }
]`,
          },
        ],
      },
    ],
    config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
  });

  const responseText = (response.text ?? "").trim();
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse MCQ questions from AI response");
  }
  return JSON.parse(jsonMatch[0]) as McqQuestion[];
}

export async function generateNotes(text: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Siz tibbiy ta'lim yordamchisisiz. Quyidagi tibbiy matnni o'zbek tilida qisqa va aniq nuqtali eslatmalarga (bullet points) aylantiring. Har bir nuqta muhim ma'lumotni ifodalashi kerak. Matn:\n\n"${text}"\n\nNuqtali eslatmalar:`,
          },
        ],
      },
    ],
    config: { maxOutputTokens: 8192 },
  });
  return response.text ?? "";
}

export async function summarizeText(text: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Siz tibbiy ta'lim yordamchisisiz. Quyidagi tibbiy matnni o'zbek tilida 3-5 jumlada qisqacha xulosalang. Matn:\n\n"${text}"\n\nXulosa:`,
          },
        ],
      },
    ],
    config: { maxOutputTokens: 8192 },
  });
  return response.text ?? "";
}
