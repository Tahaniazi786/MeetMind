"use client";

import { motion } from "framer-motion";
import type { ConflictDetection } from "@/context/MeetingContext";

interface Props {
  conflicts: ConflictDetection;
}

export default function ConflictDetector({ conflicts }: Props) {
  if (!conflicts.has_conflict || conflicts.conflicts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      {conflicts.conflicts.map((conflict, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
          className="flex items-start gap-4 p-4 bg-status-medium/8 border border-status-medium/25 rounded-xl mb-3"
          style={{ background: "rgba(245,166,35,0.06)" }}
        >
          {/* Pulse icon */}
          <div className="shrink-0 mt-0.5">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-status-medium/15 flex items-center justify-center text-base"
            >
              ⚠️
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm text-status-medium mb-1">
              Potential friction detected
            </div>
            <p className="text-text text-sm leading-relaxed">
              Tension detected between{" "}
              <span className="font-mono font-bold text-accent">{conflict.speaker_a}</span>
              {" "}and{" "}
              <span className="font-mono font-bold text-accent">{conflict.speaker_b}</span>
              {" "}around the topic of{" "}
              <span className="font-mono font-bold text-text">{conflict.topic}</span>.
              {" "}Consider a 1:1 follow-up.
            </p>
            {conflict.description && (
              <p className="text-text-muted text-xs mt-1.5 font-mono">
                {conflict.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
