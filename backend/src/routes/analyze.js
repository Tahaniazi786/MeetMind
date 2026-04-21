const express = require("express");
const { runAnalysisChain } = require("../chains/analyzeChain");

const router = express.Router();

// ── POST /api/analyze ────────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { transcript } = req.body;

    // ── Validation ─────────────────────────────────────────────────
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({
        error: "Missing transcript",
        message: 'Provide a "transcript" string in the request body.',
        code: "MISSING_TRANSCRIPT",
      });
    }

    if (transcript.trim().length < 50) {
      return res.status(400).json({
        error: "Transcript too short",
        message:
          "The transcript must be at least 50 characters long for meaningful analysis.",
        code: "TRANSCRIPT_TOO_SHORT",
      });
    }

    console.log(
      `🧠 Analyzing transcript: ${transcript.length} chars (${transcript.split(/\s+/).length} words)`
    );

    const startTime = Date.now();

    // ── Run LangChain pipeline ─────────────────────────────────────
    const analysis = await runAnalysisChain(transcript);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `✅ Analysis complete in ${elapsed}s — health score: ${analysis.meeting_health_score}/100, ${analysis.action_items.length} action items`
    );

    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
