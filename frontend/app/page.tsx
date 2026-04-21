"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

// ── Animation variants ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  { icon: "📋", title: "Smart Summaries", desc: "3-level summaries: TL;DR, Executive, and Detailed — all AI-generated." },
  { icon: "✅", title: "Action Items", desc: "Tasks auto-extracted with owners, deadlines, and priority levels." },
  { icon: "⚖️", title: "Decision Log", desc: "Every decision made in your meeting, captured and catalogued." },
  { icon: "🎭", title: "Sentiment Analysis", desc: "Per-speaker sentiment detection — positive, tense, or conflict." },
  { icon: "💯", title: "Health Score", desc: "0–100 meeting quality score based on clarity, decisions, and participation." },
  { icon: "📧", title: "Follow-up Email", desc: "Auto-drafted professional email ready to send to all attendees." },
];

export default function LandingPage() {
  // Generate waveform bars
  const bars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        delay: `${(i * 0.04).toFixed(2)}s`,
        duration: `${1.5 + Math.random() * 2}s`,
        minH: `${4 + Math.random() * 8}px`,
        maxH: `${30 + Math.random() * 70}px`,
      })),
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Waveform background ──────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="waveform-container w-full max-w-6xl px-8">
          {bars.map((bar, i) => (
            <div
              key={i}
              className="waveform-bar"
              style={{
                "--delay": bar.delay,
                "--duration": bar.duration,
                "--min-h": bar.minH,
                "--max-h": bar.maxH,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* ── Gradient overlay ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/90 to-bg pointer-events-none" />

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg font-bold text-sm">
            M
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Meet<span className="text-accent">Mind</span>
          </span>
        </div>
        <Link
          href="/analyze"
          className="text-sm text-text-muted hover:text-accent transition-colors font-mono"
        >
          Launch App →
        </Link>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 max-w-5xl mx-auto">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-bg-border bg-bg-card mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-mono text-text-muted tracking-wide uppercase">
            AI-Powered Meeting Intelligence
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] mb-6"
        >
          Your meetings.
          <br />
          <span className="text-accent">Finally intelligent.</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-text-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-12"
        >
          Paste a transcript or upload audio. Get summaries, action items,
          decisions, sentiment — in seconds.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/analyze?tab=audio"
            id="cta-upload-audio"
            className="group relative px-8 py-4 bg-accent text-bg font-display font-bold text-base rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
              Upload Audio
            </span>
          </Link>

          <Link
            href="/analyze?tab=text"
            id="cta-paste-transcript"
            className="px-8 py-4 border border-bg-border text-text font-display font-bold text-base rounded-xl transition-all hover:border-accent/50 hover:bg-accent/5"
          >
            <span className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
              </svg>
              Paste Transcript
            </span>
          </Link>

          <Link
            href="/demo"
            id="cta-try-demo"
            className="px-8 py-4 border border-status-low/30 text-status-low font-display font-bold text-base rounded-xl transition-all hover:border-status-low/60 hover:bg-status-low/5"
          >
            <span className="flex items-center gap-2">
              ✨ Try Demo
            </span>
          </Link>
        </motion.div>

        {/* ── Stats row ──────────────────────────────────────────── */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex gap-12 mt-20 text-center"
        >
          {[
            { val: "10+", label: "Intelligence outputs" },
            { val: "<30s", label: "Analysis time" },
            { val: "PDF", label: "Export ready" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-mono text-2xl font-bold text-accent">{s.val}</div>
              <div className="text-xs text-text-dim mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* ── Feature Grid ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
            Everything your meeting needs.<br />
            <span className="text-text-muted">Nothing it doesn&apos;t.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="card-glow bg-bg-card rounded-xl p-6 cursor-default"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-bg-border py-8 px-6 text-center">
        <p className="text-text-dim text-xs font-mono">
          MeetMind © {new Date().getFullYear()} · AI-Powered Meeting Intelligence
        </p>
      </footer>
    </div>
  );
}
