import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

// Determine client path - try multiple locations
let clientPath = "";
const possiblePaths = [
  path.join(process.cwd(), "dist/client"),
  path.join(__dirname, "../../dist/client"),
  path.join(__dirname, "../../../dist/client"),
  "/app/dist/client",
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    clientPath = p;
    console.log(`✅ Found client files at: ${clientPath}`);
    break;
  }
}

if (!clientPath) {
  console.error("❌ Could not find client files in any of these locations:");
  possiblePaths.forEach(p => console.error(`   - ${p}`));
  process.exit(1);
}

// Serve static files
app.use(express.static(clientPath, {
  maxAge: "1y",
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// SPA fallback
app.get("*", (_req, res) => {
  const indexPath = path.join(clientPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(404).json({ error: "Not found" });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/` );
  console.log(`📊 Health check: http://localhost:${PORT}/api/health` );
  console.log(`🎬 App: http://localhost:${PORT}/` );
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
