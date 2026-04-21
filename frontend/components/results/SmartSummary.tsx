"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  tldr: string;
  executive: string;
  detailed: string;
}

const tabs = ["TL;DR", "Executive", "Detailed"] as const;

export default function SmartSummary({ tldr, executive, detailed }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const content = [tldr, executive, detailed];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-bg-card rounded-xl border border-bg-border overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        <h2 className="font-display font-bold text-lg">📋 Smart Summary</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-mono font-medium rounded-lg transition-all ${
              activeTab === i
                ? "bg-accent/15 text-accent"
                : "text-text-muted hover:text-text hover:bg-bg-hover"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content with typewriter */}
      <div className="px-6 py-5 min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <TypewriterText text={content[activeTab]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const iRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    iRef.current = 0;

    // Fast typewriter — 8ms per char
    const interval = setInterval(() => {
      if (iRef.current < text.length) {
        // Add chars in chunks for speed
        const chunk = text.slice(iRef.current, iRef.current + 3);
        setDisplayed((prev) => prev + chunk);
        iRef.current += 3;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 8);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className={`text-text text-sm leading-relaxed font-display ${!done ? "typewriter-cursor" : ""}`}>
      {displayed}
    </p>
  );
}
