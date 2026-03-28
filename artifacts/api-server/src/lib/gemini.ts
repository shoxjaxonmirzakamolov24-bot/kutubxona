import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

export async function explainText(text: string): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Siz tibbiy ta'lim yordamchisisiz. Quyidagi tibbiy matnni o'zbek tilida, oddiy va tushunarli tilda tushuntiring. Haqiqiy hayotiy misollar keltiring. Matn:

"${text}"

Tushuntirish:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateTest(text: string): Promise<McqQuestion[]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a medical education assistant. Based on the following medical text, generate 5-10 multiple choice questions in Uzbek language. 

Text: "${text}"

Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "question": "Savol matni?",
    "options": ["A variant", "B variant", "C variant", "D variant"],
    "correctIndex": 0,
    "explanation": "Tushuntirish"
  }
]`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse MCQ questions from AI response");
  }

  return JSON.parse(jsonMatch[0]) as McqQuestion[];
}

export async function generateNotes(text: string): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Siz tibbiy ta'lim yordamchisisiz. Quyidagi tibbiy matnni o'zbek tilida qisqa va aniq nuqtali eslatmalarga (bullet points) aylantiring. Har bir nuqta muhim ma'lumotni ifodalashi kerak. Matn:

"${text}"

Nuqtali eslatmalar:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function summarizeText(text: string): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Siz tibbiy ta'lim yordamchisisiz. Quyidagi tibbiy matnni o'zbek tilida 3-5 jumlada qisqacha xulosalang. Matn:

"${text}"

Xulosa:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
