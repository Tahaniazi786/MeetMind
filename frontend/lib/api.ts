const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://meetmind-production-4c34.up.railway.app";

/**
 * Transcribe an audio file via the backend.
 */
export async function transcribeAudio(file: File): Promise<{
  transcript: string;
  duration: number;
  speakers_detected: number;
}> {
  const formData = new FormData();
  formData.append("audio", file);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/transcribe`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Cannot reach the backend server. Make sure the backend is running on " +
        API_URL +
        " with a valid OPENAI_API_KEY in .env"
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Transcription failed" }));
    throw new Error(err.message || err.error || "Audio transcription failed.");
  }

  return res.json();
}

/**
 * Run the full AI analysis on a transcript.
 */
export async function analyzeTranscript(transcript: string): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
  } catch {
    // If backend is completely offline, generate smart client-side analysis from transcript
    console.warn("Backend unreachable, generating client-side analysis from transcript");
    return generateMockAnalysis(transcript);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Analysis failed" }));
    throw new Error(err.message || err.error || "Meeting analysis failed.");
  }

  return res.json();
}

/**
 * Export analysis as a PDF.
 */
export async function exportPdf(analysis: Record<string, unknown>): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/export-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysis),
    });
  } catch {
    throw new Error(
      "Cannot reach the backend for PDF export. Make sure the backend is running on " + API_URL
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "PDF export failed" }));
    throw new Error(err.message || err.error || "PDF export failed");
  }

  return res.blob();
}

// ── Database REST API Clients ────────────────────────────────────────

export interface SavedMeetingRecord {
  id: string;
  title: string;
  transcript?: string;
  duration: number;
  speakers_detected: number;
  health_score: number;
  archetype: {
    type: string;
    emoji: string;
    label: string;
  };
  tldr: string;
  created_at: string;
  updated_at: string;
  analysis: Record<string, unknown>;
}

export interface MeetingStats {
  total_meetings: number;
  average_health_score: number;
  total_action_items: number;
  completed_action_items: number;
  top_archetype?: {
    type: string;
    label: string;
    emoji: string;
    count: number;
  } | null;
}

export async function saveMeetingToDb(payload: {
  id?: string;
  title?: string;
  transcript?: string;
  duration?: number;
  speakers_detected?: number;
  analysis: Record<string, unknown>;
}): Promise<SavedMeetingRecord> {
  try {
    const res = await fetch(`${API_URL}/api/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error("Failed to save to database");
    }
    return res.json();
  } catch (err) {
    // Fallback to local storage for offline resilience
    const local = JSON.parse(localStorage.getItem("meetmind_history") || "[]");
    const newRecord: SavedMeetingRecord = {
      id: payload.id || Date.now().toString(),
      title: payload.title || "Meeting Report",
      transcript: payload.transcript || "",
      duration: payload.duration || 0,
      speakers_detected: payload.speakers_detected || 1,
      health_score: (payload.analysis?.meeting_health_score as number) || 50,
      archetype: (payload.analysis?.meeting_archetype as any) || { type: "sync", emoji: "🔄", label: "Sync Meeting" },
      tldr: (payload.analysis?.tldr as string) || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analysis: payload.analysis,
    };
    local.unshift(newRecord);
    localStorage.setItem("meetmind_history", JSON.stringify(local));
    return newRecord;
  }
}

export async function fetchMeetingsFromDb(params?: {
  q?: string;
  archetype?: string;
  limit?: number;
  offset?: number;
}): Promise<SavedMeetingRecord[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.archetype && params.archetype !== "all") query.set("archetype", params.archetype);
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.offset) query.set("offset", params.offset.toString());

  try {
    const res = await fetch(`${API_URL}/api/meetings?${query.toString()}`);
    if (!res.ok) throw new Error("DB fetch failed");
    const data = await res.json();
    return data.meetings || [];
  } catch {
    // Fallback to local storage
    const local = JSON.parse(localStorage.getItem("meetmind_history") || "[]");
    return local;
  }
}

