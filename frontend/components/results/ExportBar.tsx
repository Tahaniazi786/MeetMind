"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MeetingAnalysis } from "@/context/MeetingContext";

interface Props {
  analysis: MeetingAnalysis;
}

/**
 * Generate a professional PRINT-FRIENDLY PDF report.
 * White background + dark text = perfect for printing.
 */
function generateClientPdf(analysis: MeetingAnalysis) {
  const priorityColor = (p: string) =>
    p === "high" ? "#DC2626" : p === "medium" ? "#D97706" : "#16A34A";

  const sentimentColor = (s: string) =>
    s === "positive" ? "#16A34A" : s === "tense" ? "#DC2626" : "#D97706";

  const healthPct = (val: number, max: number) => Math.round((val / max) * 100);

  const archetypeColors: Record<string, string> = {
    decision: "#DC2626", status_update: "#D97706", brainstorm: "#16A34A",
    crisis: "#2563EB", sync: "#6B7280",
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MeetMind Intelligence Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ffffff;
      color: #000000;
      font-size: 12px;
      line-height: 1.6;
      padding: 0;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 48px;
    }

    /* ── HEADER ─────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 3px solid #E65100;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #E65100;
      letter-spacing: -0.5px;
    }
    .header-meta {
      color: #000000;
      font-size: 11px;
      font-weight: 600;
      margin-top: 4px;
      line-height: 1.5;
    }
    .archetype-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      color: white;
      white-space: nowrap;
    }

    /* ── CONFLICT BANNER ────────────────────── */
    .conflict-banner {
      background: #FFF3E0;
      border: 2px solid #E65100;
      border-left: 5px solid #E65100;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 20px;
      font-size: 12px;
      color: #000000;
    }
    .conflict-banner strong { color: #C62828; font-weight: 800; }

    /* ── STATS GRID ─────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #F5F5F5;
      border: 2px solid #333333;
      border-radius: 8px;
      padding: 16px 18px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.2;
    }
    .stat-label {
      color: #000000;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 4px;
      font-weight: 700;
    }

    /* ── SECTION ─────────────────────────────── */
    .section {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 3px solid #E65100;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── HEALTH GRID ─────────────────────────── */
    .health-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .health-item {
      background: #F5F5F5;
      border: 1px solid #AAAAAA;
      border-radius: 6px;
      padding: 12px 14px;
    }
    .health-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .health-name { font-weight: 700; font-size: 12px; color: #000000; }
    .health-score { font-weight: 800; font-size: 12px; color: #E65100; }
    .health-bar-bg {
      width: 100%;
      height: 8px;
      background: #D0D0D0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .health-bar {
      height: 100%;
      background: #E65100;
      border-radius: 4px;
    }
    .health-explain {
      color: #000000;
      font-size: 10px;
      font-style: italic;
      line-height: 1.4;
    }

    /* ── SUMMARY ──────────────────────────────── */
    .summary-text {
      background: #F5F5F5;
      border: 1px solid #AAAAAA;
      border-radius: 8px;
      padding: 16px 18px;
      font-size: 12px;
      line-height: 1.7;
      color: #000000;
    }

    /* ── TABLE ────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 10px;
    }
    th {
      text-align: left;
      padding: 10px 12px;
      background: #E8E8E8;
      color: #000000;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #999999;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #CCCCCC;
      vertical-align: top;
      color: #000000;
      font-size: 11px;
    }
    tr:nth-child(even) { background: #F5F5F5; }
    .task-text { font-weight: 500; }
    .priority-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      color: white;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .owner { color: #C62828; font-weight: 700; }

    /* ── DECISIONS ────────────────────────────── */
    .decision-card {
      background: #F5F5F5;
      border-left: 4px solid #1565C0;
      border-radius: 0 6px 6px 0;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-top: 1px solid #D0D0D0;
      border-right: 1px solid #D0D0D0;
      border-bottom: 1px solid #D0D0D0;
    }
    .decision-title { font-weight: 700; font-size: 12px; color: #000000; margin-bottom: 3px; }
    .decision-by { color: #C62828; font-size: 11px; font-weight: 700; }
    .decision-ctx { color: #333333; font-size: 11px; margin-top: 3px; }

    /* ── SENTIMENT ────────────────────────────── */
    .sentiment-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .sentiment-name { width: 80px; font-size: 12px; font-weight: 700; color: #000000; }
    .sentiment-bar-bg {
      flex: 1;
      height: 14px;
      background: #DDDDDD;
      border-radius: 7px;
      overflow: hidden;
    }
    .sentiment-bar { height: 100%; border-radius: 7px; }
    .sentiment-label { width: 70px; text-align: right; font-size: 11px; color: #000000; font-weight: 600; text-transform: capitalize; }
    .sentiment-pct { width: 35px; text-align: right; font-size: 11px; font-weight: 700; color: #000000; }

    /* ── TOPICS ───────────────────────────────── */
    .topics { display: flex; flex-wrap: wrap; gap: 8px; }
    .topic-tag {
      padding: 5px 14px;
      background: #E8EAF6;
      border: 1px solid #5C6BC0;
      border-radius: 14px;
      font-size: 11px;
      color: #1A237E;
      font-weight: 600;
    }

    /* ── EMAIL ────────────────────────────────── */
    .email-box {
      background: #FAFAFA;
      border: 2px solid #1B2A4A;
      border-radius: 8px;
      padding: 18px;
      white-space: pre-wrap;
      font-size: 11px;
      line-height: 1.7;
      color: #000000;
    }

    /* ── FOOTER ───────────────────────────────── */
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 2px solid #999999;
      text-align: center;
      color: #333333;
      font-size: 10px;
      font-weight: 500;
    }

    /* ── PRINT ────────────────────────────────── */
    @media print {
      body { padding: 0; }
      .page { padding: 24px 32px; }
      .no-print { display: none !important; }
      .section { page-break-inside: avoid; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="logo">MeetMind Intelligence Report</div>
      <div class="header-meta">
        ${dateStr}<br>
        ${analysis.action_items.length} action items · ${analysis.decisions.length} decisions · Health: ${analysis.meeting_health_score}/100
      </div>
    </div>
    ${analysis.meeting_archetype ? `
    <div class="archetype-badge" style="background:${archetypeColors[analysis.meeting_archetype.type] || "#6B7280"}">
      ${analysis.meeting_archetype.emoji} ${analysis.meeting_archetype.label}
    </div>` : ""}
  </div>

  <!-- CONFLICT BANNER -->
  ${analysis.conflict_detection?.has_conflict ? analysis.conflict_detection.conflicts.map(c => `
  <div class="conflict-banner">
    ⚠️ <strong>Potential friction detected</strong> between <strong>${c.speaker_a}</strong> and <strong>${c.speaker_b}</strong> around <strong>${c.topic}</strong>.
    ${c.description ? `<br>${c.description}` : ""}
  </div>`).join("") : ""}

  <!-- STATS -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value" style="color:${analysis.meeting_health_score >= 80 ? "#16A34A" : analysis.meeting_health_score >= 60 ? "#D97706" : "#DC2626"}">${analysis.meeting_health_score}</div>
      <div class="stat-label">Health Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#D97706">${analysis.action_items.length}</div>
      <div class="stat-label">Action Items</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#000000">${analysis.decisions.length}</div>
      <div class="stat-label">Decisions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:${sentimentColor(analysis.sentiment_analysis.overall)}; text-transform:capitalize; font-size:18px">${analysis.sentiment_analysis.overall}</div>
      <div class="stat-label">Sentiment (${analysis.sentiment_analysis.score}/100)</div>
    </div>
  </div>

  <!-- HEALTH BREAKDOWN -->
  <div class="section">
    <div class="section-title">📊 Health Score Breakdown</div>
    <div class="health-grid">
      ${[
        { label: "Clarity", key: "clarity" },
        { label: "Decisions", key: "decisions_made" },
        { label: "Participation", key: "participation" },
        { label: "Actionability", key: "actionability" },
      ].map(item => {
        const val = (analysis.health_breakdown as Record<string, number>)[item.key] || 0;
        const explain = analysis.health_explanations ? (analysis.health_explanations as Record<string, string>)[item.key] || "" : "";
        return `
        <div class="health-item">
          <div class="health-top">
            <span class="health-name">${item.label}</span>
            <span class="health-score">${val}/25</span>
          </div>
          <div class="health-bar-bg"><div class="health-bar" style="width:${healthPct(val, 25)}%"></div></div>
          ${explain ? `<div class="health-explain">${explain}</div>` : ""}
        </div>`;
      }).join("")}
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div class="section">
    <div class="section-title">📝 Executive Summary</div>
    <div class="summary-text">${analysis.executive_summary}</div>
  </div>

  <!-- ACTION ITEMS -->
  <div class="section">
    <div class="section-title">✅ Action Items (${analysis.action_items.length})</div>
    <table>
      <thead><tr><th style="width:50%">Task</th><th>Owner</th><th>Deadline</th><th>Priority</th></tr></thead>
      <tbody>
        ${analysis.action_items.map(item => `
        <tr>
          <td>${item.task}</td>
          <td class="owner">${item.owner}</td>
          <td>${item.deadline}</td>
          <td><span class="priority-badge" style="background:${priorityColor(item.priority)}">${item.priority}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>

  <!-- DECISIONS -->
  <div class="section">
    <div class="section-title">⚖️ Decision Log (${analysis.decisions.length})</div>
    ${analysis.decisions.map(d => `
    <div class="decision-card">
      <div class="decision-title">${d.decision}</div>
      <div class="decision-by">Made by: ${d.made_by}</div>
      <div class="decision-ctx">${d.context}</div>
    </div>`).join("")}
  </div>

  <!-- SENTIMENT -->
  <div class="section">
    <div class="section-title">🎭 Sentiment Analysis</div>
    ${analysis.sentiment_analysis.breakdown.map(s => `
    <div class="sentiment-row">
      <span class="sentiment-name">${s.speaker}</span>
      <div class="sentiment-bar-bg">
        <div class="sentiment-bar" style="width:${Math.round(s.confidence * 100)}%;background:${sentimentColor(s.sentiment)}"></div>
      </div>
      <span class="sentiment-label" style="color:${sentimentColor(s.sentiment)}">${s.sentiment}</span>
      <span class="sentiment-pct">${Math.round(s.confidence * 100)}%</span>
    </div>`).join("")}
  </div>

  <!-- TOPICS -->
  <div class="section">
    <div class="section-title">🏷️ Key Topics</div>
    <div class="topics">
      ${analysis.key_topics.map(t => `<span class="topic-tag">${t}</span>`).join("")}
    </div>
  </div>

  <!-- EMAIL DRAFT -->
  <div class="section">
    <div class="section-title">📧 Follow-up Email Draft</div>
    <div class="email-box">${analysis.follow_up_email}</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    Generated by MeetMind AI · ${new Date().toISOString().slice(0, 10)} · meet-mind-chi.vercel.app
  </div>

  <!-- PRINT BUTTON -->
  <div class="no-print" style="text-align:center;margin-top:20px">
    <button onclick="window.print()" style="font-family:Inter,sans-serif;font-size:14px;font-weight:700;padding:12px 36px;background:#F5A623;color:#0D0F12;border:none;border-radius:8px;cursor:pointer">
      ⬇ Save as PDF
    </button>
    <p style="color:#9CA3AF;font-size:10px;margin-top:8px">Use Ctrl+P → Destination: "Save as PDF"</p>
  </div>

</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
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
