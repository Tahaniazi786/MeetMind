const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { transcribeAudio } = require("../lib/whisper");

const router = express.Router();

// ── Multer config — 25 MB limit, .mp3 / .wav only ───────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "..", "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [".mp3", ".wav", ".m4a", ".webm", ".ogg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Unsupported file type: ${ext}. Accepted: ${allowed.join(", ")}`
    );
    err.code = "LIMIT_UNEXPECTED_FILE";
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// ── POST /api/transcribe ─────────────────────────────────────────────
router.post("/", upload.single("audio"), async (req, res, next) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No audio file provided",
        message: 'Upload an audio file with field name "audio".',
        code: "MISSING_FILE",
      });
    }

    filePath = req.file.path;
    console.log(`🎙️  Transcribing: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    const startTime = Date.now();
    const result = await transcribeAudio(filePath);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Transcription complete in ${elapsed}s — ${result.transcript.length} chars, ${result.speakersDetected} speaker(s)`);

    res.json({
      transcript: result.transcript,
      duration: result.duration,
      speakers_detected: result.speakersDetected,
    });
  } catch (err) {
    next(err);
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.warn("⚠️  Failed to clean up upload:", unlinkErr.message);
      });
    }
  }
});

module.exports = router;
