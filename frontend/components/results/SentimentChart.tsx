"use client";

import { motion } from "framer-motion";
import type { SentimentAnalysis } from "@/context/MeetingContext";

interface Props {
  sentiment: SentimentAnalysis;
}

const sentimentColors: Record<string, string> = {
  positive: "#22C55E",
  neutral: "#F5A623",
  tense: "#EF4444",
  mixed: "#A855F7",
  conflict: "#EF4444",
};

export default function SentimentChart({ sentiment }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-bg-card rounded-xl border border-bg-border p-6"
    >
      <h2 className="font-display font-bold text-lg mb-6">🎭 Sentiment Analysis</h2>

      <div className="space-y-4">
        {sentiment.breakdown.map((speaker, i) => {
          const color = sentimentColors[speaker.sentiment] || "#F5A623";
          const pct = Math.round(speaker.confidence * 100);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-center gap-4"
            >
              {/* Speaker name */}
              <div className="w-28 shrink-0">
                <span className="font-mono text-sm text-text truncate block">{speaker.speaker}</span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-6 bg-bg rounded-md overflow-hidden relative">
                <motion.div
                  className="h-full rounded-md"
                  style={{ backgroundColor: color }}
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Label inside bar */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span
                    className="font-mono text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: pct > 30 ? "#0D0F12" : color }}
                  >
                    {speaker.sentiment}
                  </span>
                </div>
              </div>

              {/* Percentage */}
              <div className="w-14 text-right">
                <span className="font-mono text-sm font-bold" style={{ color }}>
                  {pct}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {sentiment.breakdown.length === 0 && (
        <div className="text-center text-text-dim font-mono text-sm py-4">
          No per-speaker data available.
        </div>
      )}
    </motion.div>
  );
}
