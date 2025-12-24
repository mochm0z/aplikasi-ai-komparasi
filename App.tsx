
import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import { performComparison } from './services/geminiService';
import { FileData, ComparisonResult } from './types';

const App: React.FC = () => {
  const [file1, setFile1] = useState<FileData | null>(null);
  const [file2, setFile2] = useState<FileData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnalyze = async () => {
    if (!file1 || !file2) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const analysis = await performComparison(file1.file, file2.file);
      setResult(analysis);
      // Auto-scroll to result
      setTimeout(() => {
        const element = document.getElementById('results-section');
        if (element) {
          window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Gagal menganalisis file. Periksa koneksi atau ukuran file Anda.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile1(null);
    setFile2(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
               </svg>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Compare<span className="text-indigo-600">AI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={reset} className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest">Reset</button>
            <a href="https://ai.google.dev" target="_blank" className="hidden sm:block text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all">Powered by Gemini</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 sm:pt-40">
        {/* Hero Section */}
        <section className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100 animate-fade-in">
             ✨ Canggih & Instan
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
            Analisis Komparatif <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">Cerdas & Presisi</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Unggah dokumen atau gambar apa pun. AI kami akan membedah setiap piksel dan kata untuk menemukan perbedaan tersembunyi yang terlewat oleh mata manusia.
          </p>
        </section>

        {/* Upload Interface */}
        <div className="relative group max-w-5xl mx-auto">
           <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-70 transition duration-1000"></div>
           <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100">
             <FileUploader id="file1" label="DOKUMEN A (ASLI)" selectedFile={file1} onFileSelect={setFile1} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-12 h-12 bg-white rounded-full border border-slate-100 items-center justify-center text-slate-300 font-black shadow-lg z-10">VS</div>
             <FileUploader id="file2" label="DOKUMEN B (PEMBANDING)" selectedFile={file2} onFileSelect={setFile2} />
           </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center justify-center gap-4 mb-24">
          <button
            onClick={handleAnalyze}
            disabled={!file1 || !file2 || isAnalyzing}
            className={`
              relative group flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all duration-300
              ${(!file1 || !file2 || isAnalyzing) 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed scale-95' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 shadow-indigo-200'}
            `}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Sedang Memproses...
              </>
            ) : (
              <>
                Jalankan Analisis
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </button>
          {!file1 || !file2 ? (
             <p className="text-slate-400 text-sm font-medium animate-pulse">Pilih dua file terlebih dahulu untuk memulai</p>
          ) : null}
        </div>

        {/* Results Area */}
        <div id="results-section" className="max-w-6xl mx-auto">
          {error && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4 text-rose-800 animate-shake">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 text-rose-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="pt-1">
                <p className="font-bold text-lg mb-1">Analisis Terganggu</p>
                <p className="text-slate-600 opacity-90">{error}</p>
                <button onClick={handleAnalyze} className="mt-3 text-sm font-black text-rose-600 hover:underline">Coba Lagi Sekarang</button>
              </div>
            </div>
          )}

          {result && <AnalysisDisplay result={result} />}
        </div>

        {/* Feature Highlights (SEO/Public Info) */}
        <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Presisi Tinggi", desc: "Mampu membandingkan perubahan teks hingga ke tingkat spasi dan karakter.", icon: "🔍" },
              { title: "Multi Format", desc: "Bandingkan PDF dengan JPG, atau PNG dengan PDF tanpa masalah.", icon: "📁" },
              { title: "Privasi Aman", desc: "File diproses secara aman dan tidak disimpan secara permanen di server.", icon: "🛡️" }
            ].map((feature, i) => (
              <div key={i} className="group p-8 bg-white rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500 text-center">
                 <div className="text-4xl mb-6 bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto group-hover:scale-110 transition-transform">{feature.icon}</div>
                 <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
                 <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
        </section>
      </main>

      {/* Simplified Footer */}
      <footer className="mt-40 py-12 bg-slate-900 text-white">
         <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                 </svg>
              </div>
              <span className="text-xl font-black tracking-tight">CompareAI</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
