import { GoogleGenerativeAI } from "@google/generative-ai";
import { ComparisonResult } from "../types";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const performComparison = async (file1: File, file2: File): Promise<ComparisonResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) throw new Error("API Key tidak terbaca.");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // GUNAKAN PENAMAAN PALING SEDERHANA
  // Jika "gemini-1.5-flash" gagal, Google biasanya menyarankan "gemini-1.5-flash-latest"
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  try {
    const base64_1 = await fileToBase64(file1);
    const base64_2 = await fileToBase64(file2);

    const prompt = `Bandingkan dua dokumen ini dan berikan output JSON Bahasa Indonesia. 
    Format: {"summary": "string", "matches": [], "differences": [], "verdict": "string", "confidenceScore": 0.9}`;

    // Gunakan cara pemanggilan yang lebih kompatibel
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64_1, mimeType: file1.type } },
      { inlineData: { data: base64_2, mimeType: file2.type } },
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText) as ComparisonResult;

  } catch (err: any) {
    console.error("LOG ERROR TERAKHIR:", err);
    throw new Error("Layanan AI sedang sibuk atau wilayah tidak didukung. Coba beberapa saat lagi.");
  }
};
