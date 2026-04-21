/**
 * Global error handler middleware.
 * Catches all errors thrown in route handlers and returns clean JSON.
 */
function errorHandler(err, _req, res, _next) {
  console.error("🔴 Error:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Multer file-size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File too large",
      message: "Audio file must be under 25 MB.",
      code: "FILE_TOO_LARGE",
    });
  }

  // Multer wrong file type
  if (err.code === "LIMIT_UNEXPECTED_FILE" || err.message?.includes("file type")) {
    return res.status(415).json({
      error: "Unsupported file type",
      message: "Only .mp3 and .wav files are accepted.",
      code: "UNSUPPORTED_FILE_TYPE",
    });
  }

  // OpenAI / LangChain timeout
  if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
    return res.status(504).json({
      error: "AI processing timeout",
      message: "The AI model took too long to respond. Please try with a shorter transcript.",
      code: "AI_TIMEOUT",
    });
  }

  // OpenAI rate limit
  if (err.status === 429 || err.message?.includes("Rate limit")) {
    return res.status(429).json({
      error: "Rate limited",
      message: "Too many requests to the AI service. Please wait a moment.",
      code: "RATE_LIMITED",
    });
  }

  // OpenAI auth error
  if (err.status === 401 || err.message?.includes("API key")) {
    return res.status(500).json({
      error: "AI configuration error",
      message: "The AI service is not properly configured. Check your API key.",
      code: "AI_AUTH_ERROR",
    });
  }

  // Default
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR",
  });
}

module.exports = { errorHandler };
