import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import ytdl from "@distube/ytdl-core";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { igdl, fbdown, twitter, ttdl } from "btch-downloader";
import mrNimaIgdl from "@mrnima/instagram-downloader";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Routes
app.post("/api/extract", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // 1. TikTok Specialized Extraction
    if (url.includes("tiktok.com")) {
      try {
        const response = await axios.post("https://www.tikwm.com/api/", {
            url: url
        });
        
        const data = response.data;
        if (data.code === 0 && data.data) {
          const media = [];
          
          const resolveUrl = (path: string) => path.startsWith('http') ? path : `https://www.tikwm.com${path}`;
          
          if (data.data.images && Array.isArray(data.data.images)) {
            data.data.images.forEach((imgUrl: string, index: number) => {
                media.push({
                    quality: `Foto Slide ${index + 1} (HD)`,
                    url: resolveUrl(imgUrl),
                    type: "image"
                });
            });
          }

          if (data.data.hdplay) {
            media.push({
              quality: "HD (Tanpa Watermark)",
              url: resolveUrl(data.data.hdplay),
              type: "video"
            });
          }
          
          if (data.data.play) {
            media.push({
              quality: "Normal (Tanpa Watermark)",
              url: resolveUrl(data.data.play),
              type: "video"
            });
          }

          if (data.data.music) {
            media.push({
              quality: "Music / MP3",
              url: resolveUrl(data.data.music),
              type: "audio"
            });
          }

          if (media.length > 0) {
            return res.json({
              platform: "TikTok",
              title: data.data.title || "TikTok Video / Photos",
              thumbnail: data.data.cover,
              media: media
            });
          }
        }
      } catch (err) {
        console.error("tikwm.com API fetch error, falling back...", err);
      }
      
      // Fallback to btch-downloader for TikTok
      try {
        const ttResult = await ttdl(url);
        if (ttResult && ttResult.video && ttResult.video.length > 0) {
           return res.json({
              platform: "TikTok",
              title: ttResult.title || "TikTok Video",
              thumbnail: ttResult.thumbnail || "",
              media: ttResult.video.map((v, i) => ({
                 quality: "Video " + (i+1) + " (Tanpa Watermark)",
                 url: v,
                 type: "video"
              })).concat(ttResult.audio ? ttResult.audio.map((a, i) => ({
                 quality: "Audio " + (i+1),
                 url: a,
                 type: "audio"
              })) : [])
           });
        }
      } catch (e) {
        console.error("btch-downloader ttdl error", e);
      }
    } 
    
    // 2. YouTube Specialized Extraction
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const info = await ytdl.getInfo(url);
      const formats = ytdl.filterFormats(info.formats, "videoandaudio");
      
      return res.json({
        platform: "YouTube",
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        media: formats.map(f => ({
          quality: f.qualityLabel || f.container,
          url: f.url,
          type: "video"
        }))
      });
    }

    // 3. Instagram Extraction
    if (url.includes("instagram.com")) {
      let isSuccess = false;
      try {
        const igResult = await igdl(url);
        if (igResult && igResult.result && igResult.result.length > 0 && Object.keys(igResult.result[0]).length > 0) {
          isSuccess = true;
          return res.json({
            platform: "Instagram",
            title: "Instagram Post / Reel",
            thumbnail: igResult.result[0].thumbnail || igResult.result[0].url,
            media: igResult.result.map((item: any, idx: number) => {
              const isVideo = item.url.includes('.mp4');
              return {
                quality: `Media ${idx + 1} (HD)`,
                url: item.url,
                type: isVideo ? "video" : "image"
              };
            })
          });
        }
      } catch (e: any) {
        console.error("igdl error:", e.message);
      }

      if (!isSuccess) {
        try {
            console.log("Using mrNimaIgdl fallback for Instagram...");
            const igNima = await Promise.race([
                mrNimaIgdl(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]) as any;
            if (igNima && igNima.result && igNima.result.length > 0) {
                return res.json({
                    platform: "Instagram",
                    title: "Instagram Reel / Post",
                    thumbnail: "",
                    media: igNima.result.map((urlStr: string, idx: number) => {
                        return {
                            quality: `Media ${idx + 1} (HD)`,
                            url: urlStr,
                            type: urlStr.includes('.mp4') ? "video" : "image"
                        };
                    })
                });
            }
        } catch (err: any) {
             console.error("mrnima igdl fallback error:", err.message);
        }
      }
      
      // Attempt generic scraper endpoint for IG
      if (!isSuccess) {
         try {
             const apiRes = await axios.get(`https://skizo.tech/api/igdl?url=${url}`, { timeout: 8000 });
             if (apiRes.data && apiRes.data.url && apiRes.data.url.length > 0) {
                 return res.json({
                     platform: "Instagram",
                     title: "Instagram Reel / Post",
                     thumbnail: "",
                     media: apiRes.data.url.map((u: any, i: number) => {
                         const mediaUrl = typeof u === 'string' ? u : (u.url || "");
                         const urlLower = mediaUrl.split('?')[0].toLowerCase();
                         const isVideo = urlLower.endsWith('.mp4') || (!urlLower.endsWith('.jpg') && !urlLower.endsWith('.jpeg') && !urlLower.endsWith('.webp') && !urlLower.endsWith('.png'));
                         
                         return {
                             quality: `Media ${i + 1} (HD)`,
                             url: mediaUrl,
                             type: isVideo ? "video" : "image"
                         };
                     })
                 });
             }
         } catch(e) {}
      }
    }

    // 4. Facebook Extraction
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
      try {
        const fbResult = await fbdown(url);
        if (fbResult && (fbResult.HD || fbResult.Normal_video)) {
          const media = [];
          if (fbResult.HD) {
            media.push({ quality: "HD", url: fbResult.HD, type: "video" });
          }
          if (fbResult.Normal_video) {
            media.push({ quality: "Normal", url: fbResult.Normal_video, type: "video" });
          }
          return res.json({
            platform: "Facebook",
            title: "Facebook Video",
            thumbnail: "",
            media
          });
        }
      } catch (e: any) {
        console.error("fbdown error:", e);
      }
    }

    // 5. Twitter Extraction
    if (url.includes("twitter.com") || url.includes("x.com")) {
       try {
         const twResult = await twitter(url);
         if (twResult && twResult.url) {
           return res.json({
             platform: "Twitter / X",
             title: twResult.title || "Twitter Media",
             thumbnail: "",
             media: [{ quality: "Media", url: twResult.url, type: "video" }]
           });
         }
       } catch (e) {
         console.error("twitter error:", e);
       }
    }

    // Generic Extraction with Gemini (Fallback)
    console.log("Using Gemini fallback for:", url);
    const pageResponse = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        },
        timeout: 10000
    });

    const html = pageResponse.data.toString().substring(0, 50000); // Limit to first 50k chars

    const geminiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
            responseMimeType: "application/json",
            systemInstruction: "You are a professional web scraping assistant. Your task is to extract direct video or image download URLs from the provided HTML content. Look for Open Graph tags, meta tags, or video source tags. Return a JSON object with: { platform: string, title: string, thumbnail: string, media: [{ quality: string, url: string, type: 'video' | 'image' | 'audio' }] }."
        },
        contents: `Analyze this HTML and extract the direct download link for the media at ${url}:\n\n${html}`
    });

    const result = JSON.parse(geminiResponse.text || "{}");
    if (result.media && result.media.length > 0) {
        return res.json(result);
    }

    return res.status(400).json({ error: "Unsupported platform or link is private. We support TikTok and YouTube natively." });

  } catch (error: any) {
    console.error("Extraction error:", error);
    return res.status(500).json({ error: error.message || "Failed to process URL" });
  }
});

