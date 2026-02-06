import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "8080");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get("/api/test", (_req, res) => {
  res.status(200).json({ message: "AI Film Studio API is working!" });
});

// Serve static files from client dist
const clientPath = path.join(__dirname, "../../client/dist");

// IMPORTANT: Serve static files with proper caching
app.use(express.static(clientPath, { 
  maxAge: "1y", 
  immutable: true,
  setHeaders: (res, path) => {
    // Don't cache index.html
    if (path.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// SPA fallback - serve index.html for all unmatched routes
// This should only catch routes, not asset requests
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(404).json({ error: "Not found" });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎬 App: http://localhost:${PORT}/`);
  console.log(`📁 Serving static files from: ${clientPath}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
