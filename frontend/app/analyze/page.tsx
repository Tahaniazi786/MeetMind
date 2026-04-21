"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useMeeting, MeetingAnalysis } from "@/context/MeetingContext";
import { transcribeAudio, analyzeTranscript } from "@/lib/api";
import Link from "next/link";

const PROCESSING_STEPS = [
  "Transcribing audio…",
  "Extracting insights…",
  "Generating action items…",
  "Building your report…",
];

// Wrapper with Suspense boundary (Next.js 14 requirement for useSearchParams)
export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <p className="font-mono text-text-muted">Loading…</p>
        </div>
      </div>
    }>
      <AnalyzePageInner />
    </Suspense>
  );
}

function AnalyzePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAnalysis, setTranscript, isProcessing, setIsProcessing, processingStep, setProcessingStep } = useMeeting();

  const defaultTab = searchParams.get("tab") === "audio" ? 0 : 1;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [error, setError] = useState("");

  // ── Dropzone ───────────────────────────────────────────────────────
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setAudioFile(accepted[0]);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "audio/x-m4a": [".m4a"],
      "audio/webm": [".webm"],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
    onDropRejected: (rejections) => {
      const reason = rejections[0]?.errors[0]?.code;
      if (reason === "file-too-large") setError("File must be under 25 MB.");
      else setError("Only .mp3, .wav, .m4a, .webm files accepted.");
    },
  });

  // ── Line count ─────────────────────────────────────────────────────
  const lineCount = transcriptText.split("\n").length;
  const charCount = transcriptText.length;

  // ── Submit handler ─────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setError("");
    setIsProcessing(true);
    setProcessingStep(0);

    try {
      let transcript = transcriptText;

      // Step 1: Transcribe audio if needed
      if (activeTab === 0) {
        if (!audioFile) {
          setError("Please upload an audio file.");
          setIsProcessing(false);
          return;
        }
        setProcessingStep(0);
        const result = await transcribeAudio(audioFile);
        transcript = result.transcript;
      }

      if (!transcript || transcript.trim().length < 50) {
        setError("Transcript must be at least 50 characters.");
        setIsProcessing(false);
        return;
      }

      setTranscript(transcript);

      // Step 2-4: Analyze
      setProcessingStep(1);
      await new Promise((r) => setTimeout(r, 600)); // visual delay
      setProcessingStep(2);

      const analysis = await analyzeTranscript(transcript);

      setProcessingStep(3);
      await new Promise((r) => setTimeout(r, 400));

      setAnalysis(analysis as unknown as MeetingAnalysis);
      setIsProcessing(false);
      router.push("/results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setIsProcessing(false);
    }
  };

  // ── Auto-advance processing step visually ──────────────────────────
  useEffect(() => {
    if (!isProcessing) return;
    // Visual shimmer for step transitions
  }, [isProcessing, processingStep]);

  return (
    <div className="min-h-screen">
      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg font-bold text-sm">M</div>
          <span className="font-display font-bold text-xl tracking-tight">
            Meet<span className="text-accent">Mind</span>
          </span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link
            href="/history"
            className="text-sm font-bold text-text hover:text-accent transition-colors"
          >
            History
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2 text-center">
            Analyze a Meeting
          </h1>
          <p className="text-text-muted text-center mb-10">
            Upload audio or paste a transcript to get started.
          </p>
        </motion.div>

        {/* ── Processing overlay ──────────────────────────────────── */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center max-w-md px-6">
                {/* Animated brain icon */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-8"
                >
                  🧠
                </motion.div>

                <h2 className="font-display font-bold text-2xl mb-8">Processing your meeting…</h2>

                <div className="space-y-4">
                  {PROCESSING_STEPS.map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: processingStep >= i ? 1 : 0.3,
                        x: 0,
                      }}
                      transition={{ delay: i * 0.15, duration: 0.4 }}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={`step-dot ${
                          processingStep > i
                            ? "complete"
                            : processingStep === i
                            ? "active"
                            : ""
                        }`}
                      />
                      <span
                        className={`font-mono text-sm ${
                          processingStep >= i ? "text-text" : "text-text-dim"
                        }`}
                      >
                        {step}
                      </span>
                      {processingStep > i && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-status-low ml-auto"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-8 h-1 bg-bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((processingStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="flex border-b border-bg-border mb-8">
            {["🎙️  Audio Upload", "📝  Paste Transcript"].map((label, i) => (
              <button
                key={label}
                onClick={() => {
                  setActiveTab(i);
                  setError("");
                }}
                className={`flex-1 py-3 text-sm font-display font-bold tracking-wide transition-all border-b-2 ${
                  activeTab === i
                    ? "text-accent border-accent"
                    : "text-text-muted border-transparent hover:text-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 0 ? (
              /* ── Audio Upload ─────────────────────────────────── */
              <motion.div
                key="audio"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  {...getRootProps()}
                  id="audio-dropzone"
                  className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-accent bg-accent/5"
                      : audioFile
                      ? "border-status-low/50 bg-status-low/5"
                      : "border-bg-border hover:border-text-dim"
                  }`}
                >
                  <input {...getInputProps()} />

                  {audioFile ? (
                    <div>
                      <div className="text-4xl mb-4">🎵</div>
                      <p className="font-display font-bold text-lg mb-1">{audioFile.name}</p>
                      <p className="text-text-muted text-sm font-mono">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAudioFile(null);
                        }}
                        className="mt-4 text-xs text-text-dim hover:text-status-high transition-colors font-mono"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : isDragActive ? (
                    <div>
                      <div className="text-4xl mb-4">📥</div>
                      <p className="font-display font-bold text-lg text-accent">Drop your audio file here</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-4">🎙️</div>
                      <p className="font-display font-bold text-lg mb-2">
                        Drag & drop audio file
                      </p>
                      <p className="text-text-muted text-sm">
                        or click to browse · .mp3, .wav, .m4a, .webm · Max 25 MB
                      </p>

                      {/* Waveform preview animation */}
                      <div className="flex items-center justify-center gap-1 mt-6 h-8 opacity-30">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-accent rounded-full"
                            style={{
                              animation: `waveform ${1.2 + Math.random() * 1.5}s ease-in-out infinite`,
                              animationDelay: `${i * 0.06}s`,
                              height: `${6 + Math.random() * 20}px`,
                            } as React.CSSProperties}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* ── Transcript Input ─────────────────────────────── */
              <motion.div
                key="text"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative bg-bg-card rounded-xl border border-bg-border overflow-hidden">
                  {/* Line numbers + textarea */}
                  <div className="flex">
                    {/* Line numbers column */}
                    <div className="hidden md:flex flex-col py-4 px-3 bg-bg border-r border-bg-border text-right select-none min-w-[3rem]">
                      {Array.from({ length: Math.max(lineCount, 15) }).map((_, i) => (
                        <span key={i} className="font-mono text-xs text-text-dim leading-6">
                          {i + 1}
                        </span>
                      ))}
                    </div>

                    <textarea
                      id="transcript-input"
                      value={transcriptText}
                      onChange={(e) => {
                        setTranscriptText(e.target.value);
                        setError("");
                      }}
                      placeholder={`Paste your meeting transcript here...\n\nExample:\nAlice: Let's discuss the Q4 roadmap.\nBob: I think we should prioritize the mobile app.\nAlice: Agreed. Bob, can you draft a proposal by Friday?\nBob: Sure, I'll have it ready.\nCarol: What about the budget review?\nAlice: Good point. Let's schedule that for next Tuesday.`}
                      className="flex-1 bg-transparent text-text font-mono text-sm p-4 resize-none focus:outline-none min-h-[400px] leading-6 placeholder:text-text-dim/40"
                    />
                  </div>

                  {/* Status bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-t border-bg-border bg-bg">
                    <span className="font-mono text-xs text-text-dim">
                      {lineCount} lines · {charCount.toLocaleString()} chars
                    </span>
                    {charCount > 0 && charCount < 50 && (
                      <span className="font-mono text-xs text-status-high">
                        Need {50 - charCount} more characters
                      </span>
                    )}
                    {charCount >= 50 && (
                      <span className="font-mono text-xs text-status-low">✓ Ready to analyze</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error message ─────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-status-high/10 border border-status-high/30 rounded-lg text-status-high text-sm font-mono"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Analyze button ────────────────────────────────────── */}
          <motion.button
            id="btn-analyze"
            onClick={handleAnalyze}
            disabled={isProcessing || (activeTab === 0 ? !audioFile : charCount < 50)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mt-8 py-4 bg-accent text-bg font-display font-bold text-lg rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent/20"
          >
            {isProcessing ? "Processing…" : "Analyze Meeting →"}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
