import { GoogleGenerativeAI } from "@google/generative-ai";
import { ComparisonResult } from "../types";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const performComparison = async (
  file1: File,
  file2: File
): Promise<ComparisonResult> => {
  // PERBAIKAN 1: Menggunakan import.meta.env untuk Vite dan nama variabel yang sesuai di Vercel
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
  
  // PERBAIKAN 2: Menggunakan nama model yang valid (gemini-1.5-pro)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const base64_1 = await fileToBase64(file1);
  const base64_2 = await fileToBase64(file2);

  const prompt = `Bandingkan kedua dokumen/gambar ini secara mendalam dengan fokus eksklusif pada konten teks, nilai data, dan informasi substantif. 
            
  PENTING: Abaikan perbedaan dalam hal layout, tata letak, posisi elemen, font, atau struktur dokumen. Fokuslah hanya pada 'APA' yang tertulis, bukan 'BAGAIMANA' tampilannya.
  
  Identifikasi:
  1. Konten teks atau data yang persis sama.
  2. Konten teks atau data yang serupa tetapi memiliki modifikasi nilai atau kata.
  3. Konten teks atau data yang benar-benar berbeda atau hilang di salah satu dokumen.
  
  Berikan hasil analisis dalam Bahasa Indonesia yang formal dan presisi.
  
  Format output harus JSON dengan struktur:
  {
    "summary": "string",
    "matches": [{"category": "string", "description": "string"}],
    "differences": [{"category": "string", "description": "string", "severity": "low/medium/high"}],
    "verdict": "string",
    "confidenceScore": number
  }`;

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
  const resultText = response.text();
  
  if (!resultText) throw new Error("Tidak ada respon dari AI");
  
  return JSON.parse(resultText) as ComparisonResult;
};
