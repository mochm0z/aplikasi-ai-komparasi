
import { GoogleGenAI, Type } from "@google/genai";
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const base64_1 = await fileToBase64(file1);
  const base64_2 = await fileToBase64(file2);

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      {
        parts: [
          {
            text: `Bandingkan kedua dokumen/gambar ini secara mendalam dengan fokus eksklusif pada konten teks, nilai data, dan informasi substantif. 
            
            PENTING: Abaikan perbedaan dalam hal layout, tata letak, posisi elemen, font, atau struktur dokumen. Fokuslah hanya pada 'APA' yang tertulis, bukan 'BAGAIMANA' tampilannya.
            
            Identifikasi:
            1. Konten teks atau data yang persis sama.
            2. Konten teks atau data yang serupa tetapi memiliki modifikasi nilai atau kata.
            3. Konten teks atau data yang benar-benar berbeda atau hilang di salah satu dokumen.
            
            Berikan hasil analisis dalam Bahasa Indonesia yang formal dan presisi.`,
          },
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
        ],
      },
    ],
    config: {
      systemInstruction: "Anda adalah analis data senior. Tugas Anda adalah membandingkan isi teks dan nilai data antara dua file. Anda harus mengabaikan aspek visual seperti layout dan struktur. Anda harus selalu memberikan tanggapan dalam format JSON yang valid dan menggunakan Bahasa Indonesia.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Ringkasan perbedaan konten teks dan data secara keseluruhan." },
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "Kategori kesamaan konten (misalnya: Data Personal, Nilai Angka, Deskripsi Teks)" },
                description: { type: Type.STRING, description: "Penjelasan detail tentang kesamaan data tersebut" },
              },
              required: ["category", "description"],
            },
          },
          differences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "Kategori perbedaan konten" },
                description: { type: Type.STRING, description: "Penjelasan detail tentang perbedaan nilai atau teks" },
                severity: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Tingkat signifikansi perbedaan data" },
              },
              required: ["category", "description", "severity"],
            },
          },
          verdict: { type: Type.STRING, description: "Kesimpulan akhir mengenai integritas data (misalnya: 'Data Identik', 'Data Berbeda Signifikan', 'Koreksi Kecil')" },
          confidenceScore: { type: Type.NUMBER, description: "Skor keyakinan analisis data antara 0 dan 1" },
        },
        required: ["summary", "matches", "differences", "verdict", "confidenceScore"],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) throw new Error("Tidak ada respon dari AI");
  
  return JSON.parse(resultText) as ComparisonResult;
};
