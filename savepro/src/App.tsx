/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Download, Link as LinkIcon, Video, Music, Image as ImageIcon, AlertCircle, CheckCircle2, ChevronRight, Share2, Github, X, Sun, Moon, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaItem {
  quality: string;
  url: string;
  type: string;
}

interface ExtractionResult {
  platform: string;
  title: string;
  thumbnail: string;
  media: MediaItem[];
}

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);
  const [successIdx, setSuccessIdx] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract media");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (videoUrl: string, type?: string, idx?: number) => {
    let proxyUrl = `/api/proxy?url=${encodeURIComponent(videoUrl)}`;
    if (type) {
        proxyUrl += `&type=${encodeURIComponent(type)}`;
    }
    
    if (idx !== undefined) {
      setDownloadingIdx(idx);
    }
    
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (idx !== undefined) {
      setTimeout(() => {
        setDownloadingIdx(null);
        setSuccessIdx(idx);
        setTimeout(() => setSuccessIdx(null), 3000);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900 selection:text-emerald-900 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Download size={22} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-zinc-800 dark:text-white">SavePro</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
          <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">TikTok</a>
          <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">YouTube</a>
          <button className="px-5 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Login</button>
          <button className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full shadow hover:scale-105 transition-transform">Premium</button>
          <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 bg-zinc-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            {isDarkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
          </button>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 md:py-20 relative">
        {/* Abstract Background Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none rounded-[100%]"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Lebih Cepat & Tanpa Watermark
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight tracking-tighter transition-colors duration-300"> 
              Download Media <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                Kualitas Premium.
              </span> 
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed transition-colors duration-300"> 
              Simpan konten favoritmu dari TikTok, Instagram, YouTube, dan Facebook dalam hitungan detik. Gratis dan tanpa batasan.
            </p>

            {/* Input Group */}
            <form onSubmit={handleExtract} className="w-full max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
              <div className="flex-1 flex items-center px-5 w-full relative">
                <LinkIcon size={22} className="text-zinc-400 dark:text-zinc-500 mr-3" strokeWidth={2.5} />
                <input
                  type="text"
                  placeholder="Tempel tautan video atau foto di sini..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 py-4 outline-none pr-24"
                />
                {!url && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setUrl(text);
                      } catch (err: any) {
                        console.error('Failed to read clipboard:', err);
                        if (err.name === 'NotAllowedError') {
                          alert("Akses clipboard diblokir oleh browser. Silakan tekan Ctrl+V (Windows) / Cmd+V (Mac) atau tekan lama lalu pilih Paste pada HP Anda.");
                        } else {
                           alert("Gagal membaca clipboard. Pastikan browser Anda mengizinkan akses. Atau gunakan Ctrl+V / Cmd+V untuk paste.");
                        }
                      }
                    }}
                    className="absolute right-3 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-bold transition-colors"
                  >
                    <Clipboard size={14} strokeWidth={2.5} />
                    <span>Paste</span>
                  </button>
                )}
                {url && (
                  <button
                    type="button"
                    onClick={() => { setUrl(""); setResult(null); setError(null); }}
                    className="absolute right-4 p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full transition-colors"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <button 
                type="submit"
                disabled={loading || !url}
                className="w-full md:w-auto px-8 py-4 bg-emerald-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Ekstrak</span>
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            {/* Platform Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-full text-zinc-600 dark:text-zinc-400 font-semibold text-xs transition-colors">
                TikTok
              </div>
              <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-full text-zinc-600 dark:text-zinc-400 font-semibold text-xs transition-colors">
                Instagram
              </div>
              <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-full text-zinc-600 dark:text-zinc-400 font-semibold text-xs transition-colors">
                YouTube
              </div>
              <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-full text-zinc-600 dark:text-zinc-400 font-semibold text-xs transition-colors">
                Facebook
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error / Result Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 mx-auto max-w-2xl p-4 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-medium backdrop-blur-sm shadow-sm"
            >
              <AlertCircle size={18} />
              <p>{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none flex flex-col md:flex-row relative z-20 transition-colors duration-300 max-w-5xl mx-auto"
            >
              <div className="md:w-80 h-64 md:h-auto relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                   <p className="text-white font-medium text-sm line-clamp-3 leading-snug">{result.title}</p>
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                  {result.platform}
                </div>
              </div>
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Opsi Unduhan</h3>
                  {result.media.length > 1 && (
                    <button
                      onClick={() => result.media.forEach(item => handleDownload(item.url, item.type))}
                      className="text-xs font-bold px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full transition-colors"
                    >
                      Unduh Semua ({result.media.length})
                    </button>
                  )}
                </div>
                <div className="grid gap-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                  {result.media.map((item, idx) => (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownload(item.url, item.type, idx)}
                      className={`group p-4 border rounded-2xl flex items-center justify-between transition-all duration-300 ${
                        successIdx === idx 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" 
                          : "bg-zinc-50/50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-emerald-200 dark:hover:border-emerald-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                          successIdx === idx 
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                            : "bg-white dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shadow-sm border border-zinc-100 dark:border-zinc-600 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30"
                        }`}>
                          {item.type === "video" ? <Video size={20} /> : (item.type === "audio" ? <Music size={20} /> : <ImageIcon size={20} />)}
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold text-base transition-colors duration-300 ${
                            successIdx === idx 
                              ? "text-emerald-700 dark:text-emerald-400" 
                              : "text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white"
                          }`}>{item.quality}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                            successIdx === idx
                              ? "text-emerald-600/70 dark:text-emerald-500/70"
                              : "text-zinc-400 dark:text-zinc-500"
                          }`}>{item.type}</p>
                        </div>
                      </div>
                      <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30 shadow-sm">
                        <AnimatePresence mode="popLayout">
                          {downloadingIdx === idx ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="w-4 h-4 border-[2px] border-emerald-500 border-t-transparent rounded-full animate-spin"
                            />
                          ) : successIdx === idx ? (
                            <motion.div
                              key="success"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                            >
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="download"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Download size={16} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl flex items-center justify-center font-bold text-sm">01</div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">Salin Link</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Buka aplikasi TikTok, Instagram, Youtube dll dan salin link konten.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl flex items-center justify-center font-bold text-sm">02</div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">Tempel Link</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Tempel (paste) link pada kolom di input utama halaman ini.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl flex items-center justify-center font-bold text-sm">03</div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">Pilih & Simpan</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Pilih format unduhan (MP4/MP3) dan simpan konten ke perangkat.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center text-zinc-400 dark:text-zinc-500 text-xs font-semibold bg-zinc-100/50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 mt-auto transition-colors duration-300">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Status: Normal</span>
          <span>&bull;</span>
          <span>Gratis 100% Selamanya</span>
        </div>
        <div className="text-center font-bold tracking-widest uppercase text-[10px]">&copy; 2026 SavePro APP</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}

