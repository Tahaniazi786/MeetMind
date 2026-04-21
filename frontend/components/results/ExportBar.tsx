"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MeetingAnalysis } from "@/context/MeetingContext";

interface Props {
  analysis: MeetingAnalysis;
}

/**
 * Build a premium styled HTML report and open it for printing (Save as PDF).
 * Zero external dependencies — uses window.print() which produces a real PDF.
 */
function generateClientPdf(analysis: MeetingAnalysis) {
  const priorityColor = (p: string) =>
    p === "high" ? "#EF4444" : p === "medium" ? "#F5A623" : "#22C55E";

  const sentimentColor = (s: string) =>
    s === "positive" ? "#22C55E" : s === "tense" ? "#EF4444" : "#F5A623";

  const healthColor = (score: number) =>
    score >= 80 ? "#22C55E" : score >= 60 ? "#F5A623" : "#EF4444";

  const archetypeColors: Record<string, string> = {
    decision: "#EF4444", status_update: "#F5A623", brainstorm: "#22C55E",
    crisis: "#3B82F6", sync: "#9CA3AF",
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MeetMind Intelligence Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Mono', monospace;
      background: #0D0F12;
      color: #F0EDE8;
      padding: 40px;
      font-size: 11px;
      line-height: 1.6;
    }
    h1, h2, h3 { font-family: 'Syne', sans-serif; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #F5A623;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; }
    .logo span { color: #F5A623; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 8px;
      border: 1px solid;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 12px;
    }
    .meta { color: #8A8F98; font-size: 10px; margin-top: 6px; }
    .section { margin-bottom: 28px; }
    .section-title {
      font-family: 'Syne', sans-serif;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #23282F;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #14171C;
      border: 1px solid #23282F;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { color: #8A8F98; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .conflict-banner {
      background: rgba(245,166,35,0.08);
      border: 1px solid rgba(245,166,35,0.3);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 11px;
    }
    .conflict-banner strong { color: #F5A623; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th {
      text-align: left;
      padding: 8px 12px;
      color: #8A8F98;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #23282F;
    }
    td { padding: 10px 12px; border-bottom: 1px solid #1A1D22; }
    .priority-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      color: #0D0F12;
      font-size: 10px;
      font-weight: 700;
    }
    .decision-card {
      background: #14171C;
      border-left: 3px solid #F5A623;
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      margin-bottom: 8px;
    }
    .decision-card h4 { font-family: 'Syne', sans-serif; font-size: 12px; margin-bottom: 4px; }
    .decision-card .by { color: #F5A623; font-size: 10px; }
    .decision-card .ctx { color: #8A8F98; font-size: 10px; margin-top: 4px; }
    .sentiment-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .sentiment-name { width: 80px; font-size: 11px; }
    .sentiment-bar-bg { flex: 1; height: 8px; background: #1A1D22; border-radius: 4px; overflow: hidden; }
    .sentiment-bar { height: 100%; border-radius: 4px; }
    .sentiment-pct { width: 40px; text-align: right; font-size: 10px; }
    .topics { display: flex; flex-wrap: wrap; gap: 8px; }
    .topic-tag { padding: 4px 12px; background: #14171C; border: 1px solid #23282F; border-radius: 16px; font-size: 10px; }
    .email-box {
      background: #14171C;
      border: 1px solid #23282F;
      border-radius: 8px;
      padding: 16px;
      white-space: pre-wrap;
      font-size: 10px;
      line-height: 1.7;
    }
    .health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .health-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
    .health-bar-bg { width: 60px; height: 6px; background: #1A1D22; border-radius: 3px; overflow: hidden; margin-left: 8px; }
    .health-bar { height: 100%; background: #F5A623; border-radius: 3px; }
    .health-explain { color: #5A5F68; font-size: 9px; font-style: italic; margin-top: 2px; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #23282F;
      text-align: center;
      color: #5A5F68;
      font-size: 9px;
    }
    @media print {
      body { padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="logo">Meet<span>Mind</span> Intelligence Report</div>
      <div class="meta">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · ${analysis.action_items.length} action items · ${analysis.decisions.length} decisions</div>
    </div>
    ${analysis.meeting_archetype ? `<div class="badge" style="color: ${archetypeColors[analysis.meeting_archetype.type] || "#9CA3AF"}; border-color: ${archetypeColors[analysis.meeting_archetype.type] || "#9CA3AF"}40">
      ${analysis.meeting_archetype.emoji} ${analysis.meeting_archetype.label}
    </div>` : ""}
  </div>

  <!-- Conflict Banner -->
  ${analysis.conflict_detection?.has_conflict ? analysis.conflict_detection.conflicts.map(c => `
  <div class="conflict-banner">
    ⚠️ <strong>Potential friction detected</strong> between <strong>${c.speaker_a}</strong> and <strong>${c.speaker_b}</strong> around the topic of <strong>${c.topic}</strong>. Consider a 1:1 follow-up.
    ${c.description ? `<br><span style="color:#8A8F98">${c.description}</span>` : ""}
  </div>`).join("") : ""}

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value" style="color: ${healthColor(analysis.meeting_health_score)}">${analysis.meeting_health_score}</div>
      <div class="stat-label">Health Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: #F5A623">${analysis.action_items.length}</div>
      <div class="stat-label">Action Items</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analysis.decisions.length}</div>
      <div class="stat-label">Decisions Made</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: ${sentimentColor(analysis.sentiment_analysis.overall)}">${analysis.sentiment_analysis.overall}</div>
      <div class="stat-label">Overall Sentiment (${analysis.sentiment_analysis.score}/100)</div>
    </div>
  </div>

  <!-- Health Breakdown -->
  <div class="section">
    <div class="section-title">📊 Health Score Breakdown</div>
    <div class="health-grid">
      ${[
        { label: "Clarity", key: "clarity", val: analysis.health_breakdown.clarity, max: 25 },
        { label: "Decisions", key: "decisions_made", val: analysis.health_breakdown.decisions_made, max: 25 },
        { label: "Participation", key: "participation", val: analysis.health_breakdown.participation, max: 25 },
        { label: "Actionability", key: "actionability", val: analysis.health_breakdown.actionability, max: 25 },
      ].map(item => `
        <div>
          <div class="health-item">
            <span>${item.label}: ${item.val}/${item.max}</span>
            <div class="health-bar-bg"><div class="health-bar" style="width:${(item.val/item.max)*100}%"></div></div>
          </div>
          ${analysis.health_explanations?.[item.key as keyof typeof analysis.health_explanations] ? `<div class="health-explain">${analysis.health_explanations[item.key as keyof typeof analysis.health_explanations]}</div>` : ""}
        </div>
      `).join("")}
    </div>
  </div>

  <!-- Summary -->
  <div class="section">
    <div class="section-title">📝 Executive Summary</div>
    <p>${analysis.executive_summary}</p>
  </div>

  <!-- Action Items -->
  <div class="section">
    <div class="section-title">✅ Action Items (${analysis.action_items.length})</div>
    <table>
      <thead><tr><th>Task</th><th>Owner</th><th>Deadline</th><th>Priority</th></tr></thead>
      <tbody>
        ${analysis.action_items.map(item => `
        <tr>
          <td>${item.task}</td>
          <td style="color:#F5A623">${item.owner}</td>
          <td>${item.deadline}</td>
          <td><span class="priority-badge" style="background:${priorityColor(item.priority)}">${item.priority}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>

  <!-- Decisions -->
  <div class="section">
    <div class="section-title">⚖️ Decision Log (${analysis.decisions.length})</div>
    ${analysis.decisions.map(d => `
    <div class="decision-card">
      <h4>${d.decision}</h4>
      <div class="by">Made by: ${d.made_by}</div>
      <div class="ctx">${d.context}</div>
    </div>`).join("")}
  </div>

  <!-- Sentiment -->
  <div class="section">
    <div class="section-title">🎭 Sentiment Analysis</div>
    ${analysis.sentiment_analysis.breakdown.map(s => `
    <div class="sentiment-row">
      <span class="sentiment-name">${s.speaker}</span>
      <div class="sentiment-bar-bg">
        <div class="sentiment-bar" style="width:${Math.round(s.confidence*100)}%; background:${sentimentColor(s.sentiment)}"></div>
      </div>
      <span class="sentiment-pct">${Math.round(s.confidence*100)}%</span>
    </div>`).join("")}
  </div>

  <!-- Topics -->
  <div class="section">
    <div class="section-title">🏷️ Key Topics</div>
    <div class="topics">
      ${analysis.key_topics.map(t => `<span class="topic-tag">${t}</span>`).join("")}
    </div>
  </div>

  <!-- Email Draft -->
  <div class="section">
    <div class="section-title">📧 Follow-up Email Draft</div>
    <div class="email-box">${analysis.follow_up_email}</div>
  </div>

  <div class="footer">
    Generated by MeetMind AI · ${new Date().toISOString().slice(0, 10)} · meetmind.ai
  </div>

  <div class="no-print" style="text-align:center; margin-top:24px">
    <button onclick="window.print()" style="font-family:Syne,sans-serif; font-size:16px; font-weight:700; padding:14px 40px; background:#F5A623; color:#0D0F12; border:none; border-radius:10px; cursor:pointer;">
      ⬇ Save as PDF (Ctrl+P → Save as PDF)
    </button>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Auto-trigger print after fonts load
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };
  }
}

export default function ExportBar({ analysis }: Props) {
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleExportPdf = () => {
    setExporting(true);
    try {
      generateClientPdf(analysis);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-md border-t border-bg-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-text-muted text-xs font-mono">
          MeetMind Report · {new Date().toLocaleDateString()}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 text-sm font-display font-bold rounded-lg border transition-all ${
              saved
                ? "bg-status-low/15 text-status-low border-status-low/30"
                : "bg-bg border-bg-border text-text hover:border-accent/30 hover:text-accent"
            }`}
          >
            {saved ? "✓ Saved" : "Save to History"}
          </button>

          <button
            id="btn-export-pdf"
            onClick={handleExportPdf}
            disabled={exporting}
            className="px-6 py-2.5 text-sm font-display font-bold rounded-lg bg-accent text-bg hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
          >
            {exporting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                Generating…
              </span>
            ) : (
              "Export PDF Report"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
