const express = require("express");
const {
  saveMeeting,
  getMeetings,
  getMeetingById,
  deleteMeeting,
  clearAllMeetings,
  toggleActionItem,
  getMeetingStats,
} = require("../lib/database");

const router = express.Router();

// ── GET /api/meetings/stats/summary ──────────────────────────────────
router.get("/stats/summary", (req, res) => {
  try {
    const stats = getMeetingStats();
    res.json(stats);
  } catch (err) {
    console.error("Failed to fetch meeting stats:", err);
    res.status(500).json({ error: "Failed to fetch meeting statistics", message: err.message });
  }
});

// ── GET /api/meetings ────────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const { q, archetype, limit, offset } = req.query;
    const meetings = getMeetings({
      query: q || "",
      archetype: archetype || "",
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    res.json({ meetings, total: meetings.length });
  } catch (err) {
    console.error("Failed to fetch meetings:", err);
    res.status(500).json({ error: "Failed to fetch meetings", message: err.message });
  }
});

// ── POST /api/meetings ───────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const { id, title, transcript, duration, speakers_detected, analysis } = req.body;

    if (!analysis) {
      return res.status(400).json({
        error: "Missing analysis data",
        message: "Please provide the meeting analysis payload.",
      });
    }

    const saved = saveMeeting({
      id,
      title,
      transcript,
      duration,
      speakersDetected: speakers_detected,
      analysis,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("Failed to save meeting:", err);
    res.status(500).json({ error: "Failed to save meeting", message: err.message });
  }
});

// ── GET /api/meetings/:id ────────────────────────────────────────────
router.get("/:id", (req, res) => {
  try {
    const meeting = getMeetingById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found", code: "NOT_FOUND" });
    }
    res.json(meeting);
  } catch (err) {
    console.error("Failed to fetch meeting:", err);
    res.status(500).json({ error: "Failed to fetch meeting", message: err.message });
  }
});

// ── DELETE /api/meetings/:id ─────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const deleted = deleteMeeting(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Meeting not found", code: "NOT_FOUND" });
    }
    res.json({ success: true, message: "Meeting deleted successfully" });
  } catch (err) {
    console.error("Failed to delete meeting:", err);
    res.status(500).json({ error: "Failed to delete meeting", message: err.message });
  }
});

// ── DELETE /api/meetings (Clear all) ──────────────────────────────────
router.delete("/", (req, res) => {
  try {
    const count = clearAllMeetings();
    res.json({ success: true, count, message: "All meetings cleared" });
  } catch (err) {
    console.error("Failed to clear meetings:", err);
    res.status(500).json({ error: "Failed to clear meetings", message: err.message });
  }
});

// ── PATCH /api/meetings/:id/action-items/:itemIndex ──────────────────
router.patch("/:id/action-items/:itemIndex", (req, res) => {
  try {
    const itemIndex = parseInt(req.params.itemIndex, 10);
    const updated = toggleActionItem(req.params.id, itemIndex);
    if (!updated) {
      return res.status(404).json({ error: "Meeting or action item not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Failed to update action item:", err);
    res.status(500).json({ error: "Failed to update action item", message: err.message });
  }
});

module.exports = router;
