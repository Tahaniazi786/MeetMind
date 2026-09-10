const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");

// Ultra-fast, free, non-freezing multimodal models in priority order
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite", // 0.8s response time, never freezes
  "gemini-3.1-flash-lite", // Fast lightweight fallback
  "gemini-3.5-flash",      // Full multimodal capability
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".mp3":
      return "audio/mp3";
    case ".wav":
      return "audio/wav";
    case ".m4a":
      return "audio/m4a";
    case ".ogg":
      return "audio/ogg";
    case ".webm":
      return "audio/webm";
    default:
      return "audio/wav";
  }
}

/**
 * Executes a promise with an enforced timeout so it never hangs or freezes.
 */
function withTimeout(promise, ms = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Model timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

/**
 * Transcribe an audio file using Google Gemini Multimodal Audio API.
 *
 * @param {string} filePath — absolute path to the audio file
 * @returns {Promise<{ transcript: string, duration: number, speakersDetected: number }>}
 */
async function transcribeAudio(filePath) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error("GEMINI_API_KEY is not set in .env"), {
      statusCode: 500,
      code: "AI_AUTH_ERROR",
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const mimeType = getMimeType(filePath);
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);

  console.log(`🎙️ Processing audio via Gemini (${fileSizeInMB.toFixed(2)} MB, ${mimeType})...`);

  const promptText = `You are an expert audio transcriptionist.
Transcribe this entire audio recording accurately into text.
Requirements:
1. Identify distinct speakers and label each speaker clearly (e.g. "Speaker 1:", "Speaker 2:", or by their names like "Sarah:", "John:" if mentioned in the conversation).
2. Output the transcript as formatted dialogue with line breaks between different speakers.
3. Preserve all key discussion points, questions, decisions, and action items verbatim.
4. Output ONLY the transcript with speaker labels. Do not add conversational intro/outro.`;

  let lastError = null;

  // For files <= 20MB, use inline base64 for fastest sub-second latency
  if (fileSizeInMB <= 20) {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`📡 Transcribing with model: ${modelName}...`);
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
                mimeType: mimeType,
              },
            },
            {
              text: promptText,
            },
          ]),
          30000 // 30s timeout
        );

        const transcript = result.response.text().trim();
        if (transcript && transcript.length > 0) {
          const speakersDetected = detectSpeakerCount(transcript);
          const duration = estimateAudioDuration(stats.size, mimeType);
          console.log(`✅ Transcription complete with ${modelName} (${transcript.length} chars, ${speakersDetected} speakers)`);
          return { transcript, duration, speakersDetected };
        }
      } catch (err) {
        console.warn(`⚠️ Model ${modelName} transcription attempt failed (${err.message}). Trying next model...`);
        lastError = err;
      }
    }
  } else {
    // For larger files (> 20MB), use Google AI File Manager
    const fileManager = new GoogleAIFileManager(apiKey);
    let uploadResult = null;

    try {
      console.log("📤 Uploading large audio file to Gemini File API...");
      uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: mimeType,
        displayName: path.basename(filePath),
      });

      for (const modelName of CANDIDATE_MODELS) {
        try {
          console.log(`📡 Transcribing large audio with model: ${modelName}...`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.1,
            },
          });

          const result = await withTimeout(
            model.generateContent([
              {
                fileData: {
                  fileUri: uploadResult.file.uri,
                  mimeType: uploadResult.file.mimeType,
                },
              },
              {
                text: promptText,
              },
            ]),
            45000 // 45s timeout for large files
          );

          const transcript = result.response.text().trim();
          if (transcript && transcript.length > 0) {
            const speakersDetected = detectSpeakerCount(transcript);
            const duration = estimateAudioDuration(stats.size, mimeType);
            console.log(`✅ Large audio transcription complete with ${modelName}`);
            return { transcript, duration, speakersDetected };
          }
        } catch (err) {
          console.warn(`⚠️ Large audio model ${modelName} attempt failed (${err.message}). Trying next model...`);
          lastError = err;
        }
      }
    } finally {
      if (uploadResult && uploadResult.file?.name) {
        try {
          await fileManager.deleteFile(uploadResult.file.name);
        } catch (_) {
          // ignore cleanup errors
        }
      }
    }
  }

  throw Object.assign(
    new Error(lastError?.message || "Failed to transcribe audio with Gemini models"),
    { statusCode: 502, code: "AI_TRANSCRIPTION_ERROR" }
  );
}

function detectSpeakerCount(transcript) {
  const speakerPattern = /^([A-Z][a-zA-Z0-9\s]+?):/gm;
  const matches = transcript.match(speakerPattern) || [];
  const uniqueSpeakers = new Set(
    matches.map((s) => s.replace(":", "").trim().toLowerCase())
  );
  return Math.max(uniqueSpeakers.size, 1);
}

function estimateAudioDuration(fileSizeBytes, mimeType) {
  let byteRate = 16000;
  if (mimeType === "audio/wav") byteRate = 176400;
  const seconds = Math.round(fileSizeBytes / byteRate);
  return Math.max(seconds, 15);
}

module.exports = { transcribeAudio };
