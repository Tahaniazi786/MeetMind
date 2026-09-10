import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return key;
}

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite", // 0.8s response time, never freezes
  "gemini-3.1-flash-lite", // Fast lightweight fallback
  "gemini-3.5-flash",      // Full structured reasoning
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

function withTimeout<T>(promise: Promise<T>, ms = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI model timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

/**
 * Transcribe an audio file buffer using Google Gemini Multimodal Audio API.
 */
export async function transcribeAudioWithGemini(
  buffer: Buffer,
  mimeType: string
): Promise<{ transcript: string; duration: number; speakers_detected: number }> {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const base64Data = buffer.toString("base64");

  const promptText = `You are an expert audio transcriptionist.
Transcribe this entire audio recording accurately into text.
Requirements:
1. Identify distinct speakers and label each speaker clearly (e.g. "Speaker 1:", "Speaker 2:", or by their names like "Sarah:", "John:" if mentioned in the conversation).
2. Output the transcript as formatted dialogue with line breaks between different speakers.
3. Preserve all key discussion points, questions, decisions, and action items verbatim.
4. Output ONLY the transcript with speaker labels. Do not add conversational intro/outro.`;

  let lastError: Error | null = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`🎙️ Transcribing with Gemini model: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
        },
      });

      const result = await withTimeout(
        model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || "audio/wav",
            },
          },
          {
            text: promptText,
          },
        ]),
        30000
      );

      const transcript = result.response.text().trim();
      if (transcript && transcript.length > 0) {
        const speakerPattern = /^([A-Z][a-zA-Z0-9\s]+?):/gm;
        const matches = transcript.match(speakerPattern) || [];
        const uniqueSpeakers = new Set(
          matches.map((s) => s.replace(":", "").trim().toLowerCase())
        );
        const speakers_detected = Math.max(uniqueSpeakers.size, 1);
        const duration = Math.max(Math.round(buffer.length / 16000), 15);

        console.log(`✅ Transcription complete with ${modelName} (${transcript.length} chars, ${speakers_detected} speakers)`);
        return { transcript, duration, speakers_detected };
      }
    } catch (err: any) {
      console.warn(`⚠️ Model ${modelName} transcribe failed (${err.message}). Trying next model...`);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || "Failed to transcribe audio with Gemini");
}

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

function buildPrompt(transcript: string): string {
  return `You are MeetMind, an expert meeting intelligence AI. Analyze the following meeting transcript and return ONLY valid JSON matching the exact schema specified below. Do NOT add markdown fences, preamble, or explanation.

Extract:
1. Three-level summaries (tldr — exactly 2 sentences, executive_summary — 5 to 7 sentences, detailed_summary — full comprehensive paragraph)
2. All action items with owner names found in transcript, estimated deadlines (use "TBD" if unclear), and priority ("high", "medium", or "low")
3. All decisions explicitly or implicitly made, with who made them and surrounding context
4. Sentiment analysis per detected speaker with confidence score (0-1), plus overall sentiment ("positive", "neutral", "tense", or "mixed") and score (0-100)
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
${transcript}

Return ONLY this exact JSON structure:
${OUTPUT_SCHEMA}`;
}

/**
 * Run full meeting analysis using Google Gemini.
 */
export async function analyzeMeetingWithGemini(transcript: string): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(transcript);

  let rawOutput = "";
  let lastError: Error | null = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`🧠 Analyzing with Gemini model: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const result = await withTimeout(model.generateContent(prompt), 30000);
      rawOutput = result.response.text();
      console.log(`✅ Analysis complete with ${modelName}`);
      break;
    } catch (err: any) {
      console.warn(`⚠️ Model ${modelName} analysis failed (${err.message}). Trying next model...`);
      lastError = err;
    }
  }

  if (!rawOutput) {
    throw new Error(lastError?.message || "Failed to analyze transcript with Gemini AI");
  }

  let cleaned = rawOutput.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  const parsed = JSON.parse(cleaned);
  return normalizeOutput(parsed);
}

function normalizeOutput(data: any): Record<string, unknown> {
  return {
    tldr: data.tldr || "",
    executive_summary: data.executive_summary || "",
    detailed_summary: data.detailed_summary || "",
    action_items: Array.isArray(data.action_items)
      ? data.action_items.map((item: any) => ({
          task: item.task || "",
          owner: item.owner || "Unassigned",
          deadline: item.deadline || "TBD",
          priority: ["high", "medium", "low"].includes(item.priority?.toLowerCase())
            ? item.priority.toLowerCase()
            : "medium",
        }))
      : [],
    decisions: Array.isArray(data.decisions)
      ? data.decisions.map((d: any) => ({
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
        ? data.sentiment_analysis.breakdown.map((s: any) => ({
            speaker: s.speaker || "Unknown",
            sentiment: s.sentiment || "neutral",
            confidence:
              typeof s.confidence === "number"
                ? Math.min(1, Math.max(0, s.confidence))
                : 0.8,
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
        ? data.conflict_detection.conflicts.map((c: any) => ({
            speaker_a: c.speaker_a || "Unknown",
            speaker_b: c.speaker_b || "Unknown",
            topic: c.topic || "unspecified topic",
            description: c.description || "",
          }))
        : [],
    },
    meeting_archetype: {
      type: ["decision", "status_update", "brainstorm", "crisis", "sync"].includes(
        data.meeting_archetype?.type?.toLowerCase()
      )
        ? data.meeting_archetype.type.toLowerCase()
        : "sync",
      label: data.meeting_archetype?.label || "Sync Meeting",
      emoji: data.meeting_archetype?.emoji || "🔄",
      description: data.meeting_archetype?.description || "",
    },
    key_topics: Array.isArray(data.key_topics)
      ? data.key_topics.filter((t: any) => typeof t === "string").slice(0, 20)
      : [],
    follow_up_email: data.follow_up_email || "",
  };
}

function clampScore(val: any, max: number): number {
  if (typeof val !== "number") return Math.round(max / 2);
  return Math.min(max, Math.max(0, Math.round(val)));
}
