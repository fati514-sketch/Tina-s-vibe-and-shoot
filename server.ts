import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy endpoint for Minimax API (Chat)
  app.post("/api/minimax/chatcompletion", async (req, res) => {
    try {
      const { imageBase64, prompt } = req.body;

      if (!imageBase64 || !prompt) {
        return res.status(400).json({ error: "Missing imageBase64 or prompt" });
      }

      const MINIMAX_API_KEY = 'sk-api-PdKFgMx7Opjk1UsbdMtEzqw0sxY4gOdEijtckkn3ZT7uYZu6b9jNuhhTu_V_-1_YKojfDb0nAPLclHRmgf_i7PxzpYPSCZI06cljqN8Jl9Ujnol5Kqpi_yU';
      const GROUP_ID = '1898398776146530546';
      const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout

      const response = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'GroupId': GROUP_ID
        },
        body: JSON.stringify({
          model: "abab6.5s-chat",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageBase64 } }
              ]
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `API request failed: ${errText}` });
      }

      const data = await response.json();
      res.json(data);

    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy endpoint for Minimax API (Image Generation)
  app.post("/api/minimax/image_generation", async (req, res) => {
    try {
      const { prompt, aspect_ratio } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      const MINIMAX_API_KEY = 'sk-api-PdKFgMx7Opjk1UsbdMtEzqw0sxY4gOdEijtckkn3ZT7uYZu6b9jNuhhTu_V_-1_YKojfDb0nAPLclHRmgf_i7PxzpYPSCZI06cljqN8Jl9Ujnol5Kqpi_yU';
      const GROUP_ID = '1898398776146530546';
      const MINIMAX_API_URL = 'https://api.minimax.chat/v1/image_generation';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout

      const response = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'GroupId': GROUP_ID
        },
        body: JSON.stringify({
          model: "image-01",
          prompt: prompt,
          aspect_ratio: aspect_ratio || "3:4"
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Image API request failed: ${errText}` });
      }

      const data = await response.json();
      res.json(data);

    } catch (error: any) {
      console.error("Image Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
