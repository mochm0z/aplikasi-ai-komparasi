import { GoogleGenerativeAI } from "@google/generative-ai";
import { ComparisonResult } from "../types";

// Fungsi pembantu untuk konversi file ke Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const performComparison = async (file1: File, file2: File): Promise<ComparisonResult> => {
  // 1. Mengambil API Key dari environment Vercel
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key tidak terbaca. Pastikan variabel VITE_GEMINI_API_KEY sudah disetel di Vercel.");
  }

  // 2. Inisialisasi Google AI
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 3. SOLUSI FINAL: Memaksa penggunaan versi API 'v1' untuk menghindari error 404
  // Ini akan memperbaiki masalah "models/gemini-1.5-flash is not found for API version v1beta"
  const model = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash-latest" },
    { apiVersion: "v1" } 
  );

  try {
    // 4. Proses konversi gambar
    const base64_1 = await fileToBase64(file1);
    const base64_2 = await fileToBase64(file2);

    // 5. Perintah analisis
    const prompt = `Analisis kedua gambar ini. Bandingkan teks dan datanya. 
    Berikan jawaban HANYA dalam format JSON murni Bahasa Indonesia:
    {
      "summary": "isi ringkasan",
      "matches": [{"category": "teks", "description": "isi sama"}],
      "differences": [{"category": "teks", "description": "isi beda", "severity": "high"}],
      "verdict": "kesimpulan",
      "confidenceScore": 0.9
    }`;

    // 6. Mengirim data ke Google Gemini
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64_1, mimeType: file1.type } },
      { inlineData: { data: base64_2, mimeType: file2.type } },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // 7. Pembersihan karakter Markdown jika ada
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText) as ComparisonResult;

  } catch (err: any) {
    // Menampilkan pesan error asli di Console (F12) untuk pelacakan
    console.error("DETEKSI ERROR GOOGLE:", err);
    
    // Memberikan instruksi spesifik jika masih gagal
    if (err.message?.includes("404")) {
      throw new Error("Model tidak ditemukan di wilayah Anda. Pastikan API Key benar.");
    }
    
    throw new Error("Gagal menganalisis. Silakan coba lagi setelah Hard Refresh (Ctrl+F5).");
  }
};
