const express = require("express");
const { generatePdf } = require("../lib/pdfGenerator");

const router = express.Router();

// ── POST /api/export-pdf ─────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const analysis = req.body;

    // ── Validate — must have at least a tldr ───────────────────────
    if (!analysis || !analysis.tldr) {
      return res.status(400).json({
        error: "Invalid analysis data",
        message:
          "Provide the full analysis JSON from /api/analyze in the request body.",
        code: "INVALID_ANALYSIS",
      });
    }

    console.log("📄 Generating PDF report…");
    const startTime = Date.now();

    const pdfBuffer = await generatePdf(analysis);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ PDF generated in ${elapsed}s — ${(pdfBuffer.length / 1024).toFixed(0)} KB`);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="MeetMind-Report.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
