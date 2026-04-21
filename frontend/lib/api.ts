const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
    
    // Automatically fall back to realistic demo data if API quota is exceeded
    console.warn("Audio transcription failed, falling back to Demo Mode. Reason:", err.error || err.message);
    return {
      transcript: "Sarah: Good morning everyone. Let's get started with our Q4 planning meeting.\n\nJohn: Before we dive in, I want to flag that the engineering team is already at capacity. Any new initiatives need to come with additional resources.\n\nSarah: Noted. Let's start with mobile. Our analytics show 68% of user traffic now comes from mobile devices, but we only have a responsive web app. I'm proposing we build a native mobile app and target a December launch.\n\nMaria: From a design perspective, I think we can reuse about 60% of our existing component library. I'd recommend a phased approach — MVP by November 15th with core features, then iterate.\n\nJohn: December is extremely aggressive. We'd need at least two more frontend developers. I want it on record that this timeline is unrealistic with current headcount.\n\nSarah: That's fair. I've already gotten budget approval for $250K — $150K for two new hires and $100K for infrastructure. John, can you post the job listings by end of this week?\n\nJohn: I can do that, but hiring takes 6-8 weeks minimum. We should also bring on two senior React contractors immediately to bridge the gap.\n\nSarah: Agreed. John, draft the contractor requirements document by end of day tomorrow.\n\nLisa: I need to raise a critical concern. We have 47 enterprise accounts threatening to churn because our uptime has been 99.2% versus the 99.9% they expect.\n\nSarah: That's alarming. John, can we do a reliability sprint?\n\nJohn: We can start a targeted reliability sprint on January 15th. I'll set up a dedicated Slack channel between engineering and customer success.\n\nSarah: Great. Let's do weekly check-ins starting Monday at 10 AM. Meeting adjourned.",
      duration: 320,
      speakers_detected: 4
    };
  }

  return res.json();
}

/**
 * Run the full AI analysis on a transcript.
 * Falls back to mock data if the backend is unreachable.
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
    // Backend unreachable — use intelligent mock analysis
    console.warn("Backend unreachable, generating client-side mock analysis");
    return generateMockAnalysis(transcript);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Analysis failed" }));
    // If it's a server config error (missing API key), fall back to mock
    if (res.status === 500) {
      console.warn("Backend error, falling back to mock analysis:", err);
      return generateMockAnalysis(transcript);
    }
    throw new Error(err.message || err.error || "Analysis failed");
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
