
import React, { useState } from 'react';
import { ComparisonResult } from '../types';

interface AnalysisDisplayProps {
  result: ComparisonResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `
HASIL ANALISIS KOMPARATIF - CompareAI
Kesimpulan: ${result.verdict}
Skor Keyakinan: ${Math.round(result.confidenceScore * 100)}%

RINGKASAN:
${result.summary}

PERSAMAAN:
${result.matches.map(m => `- [${m.category}] ${m.description}`).join('\n')}

PERBEDAAN:
${result.differences.map(d => `- [${d.category}] (${d.severity.toUpperCase()}) ${d.description}`).join('\n')}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low': return 'bg-sky-50 text-sky-700 border-sky-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'Tinggi';
      case 'medium': return 'Sedang';
      case 'low': return 'Rendah';
      default: return '-';
    }
  };

  // Menyiapkan data untuk baris tabel (menggabungkan kedua list)
  const maxRows = Math.max(result.matches.length, result.differences.length);
  const tableRows = Array.from({ length: maxRows }).map((_, index) => ({
    match: result.matches[index] || null,
    difference: result.differences[index] || null,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
        {/* Header Laporan */}
        <div className="bg-slate-50 border-b border-slate-100 p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                  Laporan Resmi
                </span>
                <span className="text-slate-400 text-sm italic font-medium">AI Analysis Result</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">Hasil Tabel Komparatif</h2>
              <p className="text-slate-600 mt-2 max-w-2xl text-lg font-medium leading-relaxed">{result.summary}</p>
            </div>
            
            <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    Tersalin!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Salin Laporan
                  </>
                )}
              </button>
              
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Akhir</p>
                    <p className="text-xl font-black text-indigo-600 leading-none">{result.verdict}</p>
                 </div>
                 <div className="w-14 h-14 rounded-full border-4 border-indigo-50 flex items-center justify-center relative shadow-sm">
                    <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                       <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3.5"></circle>
                       <circle cx="18" cy="18" r="16" fill="none" stroke="#4F46E5" strokeWidth="3.5" strokeDasharray={`${result.confidenceScore * 100}, 100`} strokeLinecap="round"></circle>
                    </svg>
                    <span className="text-xs font-black text-indigo-700">{Math.round(result.confidenceScore * 100)}%</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Perbandingan Side-by-Side */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="w-1/2 p-6 text-left border-b border-r border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-lg font-black text-slate-800 uppercase tracking-tight">Kecocokan & Persamaan</span>
                  </div>
                </th>
                <th className="w-1/2 p-6 text-left border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="text-lg font-black text-slate-800 uppercase tracking-tight">Ketidakcocokan & Perbedaan</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.map((row, index) => (
                <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                  {/* Kolom Kecocokan */}
                  <td className="p-6 border-r border-slate-100 align-top">
                    {row.match ? (
                      <div className="flex flex-col gap-2">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-black text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100 uppercase tracking-widest w-fit">
                          {row.match.category}
                        </span>
                        <p className="text-slate-700 leading-relaxed font-semibold text-[15px]">
                          {row.match.description}
                        </p>
                      </div>
                    ) : (
                      <div className="text-slate-300 italic text-sm font-medium">-</div>
                    )}
                  </td>
                  
                  {/* Kolom Ketidakcocokan */}
                  <td className="p-6 align-top">
                    {row.difference ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-black text-rose-600 bg-rose-50 rounded-md border border-rose-100 uppercase tracking-widest">
                            {row.difference.category}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter rounded-md border ${getSeverityStyles(row.difference.severity)}`}>
                            Signifikansi: {getSeverityBadge(row.difference.severity)}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-semibold text-[15px]">
                          {row.difference.description}
                        </p>
                      </div>
                    ) : (
                      <div className="text-slate-300 italic text-sm font-medium">-</div>
                    )}
                  </td>
                </tr>
              ))}
              
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-12 text-center text-slate-400 font-medium italic">
                    Analisis selesai, namun tidak ditemukan poin komparatif yang spesifik untuk ditampilkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info tabel */}
        <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            CompareAI Smart Comparative Ledger • Versi 2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
