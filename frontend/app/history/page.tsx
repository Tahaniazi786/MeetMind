"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMeeting } from "@/lib/MeetingContext";
import { useRouter } from "next/navigation";

interface HistoryItem {
  id: string;
  date: string;
  tldr: string;
  health: number;
  analysisData?: any; // The full analysis object if we want to view it
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { setAnalysis } = useMeeting();
  const router = useRouter();

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("meetmind_history") || "[]");
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDelete = (id: string) => {
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem("meetmind_history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("meetmind_history");
  };

  const openReport = (item: HistoryItem) => {
    if (item.analysisData) {
      setAnalysis(item.analysisData);
      router.push("/results");
    } else {
      alert("This item was saved in an older version and does not contain full analysis data.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Navigation ── */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto border-b border-bg-border/30">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg font-bold text-sm">
            M
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Meet<span className="text-accent">Mind</span>
          </span>
        </Link>
        <div className="flex gap-4">
          <Link href="/analyze" className="text-sm font-bold text-text hover:text-accent transition-colors">
            New Analysis
          </Link>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-3xl"
          >
            Meeting History
          </motion.h1>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-xs font-mono font-bold text-status-low border border-status-low/30 rounded-lg hover:bg-status-low/10 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-bg-card border border-dashed border-bg-border rounded-xl"
          >
            <div className="text-4xl mb-4">📭</div>
            <p className="text-text-muted font-display text-lg mb-6">Your history is empty.</p>
            <Link
              href="/analyze"
              className="px-6 py-3 bg-accent text-bg font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Analyze a Meeting →
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-bg-card border border-bg-border rounded-xl p-6 hover:border-accent/40 transition-colors cursor-pointer"
                onClick={() => openReport(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-text-muted">
                        {new Date(item.date).toLocaleString()}
                      </span>
                      {item.health && (
                        <span className="font-mono text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold">
                          Health: {item.health}/100
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-dim leading-relaxed line-clamp-2">
                      {item.tldr || "No summary available."}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-status-low hover:bg-status-low/10 rounded-lg transition-all absolute right-4 top-4"
                    title="Delete record"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
