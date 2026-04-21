"use client";

import { motion } from "framer-motion";
import type { MeetingArchetype } from "@/context/MeetingContext";

interface Props {
  archetype: MeetingArchetype;
}

const archetypeStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  decision:      { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.3)",  text: "#EF4444", glow: "rgba(239,68,68,0.15)" },
  status_update: { bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.3)", text: "#F5A623", glow: "rgba(245,166,35,0.15)" },
  brainstorm:    { bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.3)",  text: "#22C55E", glow: "rgba(34,197,94,0.15)" },
  crisis:        { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", text: "#3B82F6", glow: "rgba(59,130,246,0.15)" },
  sync:          { bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.3)", text: "#9CA3AF", glow: "rgba(156,163,175,0.15)" },
};

export default function ArchetypeBadge({ archetype }: Props) {
  const style = archetypeStyles[archetype.type] || archetypeStyles.sync;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border"
      style={{
        background: style.bg,
        borderColor: style.border,
        boxShadow: `0 0 20px ${style.glow}`,
      }}
    >
      <motion.span
        className="text-xl"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      >
        {archetype.emoji}
      </motion.span>
      <div>
        <div className="font-display font-bold text-sm" style={{ color: style.text }}>
          {archetype.label}
        </div>
        {archetype.description && (
          <div className="text-text-muted text-[11px] font-mono mt-0.5">
            {archetype.description}
          </div>
        )}
      </div>
    </motion.div>
  );
}
