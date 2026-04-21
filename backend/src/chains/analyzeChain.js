const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");

// ── The exact JSON schema the model must return ──────────────────────
const OUTPUT_SCHEMA = `{
  "tldr": "string (2-sentence summary)",
  "executive_summary": "string (5-7 sentence summary)",
  "detailed_summary": "string (full paragraph summary)",
  "action_items": [
    { "task": "string", "owner": "string", "deadline": "string", "priority": "high|medium|low" }
  ],
  "decisions": [
    { "decision": "string", "made_by": "string", "context": "string" }
  ],
  "sentiment_analysis": {
    "overall": "positive|neutral|tense|mixed",
    "score": "number 0-100",
    "breakdown": [
      { "speaker": "string", "sentiment": "string", "confidence": "number 0-1" }
    ]
  },
  "meeting_health_score": "number 0-100",
  "health_breakdown": {
    "clarity": "number 0-25",
    "decisions_made": "number 0-25",
    "participation": "number 0-25",
    "actionability": "number 0-25"
  },
  "health_explanations": {
    "clarity": "string (one-line explanation of clarity score)",
    "decisions_made": "string (one-line explanation)",
    "participation": "string (one-line explanation mentioning speaker balance)",
    "actionability": "string (one-line explanation mentioning action item count)"
  },
  "conflict_detection": {
    "has_conflict": "boolean",
    "conflicts": [
      { "speaker_a": "string", "speaker_b": "string", "topic": "string", "description": "string" }
    ]
  },
  "meeting_archetype": {
    "type": "decision|status_update|brainstorm|crisis|sync",
    "label": "string (e.g. Decision Meeting)",
    "emoji": "string (single emoji)",
    "description": "string (one-line why this archetype)"
  },
  "key_topics": ["string array of top 15 topics"],
  "follow_up_email": "string (full professional email draft)"
}`;

// ── System prompt ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MeetMind, an expert meeting intelligence AI. Analyze the following meeting transcript and return ONLY valid JSON with NO markdown, NO explanation, NO code fences.

Extract:
1. Three-level summaries (tldr — exactly 2 sentences, executive_summary — 5 to 7 sentences, detailed_summary — full comprehensive paragraph)
2. All action items with owner names found in transcript, estimated deadlines (use "TBD" if unclear), and priority (high/medium/low)
3. All decisions explicitly or implicitly made, with who made them and surrounding context
4. Sentiment analysis per detected speaker with confidence score (0-1), plus overall sentiment and score (0-100)
5. Meeting health score (0-100) based on four equally-weighted dimensions (each 0-25):
   - clarity: how clear and structured the communication was
   - decisions_made: number and quality of decisions reached
   - participation: how balanced the speaking distribution was
   - actionability: how many concrete next-steps were established
6. Health explanations: for each of the 4 health dimensions, write a single concise sentence explaining WHY you gave that score. Be specific — mention speaker names, counts, or concrete observations from the transcript.
7. Conflict detection: analyze if any speakers showed tension, disagreement, or friction with each other. Set has_conflict to true if detected. For each conflict, identify the two speakers and the topic of friction.
8. Meeting archetype: classify this meeting as exactly one of: "decision" (major choices made), "status_update" (informational, low action), "brainstorm" (creative, generative), "crisis" (high tension, urgent), or "sync" (routine alignment). Provide the type, a human label, emoji, and one-line description.
9. Top 15 key topics as a string array (single words or short phrases, suitable for a word cloud)
10. A professional follow-up email draft that summarizes the meeting, lists all action items in a table format, and ends with a polite call-to-action

If you cannot detect specific speakers, use generic labels like "Speaker 1", "Speaker 2".
If no clear deadlines are mentioned, use "TBD" for deadline fields.
Always return every field — never omit any.

Transcript:
{transcript}

