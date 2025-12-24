import { GoogleGenerativeAI } from "@google/generative-ai";
import { ComparisonResult } from "../types";

// Fungsi untuk mengubah file menjadi format yang dimengerti AI
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Mengambil data murni base64 setelah tanda koma
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const performComparison = async (
  file1: File,
  file2: File
): Promise<ComparisonResult> => {
  // 1. Inisialisasi API dengan kunci dari Vercel
  // Pastikan di Vercel namanya VITE_GEMINI_API_KEY
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

  // 2. Pilih model yang paling stabil (Flash)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash"
  });

  // 3. Siapkan data file
  const base64_1 = await fileToBase64(file1);
  const base64_2 = await fileToBase64(file2);

  // 4. Buat perintah (prompt) untuk AI
  const prompt = `Analisis dan bandingkan kedua gambar/dokumen ini. 
  Fokus pada perbedaan teks dan data. 
  Berikan hasil dalam format JSON Bahasa Indonesia dengan struktur:
  {
    "summary": "ringkasan isi",
    "matches": [{"category": "nama kategori", "description": "penjelasan sama"}],
    "differences": [{"category": "nama kategori", "description": "penjelasan beda", "severity": "low/medium/high"}],
    "verdict": "kesimpulan akhir",
    "confidenceScore": 0.9
  }`;

  // 5. Jalankan proses pengiriman ke Google
  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64_1,
          mimeType: file1.type,
        },
      },
      {
        inlineData: {
          data: base64_2,
          mimeType: file2.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // 6. Bersihkan teks jika AI memberikan markdown (seperti ```json ... ```)
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText) as ComparisonResult;
  } catch (error) {
    console.error("Error detail:", error);
    throw new Error("Gagal menganalisis dokumen. Pastikan API Key benar.");
  }
};
