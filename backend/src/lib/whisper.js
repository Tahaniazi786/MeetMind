const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

/**
 * Transcribe an audio file using OpenAI Whisper API.
 * Uses axios to bypass extremely flaky Node 18 fetch streams in Alpine
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

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "segment");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 300000, 
      }
    );

    const transcript = response.data.text || "";
    const duration = response.data.duration || 0;

    const speakerPattern = /^([A-Z][a-zA-Z\s]+?):/gm;
    const speakerMatches = transcript.match(speakerPattern) || [];
    const uniqueSpeakers = new Set(
      speakerMatches.map((s) => s.replace(":", "").trim().toLowerCase())
    );
    const speakersDetected = Math.max(uniqueSpeakers.size, 1);

    return { transcript, duration, speakersDetected };
  } catch (err) {
    console.error("Axios Whisper Upload Error:", err.message);
    if (err.response) {
      throw Object.assign(new Error(err.response.data.error?.message || "OpenAI API Error"), {
        statusCode: err.response.status,
        code: "OPENAI_API_ERROR"
      });
    } else {
      throw Object.assign(new Error("Network connection lost while uploading to OpenAI. The file might be too large or the server timed out."), {
        cause: err,
        statusCode: 502,
        code: "OPENAI_NETWORK_ERROR"
      });
    }
  }
}

module.exports = { transcribeAudio };
