require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const transcribeRouter = require("./routes/transcribe");
const analyzeRouter = require("./routes/analyze");
const exportPdfRouter = require("./routes/exportPdf");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in production for now
      }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ── Ensure uploads directory exists ──────────────────────────────────
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Health check ─────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "MeetMind Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────────────────────
app.use("/api/transcribe", transcribeRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/export-pdf", exportPdfRouter);

// ── 404 catch-all ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🧠 MeetMind Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `   OpenAI key:   ${process.env.OPENAI_API_KEY ? "✅ loaded" : "❌ missing — add to .env"}`
  );
  console.log("");
});

module.exports = app;
