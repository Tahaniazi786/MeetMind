"use client";

import { motion } from "framer-motion";

interface Props {
  topics: string[];
}

export default function WordCloud({ topics }: Props) {
  // Generate varying sizes — first topics are most relevant
  const maxSize = 28;
  const minSize = 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-bg-card rounded-xl border border-bg-border p-6"
    >
      <h2 className="font-display font-bold text-lg mb-6">🏷️ Key Topics</h2>

      <div className="flex flex-wrap gap-3 justify-center py-4">
        {topics.map((topic, i) => {
          const size = maxSize - ((maxSize - minSize) / topics.length) * i;
          const isAccent = i % 3 === 0;
          const opacity = 1 - (i / topics.length) * 0.5;

          return (
            <motion.span
              key={topic}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.15, opacity: 1 }}
              className="cursor-default transition-colors font-display font-bold"
              style={{
                fontSize: `${size}px`,
                color: isAccent ? "#F5A623" : "#F0EDE8",
              }}
            >
              {topic}
            </motion.span>
          );
        })}
      </div>

      {topics.length === 0 && (
        <div className="text-center text-text-dim font-mono text-sm py-4">
          No topics extracted.
        </div>
      )}
    </motion.div>
  );
}
