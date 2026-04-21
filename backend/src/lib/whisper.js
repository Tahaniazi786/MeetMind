const OpenAI = require("openai");
const fs = require("fs");

/**
 * Transcribe an audio file using OpenAI Whisper API.
 *
 * @param {string} filePath — absolute path to the audio file
 * @returns {{ transcript: string, duration: number }}
 */
async function transcribeAudio(filePath) {
  if (!process.env.OPENAI_API_KEY) {
    throw Object.assign(new Error("OPENAI_API_KEY is not set in .env"), {
      statusCode: 500,
      code: "AI_AUTH_ERROR",
    });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const fileStream = fs.createReadStream(filePath);

  const response = await openai.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  // Whisper returns segments — count unique speakers heuristically
  const transcript = response.text || "";
  const duration = response.duration || 0;

  // Attempt speaker detection from transcript patterns like "Speaker 1:", "John:", etc.
  const speakerPattern = /^([A-Z][a-zA-Z\s]+?):/gm;
  const speakerMatches = transcript.match(speakerPattern) || [];
  const uniqueSpeakers = new Set(
    speakerMatches.map((s) => s.replace(":", "").trim().toLowerCase())
  );
  const speakersDetected = Math.max(uniqueSpeakers.size, 1);

  return { transcript, duration, speakersDetected };
}

module.exports = { transcribeAudio };
