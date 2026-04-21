"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  score: number;
  size?: number;
}

export default function HealthGauge({ score, size = 160 }: Props) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#22C55E" : score >= 60 ? "#F5A623" : score >= 40 ? "#F97316" : "#EF4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#23282F"
          strokeWidth="8"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CounterDisplay to={score} color={color} />
        <span className="text-text-dim text-xs font-mono mt-1">/100</span>
      </div>
    </div>
  );
}

function CounterDisplay({ to, color }: { to: number; color: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf: number;
    const duration = 1500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);

  return (
    <motion.span
      className="font-mono text-3xl font-bold"
      style={{ color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {count}
    </motion.span>
  );
}
