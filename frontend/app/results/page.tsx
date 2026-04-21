"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMeeting } from "@/context/MeetingContext";
import StatCards from "@/components/results/StatCards";
import SmartSummary from "@/components/results/SmartSummary";
import ActionItemsTable from "@/components/results/ActionItemsTable";
import DecisionLog from "@/components/results/DecisionLog";
import SentimentChart from "@/components/results/SentimentChart";
import WordCloud from "@/components/results/WordCloud";
import EmailDraft from "@/components/results/EmailDraft";
import ExportBar from "@/components/results/ExportBar";
import ArchetypeBadge from "@/components/results/ArchetypeBadge";
import ConflictDetector from "@/components/results/ConflictDetector";

// ── Stagger container ────────────────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function ResultsPage() {
  const router = useRouter();
  const { analysis, transcript, clearAnalysis, isHydrated } = useMeeting();

  // Redirect to analyze ONLY after hydration is complete and analysis is still null
  useEffect(() => {
    if (isHydrated && !analysis) {
      router.push("/analyze");
    }
  }, [analysis, isHydrated, router]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <p className="font-mono text-text-muted">Loading analysis…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg font-bold text-sm">M</div>
          <span className="font-display font-bold text-xl tracking-tight">
            Meet<span className="text-accent">Mind</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/analyze"
            className="text-sm text-text-muted hover:text-accent transition-colors font-mono"
          >
            ← New Analysis
          </Link>
          <button
            onClick={() => {
              clearAnalysis();
              router.push("/analyze");
            }}
            className="text-sm text-text-dim hover:text-status-high transition-colors font-mono"
          >
            Clear
          </button>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="flex max-w-7xl mx-auto px-6 gap-6">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block w-64 shrink-0"
        >
          <div className="sticky top-6 bg-bg-card rounded-xl border border-bg-border p-5">
            <h3 className="font-display font-bold text-sm mb-4 text-text-muted uppercase tracking-wide">
              Meeting Info
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">
                  Date
                </span>
                <span className="font-mono text-sm text-text">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">
                  Transcript Length
                </span>
                <span className="font-mono text-sm text-text">
                  {transcript?.length?.toLocaleString() || "—"} chars
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">
                  Speakers Detected
                </span>
                <span className="font-mono text-sm text-text">
                  {analysis.sentiment_analysis.breakdown.length || "—"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">
                  Health Score
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          analysis.meeting_health_score >= 80
                            ? "#22C55E"
                            : analysis.meeting_health_score >= 60
                            ? "#F5A623"
                            : "#EF4444",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${analysis.meeting_health_score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="font-mono text-xs text-accent font-bold">
                    {analysis.meeting_health_score}
                  </span>
                </div>
              </div>

              {/* Health breakdown with AI explanations */}
              <div className="pt-2 border-t border-bg-border">
                <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-3">
                  Score Breakdown
                </span>
                {[
                  { label: "Clarity", key: "clarity" as const, val: analysis.health_breakdown.clarity, max: 25 },
                  { label: "Decisions", key: "decisions_made" as const, val: analysis.health_breakdown.decisions_made, max: 25 },
                  { label: "Participation", key: "participation" as const, val: analysis.health_breakdown.participation, max: 25 },
                  { label: "Actionability", key: "actionability" as const, val: analysis.health_breakdown.actionability, max: 25 },
                ].map((item) => (
                  <div key={item.label} className="mb-3.5">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-text-muted">{item.label}</span>
                      <span className="text-text">{item.val}/{item.max}</span>
                    </div>
                    <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(item.val / item.max) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      />
                    </div>
                    {analysis.health_explanations?.[item.key] && (
                      <p className="text-[10px] text-text-dim mt-1 leading-snug italic">
                        {analysis.health_explanations[item.key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* ── Main panel ───────────────────────────────────────────── */}
        <motion.main
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex-1 min-w-0 space-y-6"
        >
          {/* Page title + Archetype badge */}
          <motion.div variants={fadeUp}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
              <h1 className="font-display font-bold text-2xl md:text-3xl">
                Meeting Intelligence Report
              </h1>
              {analysis.meeting_archetype && (
                <ArchetypeBadge archetype={analysis.meeting_archetype} />
              )}
            </div>
            <p className="text-text-muted text-sm font-mono">
              AI analysis complete · {analysis.action_items.length} action items · {analysis.decisions.length} decisions
            </p>
          </motion.div>

          {/* Conflict Detector */}
          {analysis.conflict_detection?.has_conflict && (
            <motion.div variants={fadeUp}>
              <ConflictDetector conflicts={analysis.conflict_detection} />
            </motion.div>
          )}

          {/* Stat cards */}
          <motion.div variants={fadeUp}>
            <StatCards data={analysis} />
          </motion.div>

          {/* Smart Summary */}
          <motion.div variants={fadeUp}>
            <SmartSummary
              tldr={analysis.tldr}
              executive={analysis.executive_summary}
              detailed={analysis.detailed_summary}
            />
          </motion.div>

          {/* Action Items */}
          <motion.div variants={fadeUp}>
            <ActionItemsTable items={analysis.action_items} />
          </motion.div>

          {/* Decision Log */}
          <motion.div variants={fadeUp}>
            <DecisionLog decisions={analysis.decisions} />
          </motion.div>

          {/* Sentiment + Word Cloud side by side */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SentimentChart sentiment={analysis.sentiment_analysis} />
            <WordCloud topics={analysis.key_topics} />
          </motion.div>

          {/* Follow-up Email */}
          <motion.div variants={fadeUp}>
            <EmailDraft email={analysis.follow_up_email} />
          </motion.div>

          {/* Spacer for sticky bottom bar */}
          <div className="h-16" />
        </motion.main>
      </div>

      {/* ── Sticky Export Bar ──────────────────────────────────────── */}
      <ExportBar analysis={analysis} />
    </div>
  );
}
