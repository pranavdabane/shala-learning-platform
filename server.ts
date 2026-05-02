import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/health", async (req, res) => {
    try {
      const test = await fetch('https://google.com', { signal: AbortSignal.timeout(5000) });
      res.json({ status: "ok", internet: test.ok ? "connected" : "failed" });
    } catch (err: any) {
      res.json({ status: "ok", internet: "error", message: err.message });
    }
  });

  // Supabase Proxy to bypass browser-side "Failed to fetch" (CORS/Blocking)
  app.get("/api/proxy/:table", async (req, res) => {
    const { table } = req.params;
    const queryString = new URLSearchParams(req.query as any).toString();
    const rawUrl = process.env.VITE_SUPABASE_URL || 'https://otceyeuhyxrwjbyfwbwl.supabase.co';
    const supabaseUrl = rawUrl.startsWith('http') ? rawUrl.replace(/\/$/, '') : `https://${rawUrl.replace(/\/$/, '')}`;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tmmqhQn_-UBzKMLsd6XNeA_N6D_e1lL';
    
    try {
      if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
        throw new Error("Supabase URL is missing or invalid");
      }

      const fetchUrl = `${supabaseUrl}/rest/v1/${table}?${queryString || 'select=*'}`;
      
      const response = await fetch(fetchUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error(`Proxy error fetching ${table}:`, error);
      
      // Handle Node.js fetch errors which might be in error.cause
      const errorMessage = error.message || '';
      const causeMessage = error.cause?.message || '';
      const combinedMessage = `${errorMessage} ${causeMessage}`;
      
      if (combinedMessage.includes('ENOTFOUND') || combinedMessage.includes('ECONNREFUSED') || combinedMessage.includes('fetch failed')) {
        return res.json([]);
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV === "development") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
