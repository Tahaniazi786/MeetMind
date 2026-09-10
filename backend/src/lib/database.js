const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Ensure data directory exists
const dataDir = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "meetmind.db");
const db = new Database(dbPath);

// Enable WAL mode for high concurrent performance
db.pragma("journal_mode = WAL");

// Initialize Meetings table schema
db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    transcript TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    speakers_detected INTEGER DEFAULT 1,
    health_score INTEGER DEFAULT 50,
    archetype TEXT DEFAULT 'sync',
    archetype_emoji TEXT DEFAULT '🔄',
    archetype_label TEXT DEFAULT 'Sync Meeting',
    tldr TEXT,
    analysis_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_meetings_archetype ON meetings(archetype);
`);

/**
 * Save a new meeting analysis record to the database.
 */
function saveMeeting({ id, title, transcript, duration, speakersDetected, analysis }) {
  const meetingId = id || uuidv4();
  const meetingTitle = title || deriveMeetingTitle(analysis, transcript);
  const healthScore = analysis?.meeting_health_score || 50;
  const archetype = analysis?.meeting_archetype?.type || "sync";
  const archetypeEmoji = analysis?.meeting_archetype?.emoji || "🔄";
  const archetypeLabel = analysis?.meeting_archetype?.label || "Sync Meeting";
  const tldr = analysis?.tldr || "";
  const analysisJson = JSON.stringify(analysis || {});

  const stmt = db.prepare(`
    INSERT INTO meetings (
      id, title, transcript, duration, speakers_detected,
      health_score, archetype, archetype_emoji, archetype_label,
      tldr, analysis_json, created_at, updated_at
    ) VALUES (
      @id, @title, @transcript, @duration, @speakers_detected,
      @health_score, @archetype, @archetype_emoji, @archetype_label,
      @tldr, @analysis_json, datetime('now'), datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      transcript = excluded.transcript,
      health_score = excluded.health_score,
      archetype = excluded.archetype,
      analysis_json = excluded.analysis_json,
      updated_at = datetime('now')
  `);

  stmt.run({
    id: meetingId,
    title: meetingTitle,
    transcript: transcript || "",
    duration: duration || 0,
    speakers_detected: speakersDetected || 1,
    health_score: healthScore,
    archetype: archetype.toLowerCase(),
    archetype_emoji: archetypeEmoji,
    archetype_label: archetypeLabel,
    tldr: tldr,
    analysis_json: analysisJson,
  });

  return getMeetingById(meetingId);
}

/**
 * Retrieve a list of saved meetings with optional search and filter.
 */
function getMeetings({ query = "", archetype = "", limit = 50, offset = 0 } = {}) {
  let sql = `
    SELECT 
      id, title, duration, speakers_detected,
      health_score, archetype, archetype_emoji, archetype_label,
      tldr, created_at, updated_at, analysis_json
    FROM meetings
    WHERE 1=1
  `;
  const params = {};

  if (query && query.trim()) {
    sql += ` AND (title LIKE @query OR tldr LIKE @query OR transcript LIKE @query)`;
    params.query = `%${query.trim()}%`;
  }

  if (archetype && archetype.trim() && archetype.trim().toLowerCase() !== "all") {
    sql += ` AND archetype = @archetype`;
    params.archetype = archetype.trim().toLowerCase();
  }

  sql += ` ORDER BY created_at DESC LIMIT @limit OFFSET @offset`;
  params.limit = limit;
  params.offset = offset;

  const rows = db.prepare(sql).all(params);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    duration: row.duration,
    speakers_detected: row.speakers_detected,
    health_score: row.health_score,
    archetype: {
      type: row.archetype,
      emoji: row.archetype_emoji,
      label: row.archetype_label,
    },
    tldr: row.tldr,
    created_at: row.created_at,
    updated_at: row.updated_at,
    analysis: safeJsonParse(row.analysis_json),
  }));
}

/**
 * Get a single meeting by its ID.
 */
function getMeetingById(id) {
  const row = db
    .prepare(
      `SELECT id, title, transcript, duration, speakers_detected,
              health_score, archetype, archetype_emoji, archetype_label,
              tldr, analysis_json, created_at, updated_at
       FROM meetings WHERE id = ?`
    )
    .get(id);

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    transcript: row.transcript,
    duration: row.duration,
    speakers_detected: row.speakers_detected,
    health_score: row.health_score,
    archetype: {
      type: row.archetype,
      emoji: row.archetype_emoji,
      label: row.archetype_label,
    },
    tldr: row.tldr,
    created_at: row.created_at,
    updated_at: row.updated_at,
    analysis: safeJsonParse(row.analysis_json),
  };
}

/**
 * Delete a meeting record by ID.
 */
function deleteMeeting(id) {
  const info = db.prepare(`DELETE FROM meetings WHERE id = ?`).run(id);
  return info.changes > 0;
}

/**
 * Clear all meetings.
 */
function clearAllMeetings() {
  const info = db.prepare(`DELETE FROM meetings`).run();
  return info.changes;
}

/**
 * Toggle completion status of an action item in a meeting.
 */
function toggleActionItem(meetingId, itemIndex) {
  const meeting = getMeetingById(meetingId);
  if (!meeting || !meeting.analysis || !Array.isArray(meeting.analysis.action_items)) {
    return null;
  }

  const items = meeting.analysis.action_items;
  if (itemIndex < 0 || itemIndex >= items.length) {
    return null;
  }

  const current = items[itemIndex];
  items[itemIndex] = {
    ...current,
    completed: !current.completed,
    completed_at: !current.completed ? new Date().toISOString() : null,
  };

  meeting.analysis.action_items = items;

  db.prepare(`UPDATE meetings SET analysis_json = ?, updated_at = datetime('now') WHERE id = ?`).run(
    JSON.stringify(meeting.analysis),
    meetingId
  );

  return getMeetingById(meetingId);
}

/**
 * Get aggregate statistics across all recorded meetings.
 */
function getMeetingStats() {
  const totalCount = db.prepare(`SELECT COUNT(*) as count FROM meetings`).get().count;
  if (totalCount === 0) {
    return {
      total_meetings: 0,
      average_health_score: 0,
      total_action_items: 0,
      completed_action_items: 0,
      top_archetype: null,
    };
  }

  const avgHealth = db
    .prepare(`SELECT AVG(health_score) as avg_health FROM meetings`)
    .get().avg_health;

  const topArchetypeRow = db
    .prepare(
      `SELECT archetype, archetype_label, archetype_emoji, COUNT(*) as count
       FROM meetings GROUP BY archetype ORDER BY count DESC LIMIT 1`
    )
    .get();

  const allMeetings = db.prepare(`SELECT analysis_json FROM meetings`).all();
  let totalActionItems = 0;
  let completedActionItems = 0;

  for (const m of allMeetings) {
    const analysis = safeJsonParse(m.analysis_json);
    if (analysis && Array.isArray(analysis.action_items)) {
      totalActionItems += analysis.action_items.length;
      completedActionItems += analysis.action_items.filter((a) => a.completed).length;
    }
  }

  return {
    total_meetings: totalCount,
    average_health_score: Math.round(avgHealth || 0),
    total_action_items: totalActionItems,
    completed_action_items: completedActionItems,
    top_archetype: topArchetypeRow
      ? {
          type: topArchetypeRow.archetype,
          label: topArchetypeRow.archetype_label,
          emoji: topArchetypeRow.archetype_emoji,
          count: topArchetypeRow.count,
        }
      : null,
  };
}

function deriveMeetingTitle(analysis, transcript) {
  if (analysis?.meeting_archetype?.label) {
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${analysis.meeting_archetype.label} (${dateStr})`;
  }
  if (transcript) {
    const firstLine = transcript.split("\n")[0]?.replace(/^[^:]+:\s*/, "").trim();
    if (firstLine && firstLine.length > 5) {
      return firstLine.slice(0, 50) + (firstLine.length > 50 ? "…" : "");
    }
  }
  return `Meeting Intelligence Report (${new Date().toLocaleDateString()})`;
}

function safeJsonParse(jsonStr) {
  try {
    return JSON.parse(jsonStr);
  } catch (_) {
    return {};
  }
}

module.exports = {
  db,
  saveMeeting,
  getMeetings,
  getMeetingById,
  deleteMeeting,
  clearAllMeetings,
  toggleActionItem,
  getMeetingStats,
};
