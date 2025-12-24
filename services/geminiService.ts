
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
  // 1. Ambil API Key dari environment Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key tidak terbaca oleh sistem. Pastikan Redeploy sudah selesai.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 2. Gunakan model flash tanpa embel-embel versi untuk stabilitas
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const base64_1 = await fileToBase64(file1);
    const base64_2 = await fileToBase64(file2);

    const prompt = `Lakukan perbandingan dokumen. Berikan output HANYA dalam format JSON Bahasa Indonesia. 
    Struktur: {"summary": "string", "matches": [], "differences": [], "verdict": "string", "confidenceScore": 0.9}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64_1, mimeType: file1.type } },
      { inlineData: { data: base64_2, mimeType: file2.type } },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Membersihkan karakter aneh yang mungkin dikirim AI
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText) as ComparisonResult;

  } catch (err: any) {
    console.error("DEBUG ERROR:", err);
    
    // Memberikan pesan error yang lebih spesifik agar kita tahu masalahnya
    if (err.message?.includes("API_KEY_INVALID")) {
      throw new Error("Kunci API salah. Silakan salin ulang dari Google AI Studio.");
    } else if (err.message?.includes("location is not supported")) {
      throw new Error("Wilayah akses tidak didukung oleh Google.");
    }
    
    throw new Error("Terjadi gangguan komunikasi dengan AI. Coba segarkan halaman.");
  }
};