// Proxy for downloads to handle CORS
app.get("/api/proxy", async (req, res) => {
    const { url, type } = req.query;
    
    if (!url || typeof url !== 'string' || url.includes('undefined')) {
        return res.status(400).send("Link unduhan tidak valid atau kadaluarsa.");
    }

    try {
        console.log("Proxying request for:", url, "Type:", type);
        // Special headers for Instagram vs others
        const isIg = url.includes('instagram.com') || url.includes('cdninstagram.com');
        const proxyHeaders: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*, image/*, video/*',
        };
        
        if (isIg) {
            proxyHeaders['Referer'] = 'https://www.instagram.com/';
        }

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            timeout: 60000,
            headers: proxyHeaders
        });

        const contentTypeHeader = response.headers['content-type'];
        const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        
        // Smarter extension parsing based on URL and content type
        let ext = 'mp4';
        if (type === 'image') ext = 'jpg';
        else if (type === 'audio') ext = 'mp3';

        const urlWithoutQuery = url.split('?')[0].toLowerCase();
        
        if (contentType.includes('image') || urlWithoutQuery.endsWith('.jpg') || urlWithoutQuery.endsWith('.jpeg')) {
            ext = 'jpg';
        } else if (urlWithoutQuery.endsWith('.png')) {
            ext = 'png';
        } else if (urlWithoutQuery.endsWith('.webp')) {
            ext = 'webp';
        } else if (contentType.includes('audio') || urlWithoutQuery.endsWith('.mp3')) {
            ext = 'mp3';
        } else if (contentType.includes('video')) {
            ext = 'mp4';
        }
        
        res.setHeader('Content-Disposition', `attachment; filename="savepro-${Date.now()}.${ext}"`);
        
        response.data.pipe(res);
        
        response.data.on('error', (err: any) => {
            console.error("Stream error:", err);
            if (!res.headersSent) res.status(500).send("Koneksi terputus saat mengunduh.");
        });

    } catch (error: any) {
        console.error("Proxy error details:", error.response?.status, error.message);
        if (!res.headersSent) {
            res.status(error.response?.status || 500).send(`Gagal mengunduh: ${error.message}`);
        }
    }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
