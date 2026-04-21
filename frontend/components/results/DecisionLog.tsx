"use client";

import { motion } from "framer-motion";
import type { Decision } from "@/context/MeetingContext";

interface Props {
  decisions: Decision[];
}

const borderColors = ["border-l-accent", "border-l-status-low", "border-l-status-mixed", "border-l-status-medium"];

export default function DecisionLog({ decisions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-display font-bold text-lg mb-4">
        🏛️ Decision Log
        <span className="ml-2 text-text-muted font-mono text-sm font-normal">({decisions.length})</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decisions.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`card-glow bg-bg-card rounded-xl p-5 border-l-4 ${borderColors[i % borderColors.length]}`}
          >
            <h3 className="font-display font-bold text-sm mb-2 text-text">{d.decision}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide">Made by</span>
              <span className="font-mono text-xs text-accent">{d.made_by}</span>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">{d.context}</p>
          </motion.div>
        ))}
      </div>

      {decisions.length === 0 && (
        <div className="bg-bg-card rounded-xl border border-bg-border p-8 text-center text-text-dim font-mono text-sm">
          No decisions detected.
        </div>
      )}
    </motion.div>
  );
}