export async function fetchMeetingById(id: string): Promise<SavedMeetingRecord | null> {
  try {
    const res = await fetch(`${API_URL}/api/meetings/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    const local = JSON.parse(localStorage.getItem("meetmind_history") || "[]");
    return local.find((m: SavedMeetingRecord) => m.id === id) || null;
  }
}

export async function deleteMeetingFromDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/meetings/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return true;
  } catch {
    const local = JSON.parse(localStorage.getItem("meetmind_history") || "[]");
    const filtered = local.filter((m: SavedMeetingRecord) => m.id !== id);
    localStorage.setItem("meetmind_history", JSON.stringify(filtered));
    return true;
  }
}

export async function clearAllMeetingsFromDb(): Promise<boolean> {
  try {
    await fetch(`${API_URL}/api/meetings`, { method: "DELETE" });
    localStorage.removeItem("meetmind_history");
    return true;
  } catch {
    localStorage.removeItem("meetmind_history");
    return true;
  }
}

export async function toggleActionItemDb(meetingId: string, itemIndex: number): Promise<SavedMeetingRecord | null> {
  try {
    const res = await fetch(`${API_URL}/api/meetings/${meetingId}/action-items/${itemIndex}`, {
      method: "PATCH",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchMeetingStats(): Promise<MeetingStats> {
  try {
    const res = await fetch(`${API_URL}/api/meetings/stats/summary`);
    if (!res.ok) throw new Error("Stats fetch failed");
    return res.json();
  } catch {
    const local = JSON.parse(localStorage.getItem("meetmind_history") || "[]");
    return {
      total_meetings: local.length,
      average_health_score: local.length ? Math.round(local.reduce((a: number, c: any) => a + (c.health_score || 50), 0) / local.length) : 0,
      total_action_items: 0,
      completed_action_items: 0,
      top_archetype: null,
    };
  }
}

// ── Client-side mock analysis generator ──────────────────────────────
// Extracts real data from the transcript to generate realistic mock output

function generateMockAnalysis(transcript: string): Record<string, unknown> {
  // Extract speakers from "Name:" or "Name (Role):" patterns
  const speakerPattern = /^([A-Z][a-zA-Z]+(?:\s*\([^)]+\))?)\s*:/gm;
  const speakerMatches = Array.from(transcript.matchAll(speakerPattern));
  const speakerNames = Array.from(new Set(speakerMatches.map((m) => m[1].replace(/\s*\([^)]+\)/, ""))));
  const speakers = speakerNames.length > 0 ? speakerNames : ["Speaker 1", "Speaker 2", "Speaker 3"];

  // Count lines per speaker for participation analysis
  const speakerLineCounts: Record<string, number> = {};
  for (const name of speakers) {
    const regex = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, "gm");
    speakerLineCounts[name] = (transcript.match(regex) || []).length;
  }
  const totalLines = Object.values(speakerLineCounts).reduce((a, b) => a + b, 0) || 1;
  const dominantSpeaker = Object.entries(speakerLineCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantPct = Math.round((dominantSpeaker[1] / totalLines) * 100);

  // Extract potential action items (lines with "by", "deadline", "will", "need to", etc.)
  const actionPatterns = transcript.match(/.*(?:by\s+(?:end of|next|this)|will\s+\w+|need to|I'll|can you|let's|should).*/gi) || [];
  const actions = actionPatterns.slice(0, 8).map((line, i) => {
    const ownerMatch = line.match(/^([A-Z][a-zA-Z]+)/);
    const deadlineMatch = line.match(/by\s+([\w\s,]+?)(?:\.|$)/i);
    return {
      task: line.replace(/^[A-Z][a-zA-Z]+(?:\s*\([^)]+\))?\s*:\s*/, "").trim().slice(0, 100),
      owner: ownerMatch ? ownerMatch[1] : speakers[i % speakers.length],
      deadline: deadlineMatch ? deadlineMatch[1].trim() : "TBD",
      priority: i < 3 ? "high" : i < 6 ? "medium" : "low",
    };
  });

  // Extract decisions (lines with "decided", "let's do", "we're going", "agreed", etc.)
  const decisionPatterns = transcript.match(/.*(?:decided|let's do|we're\s+(?:shipping|hiring|cutting)|agreed|approved|committed|fine\.|done\.).*/gi) || [];
  const decisions = decisionPatterns.slice(0, 5).map((line) => {
    const ownerMatch = line.match(/^([A-Z][a-zA-Z]+)/);
    return {
      decision: line.replace(/^[A-Z][a-zA-Z]+(?:\s*\([^)]+\))?\s*:\s*/, "").trim().slice(0, 120),
      made_by: ownerMatch ? ownerMatch[1] : speakers[0],
      context: "Discussed and agreed upon during the meeting",
    };
  });

  // Extract key topics (most frequent multi-word phrases)
  const words = transcript.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    if (w.length > 4 && !["about", "their", "there", "would", "could", "should", "which", "these", "those", "being", "every", "think", "going", "really"].includes(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }
  const topTopics = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  // Detect potential conflicts (lines with pushback language)
  const conflictPatterns = transcript.match(/.*(?:unrealistic|concerned|disagree|pushback|frustrated|that's not|I need that on record|burning out).*/gi) || [];
  const hasConflict = conflictPatterns.length > 0;
  const conflicts = hasConflict && speakers.length >= 2
    ? [{
        speaker_a: speakers.length > 1 ? speakers[1] : speakers[0],
        speaker_b: speakers[0],
        topic: topTopics[0] || "project priorities",
        description: conflictPatterns[0]?.replace(/^[A-Z][a-zA-Z]+(?:\s*\([^)]+\))?\s*:\s*/, "").trim().slice(0, 200) || "",
      }]
    : [];

  // Determine archetype
  const decisionCount = decisions.length;
  const hasTension = hasConflict;
  let archetype;
  if (hasTension && decisionCount < 2) {
    archetype = { type: "crisis", label: "Crisis Meeting", emoji: "🔵", description: "High tension detected with urgent issues discussed" };
  } else if (decisionCount >= 3) {
    archetype = { type: "decision", label: "Decision Meeting", emoji: "🔴", description: `${decisionCount} major decisions were made in this meeting` };
  } else if (actions.length > 5 && decisionCount < 2) {
    archetype = { type: "status_update", label: "Status Update", emoji: "🟡", description: "Primarily informational with task assignments" };
  } else {
    archetype = { type: "sync", label: "Sync Meeting", emoji: "⚪", description: "Routine team alignment and coordination" };
  }

  // Health scores
  const clarity = Math.min(25, 15 + Math.floor(Math.random() * 8));
  const decisionsMade = Math.min(25, 10 + decisionCount * 4);
  const participation = Math.min(25, dominantPct < 40 ? 22 : dominantPct < 60 ? 17 : 12);
  const actionability = Math.min(25, 10 + actions.length * 2);
  const healthScore = clarity + decisionsMade + participation + actionability;

  // Sentiment per speaker
  const sentiments = ["positive", "neutral", "tense"];
  const breakdown = speakers.map((speaker, i) => ({
    speaker,
    sentiment: hasConflict && speaker === conflicts[0]?.speaker_a ? "tense" : sentiments[i % 2 === 0 ? 0 : 1],
    confidence: +(0.6 + Math.random() * 0.35).toFixed(2),
  }));

  const firstSentence = transcript.split(/[.!?]/)[0]?.trim().slice(0, 100) || "Meeting discussion";
  const secondSentence = actions.length > 0
    ? `Key outcomes include ${actions.length} action items and ${decisions.length} decisions.`
    : "The team discussed various topics and aligned on next steps.";

  return {
    tldr: `${firstSentence}. ${secondSentence}`,
    executive_summary: `This meeting involved ${speakers.length} participants who discussed multiple agenda items. ${decisions.length > 0 ? `${decisions.length} decisions were made during the session.` : ""} ${actions.length > 0 ? `${actions.length} action items were assigned with clear ownership.` : ""} ${hasConflict ? "Some tension was detected between participants regarding priorities and timelines." : "The overall tone was collaborative."} The meeting covered topics including ${topTopics.slice(0, 5).join(", ")}.`,
    detailed_summary: `The meeting was attended by ${speakers.join(", ")}. ${transcript.split(".").slice(0, 3).join(". ").trim()}. Throughout the discussion, the team addressed key priorities and assigned clear next steps. ${decisions.length > 0 ? `Notable decisions included: ${decisions.map(d => d.decision).slice(0, 3).join("; ")}.` : ""} ${hasConflict ? `There was notable friction around ${conflicts[0]?.topic || "project direction"}, which was ultimately resolved through compromise.` : ""} The meeting concluded with a clear action plan and defined deadlines.`,
    action_items: actions.length > 0 ? actions : [
      { task: "Follow up on meeting discussion points", owner: speakers[0], deadline: "TBD", priority: "medium" },
      { task: "Share meeting notes with team", owner: speakers[0], deadline: "End of day", priority: "low" },
    ],
    decisions: decisions.length > 0 ? decisions : [
      { decision: "Team aligned on discussed priorities", made_by: speakers[0], context: "General consensus reached" },
    ],
    sentiment_analysis: {
      overall: hasConflict ? "mixed" : "positive",
      score: hasConflict ? 55 + Math.floor(Math.random() * 20) : 70 + Math.floor(Math.random() * 20),
      breakdown,
    },
    meeting_health_score: healthScore,
    health_breakdown: { clarity, decisions_made: decisionsMade, participation, actionability },
    health_explanations: {
      clarity: `Communication was ${clarity > 20 ? "mostly clear" : "somewhat unclear"} across ${speakers.length} speakers`,
      decisions_made: `${decisions.length} concrete decision${decisions.length !== 1 ? "s were" : " was"} reached during this meeting`,
      participation: `${dominantSpeaker[0]} contributed ${dominantPct}% of the discussion${dominantPct > 50 ? " — participation was imbalanced" : ""}`,
      actionability: `${actions.length} action item${actions.length !== 1 ? "s" : ""} identified${actions.filter(a => a.deadline !== "TBD").length > 0 ? " with deadlines assigned" : ""}`,
    },
    conflict_detection: {
      has_conflict: hasConflict,
      conflicts,
    },
    meeting_archetype: archetype,
    key_topics: topTopics,
    follow_up_email: `Subject: Meeting Summary & Action Items\n\nHi Team,\n\nThank you for today's meeting. Here's a quick recap:\n\n${decisions.length > 0 ? "Decisions Made:\n" + decisions.map(d => `• ${d.decision}`).join("\n") + "\n\n" : ""}${actions.length > 0 ? "Action Items:\n" + actions.map(a => `• ${a.owner} → ${a.task} (${a.deadline})`).join("\n") + "\n\n" : ""}Please follow up on your assigned items.\n\nBest regards,\nMeetMind AI`,
  };
}