Return ONLY this exact JSON structure (no surrounding text):
${OUTPUT_SCHEMA}`;

/**
 * Run the full MeetMind analysis chain on a transcript.
 *
 * @param {string} transcript — raw meeting transcript text
 * @returns {Promise<object>} — parsed JSON matching the schema above
 */
async function runAnalysisChain(transcript) {
  if (!process.env.OPENAI_API_KEY) {
    throw Object.assign(new Error("OPENAI_API_KEY is not set in .env"), {
      statusCode: 500,
      code: "AI_AUTH_ERROR",
    });
  }

  // ── Initialize GPT-4o with 120 s timeout ────────────────────────
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.2,
    maxTokens: 4096,
    timeout: 120_000, // 120 seconds
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // ── Build the prompt ────────────────────────────────────────────
  const prompt = PromptTemplate.fromTemplate(SYSTEM_PROMPT);

  // ── Build the chain ─────────────────────────────────────────────
  const chain = RunnableSequence.from([
    prompt,
    model,
    // Extract string content from AIMessage
    (aiMessage) => aiMessage.content,
  ]);

  // ── Invoke ──────────────────────────────────────────────────────
  const rawOutput = await chain.invoke({ transcript });

  // ── Parse — strip any accidental markdown fences ────────────────
  let cleaned = rawOutput.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("🔴 Failed to parse AI output as JSON:");
    console.error(cleaned.slice(0, 500));
    throw Object.assign(
      new Error("AI returned invalid JSON. Please try again."),
      { statusCode: 502, code: "AI_PARSE_ERROR" }
    );
  }

  // ── Validate required fields & fill defaults ────────────────────
  return normalizeOutput(parsed);
}

/**
 * Ensure every expected field exists with a sane default.
 */
function normalizeOutput(data) {
  return {
    tldr: data.tldr || "",
    executive_summary: data.executive_summary || "",
    detailed_summary: data.detailed_summary || "",
    action_items: Array.isArray(data.action_items)
      ? data.action_items.map((item) => ({
          task: item.task || "",
          owner: item.owner || "Unassigned",
          deadline: item.deadline || "TBD",
          priority: ["high", "medium", "low"].includes(item.priority)
            ? item.priority
            : "medium",
        }))
      : [],
    decisions: Array.isArray(data.decisions)
      ? data.decisions.map((d) => ({
          decision: d.decision || "",
          made_by: d.made_by || "Unknown",
          context: d.context || "",
        }))
      : [],
    sentiment_analysis: {
      overall: data.sentiment_analysis?.overall || "neutral",
      score:
        typeof data.sentiment_analysis?.score === "number"
          ? Math.min(100, Math.max(0, data.sentiment_analysis.score))
          : 50,
      breakdown: Array.isArray(data.sentiment_analysis?.breakdown)
        ? data.sentiment_analysis.breakdown.map((s) => ({
            speaker: s.speaker || "Unknown",
            sentiment: s.sentiment || "neutral",
            confidence:
              typeof s.confidence === "number"
                ? Math.min(1, Math.max(0, s.confidence))
                : 0.5,
          }))
        : [],
    },
    meeting_health_score:
      typeof data.meeting_health_score === "number"
        ? Math.min(100, Math.max(0, Math.round(data.meeting_health_score)))
        : 50,
    health_breakdown: {
      clarity: clampScore(data.health_breakdown?.clarity, 25),
      decisions_made: clampScore(data.health_breakdown?.decisions_made, 25),
      participation: clampScore(data.health_breakdown?.participation, 25),
      actionability: clampScore(data.health_breakdown?.actionability, 25),
    },
    health_explanations: {
      clarity: data.health_explanations?.clarity || "",
      decisions_made: data.health_explanations?.decisions_made || "",
      participation: data.health_explanations?.participation || "",
      actionability: data.health_explanations?.actionability || "",
    },
    conflict_detection: {
      has_conflict: !!data.conflict_detection?.has_conflict,
      conflicts: Array.isArray(data.conflict_detection?.conflicts)
        ? data.conflict_detection.conflicts.map((c) => ({
            speaker_a: c.speaker_a || "Unknown",
            speaker_b: c.speaker_b || "Unknown",
            topic: c.topic || "unspecified topic",
            description: c.description || "",
          }))
        : [],
    },
    meeting_archetype: {
      type: ["decision", "status_update", "brainstorm", "crisis", "sync"].includes(data.meeting_archetype?.type)
        ? data.meeting_archetype.type
        : "sync",
      label: data.meeting_archetype?.label || "Sync Meeting",
      emoji: data.meeting_archetype?.emoji || "⚪",
      description: data.meeting_archetype?.description || "",
    },
    key_topics: Array.isArray(data.key_topics)
      ? data.key_topics.filter((t) => typeof t === "string").slice(0, 20)
      : [],
    follow_up_email: data.follow_up_email || "",
  };
}

function clampScore(val, max) {
  if (typeof val !== "number") return Math.round(max / 2);
  return Math.min(max, Math.max(0, Math.round(val)));
}

module.exports = { runAnalysisChain };
