"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useMeeting } from "@/context/MeetingContext";
import { useRouter } from "next/navigation";
import {
  fetchMeetingsFromDb,
  deleteMeetingFromDb,
  clearAllMeetingsFromDb,
  fetchMeetingStats,
  SavedMeetingRecord,
  MeetingStats,
} from "@/lib/api";

const ARCHETYPES = [
  { id: "all", label: "All Meetings", emoji: "📁" },
  { id: "decision", label: "Decision", emoji: "🎯" },
  { id: "crisis", label: "Crisis", emoji: "🚨" },
  { id: "sync", label: "Sync", emoji: "🔄" },
  { id: "brainstorm", label: "Brainstorm", emoji: "💡" },
  { id: "status_update", label: "Status Update", emoji: "📋" },
];

export default function HistoryPage() {
  const [meetings, setMeetings] = useState<SavedMeetingRecord[]>([]);
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { setAnalysis } = useMeeting();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [selectedArchetype]);

  async function loadData() {
    setLoading(true);
    try {
      const [fetchedMeetings, fetchedStats] = await Promise.all([
        fetchMeetingsFromDb({ archetype: selectedArchetype }),
        fetchMeetingStats(),
      ]);
      setMeetings(fetchedMeetings);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to load meetings data:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const q = searchQuery.toLowerCase().trim();
    return meetings.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.tldr?.toLowerCase().includes(q) ||
        m.archetype?.label?.toLowerCase().includes(q) ||
        (Array.isArray(m.analysis?.key_topics) &&
          m.analysis.key_topics.some((t: string) => t.toLowerCase().includes(q)))
    );
  }, [meetings, searchQuery]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this meeting intelligence record?")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteMeetingFromDb(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      loadData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Delete ALL saved meeting records from database? This cannot be undone.")) {
      return;
    }
    try {
      await clearAllMeetingsFromDb();
      setMeetings([]);
      setStats({
        total_meetings: 0,
        average_health_score: 0,
        total_action_items: 0,
        completed_action_items: 0,
        top_archetype: null,
      });
    } catch (err) {
      console.error("Clear all failed:", err);
    }
  };

  const openReport = (item: SavedMeetingRecord) => {
    if (item.analysis) {
      setAnalysis(item.analysis as any);
      router.push("/results");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/30 selection:text-accent">
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto border-b border-bg-border/40 backdrop-blur-md sticky top-0 z-30 bg-bg/85">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-bg font-display font-black text-base shadow-lg shadow-accent/20">
            M
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Meet<span className="text-accent">Mind</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/analyze"
            className="px-4 py-2 text-xs font-mono font-bold bg-accent text-bg rounded-lg hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-1.5"
          >
            <span>+</span> New Analysis
          </Link>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-extrabold text-3xl tracking-tight mb-2 flex items-center gap-3"
            >
              <span>Meeting Intelligence Database</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent font-mono font-bold border border-accent/30">
                SQLite Synced
              </span>
            </motion.h1>
            <p className="text-text-muted text-sm">
              Search, review, and rehydrate past meeting summaries, action items, and health scores.
            </p>
          </div>

          {meetings.length > 0 && (
            <button
              onClick={handleClearAll}
              className="self-start md:self-auto px-3.5 py-2 text-xs font-mono font-bold text-status-high/80 hover:text-status-high border border-status-high/30 hover:border-status-high/60 rounded-lg hover:bg-status-high/10 transition-all"
            >
              🗑️ Clear Database
            </button>
          )}
        </div>

        {/* ── Aggregate Analytics Stats Banner ── */}
        {stats && stats.total_meetings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-bg-card border border-bg-border rounded-xl p-4 flex flex-col">
              <span className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1">Total Meetings</span>
              <span className="text-2xl font-display font-extrabold text-text">{stats.total_meetings}</span>
            </div>

            <div className="bg-bg-card border border-bg-border rounded-xl p-4 flex flex-col">
              <span className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1">Avg Health Score</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-display font-extrabold ${stats.average_health_score >= 80 ? "text-status-low" : stats.average_health_score >= 60 ? "text-accent" : "text-status-high"}`}>
                  {stats.average_health_score}
                </span>
                <span className="text-text-muted text-xs font-mono">/ 100</span>
              </div>
            </div>

            <div className="bg-bg-card border border-bg-border rounded-xl p-4 flex flex-col">
              <span className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1">Action Items</span>
              <span className="text-2xl font-display font-extrabold text-accent">
                {stats.total_action_items}
              </span>
            </div>

            <div className="bg-bg-card border border-bg-border rounded-xl p-4 flex flex-col">
              <span className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1">Top Archetype</span>
              <span className="text-sm font-display font-bold text-text truncate flex items-center gap-1.5">
                <span>{stats.top_archetype?.emoji || "🔄"}</span>
                <span>{stats.top_archetype?.label || "Sync Meeting"}</span>
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search meetings by topic, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-bg-border rounded-xl text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
              >
                ✕
              </button>
            )}
          </div>

          {/* Archetype Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                onClick={() => setSelectedArchetype(arch.id)}
                className={`px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedArchetype === arch.id
                    ? "bg-accent text-bg shadow-md shadow-accent/20"
                    : "bg-bg-card border border-bg-border text-text-muted hover:text-text hover:border-bg-border/80"
                }`}
              >
                <span>{arch.emoji}</span>
                <span>{arch.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Meeting Cards List ── */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-xs text-text-muted">Loading meeting records from SQLite database...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-bg-card border border-dashed border-bg-border rounded-2xl p-8"
          >
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-display font-bold text-lg mb-2">No meeting records found</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
              {searchQuery
                ? `No meetings matching "${searchQuery}". Try a different search query or filter.`
                : "Analyze your first meeting transcript or upload audio to populate your database."}
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-display font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all"
            >
              <span>🎙️ Analyze a Meeting</span>
              <span>→</span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredMeetings.map((item, i) => {
              const actionCount = Array.isArray(item.analysis?.action_items)
                ? item.analysis.action_items.length
                : 0;
              const decisionCount = Array.isArray(item.analysis?.decisions)
                ? item.analysis.decisions.length
                : 0;
              const healthScore = item.health_score || (item.analysis?.meeting_health_score as number) || 50;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openReport(item)}
                  className="group relative bg-bg-card border border-bg-border hover:border-accent/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-accent/5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left Details */}
                    <div className="flex-1 pr-0 md:pr-6">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-3">
                        {/* Archetype Badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg border border-bg-border text-xs font-mono font-bold text-text">
                          <span>{item.archetype?.emoji || "🔄"}</span>
                          <span>{item.archetype?.label || "Sync Meeting"}</span>
                        </span>

                        {/* Health Score Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                            healthScore >= 80
                              ? "bg-status-low/15 text-status-low border border-status-low/30"
                              : healthScore >= 60
                              ? "bg-accent/15 text-accent border border-accent/30"
                              : "bg-status-high/15 text-status-high border border-status-high/30"
                          }`}
                        >
                          <span>Health: {healthScore}/100</span>
                        </span>

                        {/* Date */}
                        <span className="text-text-muted text-xs font-mono">
                          {new Date(item.created_at || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-lg text-text group-hover:text-accent transition-colors mb-2">
                        {item.title || "Meeting Intelligence Report"}
                      </h3>

                      {/* TLDR Summary */}
                      <p className="text-text-muted text-sm leading-relaxed line-clamp-2 mb-4">
                        {item.tldr || (item.analysis?.tldr as string) || "Meeting discussion and decisions captured."}
                      </p>

                      {/* Key Meta Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted">
                        {actionCount > 0 && (
                          <span className="flex items-center gap-1 text-accent">
                            <span>✅</span>
                            <span>{actionCount} action item{actionCount !== 1 ? "s" : ""}</span>
                          </span>
                        )}
                        {decisionCount > 0 && (
                          <span className="flex items-center gap-1 text-text">
                            <span>⚖️</span>
                            <span>{decisionCount} decision{decisionCount !== 1 ? "s" : ""}</span>
                          </span>
                        )}
                        {item.speakers_detected > 0 && (
                          <span className="flex items-center gap-1">
                            <span>👥</span>
                            <span>{item.speakers_detected} speaker{item.speakers_detected !== 1 ? "s" : ""}</span>
                          </span>
                        )}
                        {item.duration > 0 && (
                          <span className="flex items-center gap-1">
                            <span>⏱️</span>
                            <span>{Math.round(item.duration / 60)} min</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center md:flex-col gap-2 justify-end self-end md:self-center">
                      <span className="px-4 py-2 text-xs font-mono font-bold bg-accent/10 text-accent group-hover:bg-accent group-hover:text-bg rounded-xl transition-all flex items-center gap-1 whitespace-nowrap">
                        View Report →
                      </span>

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                        className="p-2 text-text-muted hover:text-status-high hover:bg-status-high/10 rounded-lg transition-all"
                        title="Delete meeting"
                      >
                        {deletingId === item.id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
