"use client";

import { motion } from "framer-motion";
import HealthGauge from "./HealthGauge";
import type { MeetingAnalysis } from "@/context/MeetingContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const sentimentColors: Record<string, string> = {
  positive: "#22C55E",
  neutral: "#F5A623",
  tense: "#EF4444",
  mixed: "#A855F7",
};

const sentimentEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  tense: "😬",
  mixed: "🤔",
};

interface Props {
  data: MeetingAnalysis;
}

export default function StatCards({ data }: Props) {
  const sentColor = sentimentColors[data.sentiment_analysis.overall] || "#F5A623";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Health Score */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card-glow bg-bg-card rounded-xl p-6 flex flex-col items-center justify-center col-span-2 lg:col-span-1"
      >
        <HealthGauge score={data.meeting_health_score} size={130} />
        <span className="text-xs text-text-muted font-mono mt-3 uppercase tracking-wide">
          Meeting Health
        </span>
      </motion.div>

      {/* Action Items */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card-glow bg-bg-card rounded-xl p-6 flex flex-col justify-between"
      >
        <div className="text-text-dim text-xs font-mono uppercase tracking-wide mb-2">
          Action Items
        </div>
        <div className="font-mono text-4xl font-bold text-accent">
          {data.action_items.length}
        </div>
        <div className="flex gap-2 mt-3">
          {["high", "medium", "low"].map((p) => {
            const count = data.action_items.filter((a) => a.priority === p).length;
            if (count === 0) return null;
            const color = p === "high" ? "bg-status-high" : p === "medium" ? "bg-status-medium" : "bg-status-low";
            return (
              <span key={p} className={`${color} text-bg text-[10px] font-mono font-bold px-2 py-0.5 rounded-full`}>
                {count} {p}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Decisions */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card-glow bg-bg-card rounded-xl p-6 flex flex-col justify-between"
      >
        <div className="text-text-dim text-xs font-mono uppercase tracking-wide mb-2">
          Decisions Made
        </div>
        <div className="font-mono text-4xl font-bold text-text">
          {data.decisions.length}
        </div>
        <div className="text-text-muted text-xs font-mono mt-3">
          Extracted from transcript
        </div>
      </motion.div>

      {/* Sentiment */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card-glow bg-bg-card rounded-xl p-6 flex flex-col justify-between"
      >
        <div className="text-text-dim text-xs font-mono uppercase tracking-wide mb-2">
          Overall Sentiment
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{sentimentEmoji[data.sentiment_analysis.overall] || "😐"}</span>
          <div>
            <div className="font-display font-bold text-lg capitalize" style={{ color: sentColor }}>
              {data.sentiment_analysis.overall}
            </div>
            <div className="font-mono text-xs text-text-muted">
              Score: {data.sentiment_analysis.score}/100
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
