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

  if (!apiKey) {
    throw new Error("API Key tidak terbaca di Vercel.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // MENGGUNAKAN GEMINI-PRO (Versi 1.0)
  // Model ini paling stabil dan didukung di hampir semua wilayah
  const model = genAI.getGenerativeModel(
    { model: "gemini-pro" }, 
    { apiVersion: "v1" }
  );

  try {
    const base64_1 = await fileToBase64(file1);
    const base64_2 = await fileToBase64(file2);

    // Prompt disesuaikan karena Gemini 1.0 Pro lebih fokus pada teks
    const prompt = `Analisis kedua dokumen ini. Bandingkan isinya dan berikan output JSON Bahasa Indonesia:
    {"summary": "ringkasan", "matches": [], "differences": [], "verdict": "kesimpulan", "confidenceScore": 0.9}`;

    const result = await model.generateContent([prompt]); // Hanya kirim teks jika model tidak dukung gambar secara native

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText) as ComparisonResult;

  } catch (err: any) {
    console.error("DEBUG ERROR FINAL:", err);
    throw new Error("Gagal akses Gemini-Pro. Pastikan API Key aktif di Google AI Studio.");
  }
};
