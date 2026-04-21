const puppeteer = require("puppeteer");

/**
 * Generate a styled PDF report from the MeetMind analysis JSON.
 *
 * @param {object} analysis — the full analysis object from /api/analyze
 * @returns {Promise<Buffer>} — PDF file as a Buffer
 */
async function generatePdf(analysis) {
  const html = buildHtml(analysis);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Build a beautiful HTML report for the analysis.
 */
function buildHtml(data) {
  const healthColor = getHealthColor(data.meeting_health_score);
  const sentimentEmoji = {
    positive: "😊",
    neutral: "😐",
    tense: "😬",
    mixed: "🤔",
    conflict: "⚠️",
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1a1a2e;
      background: #ffffff;
      line-height: 1.6;
      font-size: 11px;
    }

    .header {
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: #fff;
      padding: 32px 40px;
      border-radius: 0 0 16px 16px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .header .subtitle {
      font-size: 12px;
      opacity: 0.7;
      font-weight: 400;
    }
    .header .health {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      background: ${healthColor};
      color: #fff;
    }

    .content { padding: 24px 0; }

    .section {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #302b63;
      border-bottom: 2px solid #e8e6f0;
      padding-bottom: 6px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-box {
      background: #f7f6fb;
      border-left: 4px solid #302b63;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 10px;
    }
    .summary-box .label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #302b63;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    th {
      background: #302b63;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e8e6f0;
    }
    tr:nth-child(even) td {
      background: #faf9fd;
    }

    .priority {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .priority.high   { background: #ffe0e0; color: #c0392b; }
    .priority.medium { background: #fff3d6; color: #e67e22; }
    .priority.low    { background: #d4f5e9; color: #27ae60; }

    .health-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .health-card {
      background: #f7f6fb;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }
    .health-card .score {
      font-size: 22px;
      font-weight: 800;
      color: #302b63;
    }
    .health-card .label {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      color: #888;
      margin-top: 4px;
    }

    .topics {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .topic-tag {
      background: #e8e6f0;
      color: #302b63;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 10px;
      font-weight: 500;
    }

    .email-box {
      background: #f7f6fb;
      border: 1px solid #e8e6f0;
      border-radius: 8px;
      padding: 16px;
      white-space: pre-wrap;
      font-size: 10.5px;
      line-height: 1.7;
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e8e6f0;
      text-align: center;
      font-size: 9px;
      color: #999;
    }

    .sentiment-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .sentiment-bar .name {
      width: 100px;
      font-weight: 600;
      font-size: 10.5px;
    }
    .sentiment-bar .bar-track {
      flex: 1;
      height: 8px;
      background: #e8e6f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .sentiment-bar .bar-fill {
      height: 100%;
      border-radius: 4px;
    }
    .sentiment-bar .value {
      width: 60px;
      font-size: 10px;
      text-align: right;
      font-weight: 500;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>🧠 MeetMind Report</h1>
    <div class="subtitle">AI Meeting Intelligence Report &middot; Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
    <div class="health">Meeting Health: ${data.meeting_health_score}/100</div>
  </div>

  <div class="content">

    <!-- Summaries -->
    <div class="section">
      <div class="section-title">📋 Meeting Summaries</div>
      <div class="summary-box">
        <div class="label">TL;DR</div>
        ${escapeHtml(data.tldr)}
      </div>
      <div class="summary-box">
        <div class="label">Executive Summary</div>
        ${escapeHtml(data.executive_summary)}
      </div>
      <div class="summary-box">
        <div class="label">Detailed Summary</div>
        ${escapeHtml(data.detailed_summary)}
      </div>
    </div>

    <!-- Health Score Breakdown -->
    <div class="section">
      <div class="section-title">💡 Health Score Breakdown</div>
      <div class="health-grid">
        <div class="health-card">
          <div class="score">${data.health_breakdown?.clarity ?? 0}</div>
          <div class="label">Clarity /25</div>
        </div>
        <div class="health-card">
          <div class="score">${data.health_breakdown?.decisions_made ?? 0}</div>
          <div class="label">Decisions /25</div>
        </div>
        <div class="health-card">
          <div class="score">${data.health_breakdown?.participation ?? 0}</div>
          <div class="label">Participation /25</div>
        </div>
        <div class="health-card">
          <div class="score">${data.health_breakdown?.actionability ?? 0}</div>
          <div class="label">Actionability /25</div>
        </div>
      </div>
    </div>

    <!-- Action Items -->
    <div class="section">
      <div class="section-title">✅ Action Items (${data.action_items?.length || 0})</div>
      ${
        data.action_items?.length
          ? `<table>
              <thead><tr><th>Task</th><th>Owner</th><th>Deadline</th><th>Priority</th></tr></thead>
              <tbody>
                ${data.action_items
                  .map(
                    (item) => `<tr>
                    <td>${escapeHtml(item.task)}</td>
                    <td>${escapeHtml(item.owner)}</td>
                    <td>${escapeHtml(item.deadline)}</td>
                    <td><span class="priority ${item.priority}">${item.priority}</span></td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : "<p>No action items detected.</p>"
      }
    </div>

    <!-- Decisions -->
    <div class="section">
      <div class="section-title">🏛️ Decision Log (${data.decisions?.length || 0})</div>
      ${
        data.decisions?.length
          ? `<table>
              <thead><tr><th>Decision</th><th>Made By</th><th>Context</th></tr></thead>
              <tbody>
                ${data.decisions
                  .map(
                    (d) => `<tr>
                    <td><strong>${escapeHtml(d.decision)}</strong></td>
                    <td>${escapeHtml(d.made_by)}</td>
                    <td>${escapeHtml(d.context)}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : "<p>No decisions detected.</p>"
      }
    </div>

    <!-- Sentiment -->
    <div class="section">
      <div class="section-title">🎭 Sentiment Analysis — Overall: ${sentimentEmoji[data.sentiment_analysis?.overall] || "😐"} ${data.sentiment_analysis?.overall || "neutral"} (${data.sentiment_analysis?.score ?? 50}/100)</div>
      ${
        data.sentiment_analysis?.breakdown?.length
          ? data.sentiment_analysis.breakdown
              .map(
                (s) => `<div class="sentiment-bar">
                <div class="name">${escapeHtml(s.speaker)}</div>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${Math.round(s.confidence * 100)}%;background:${getSentimentColor(s.sentiment)}"></div>
                </div>
                <div class="value">${s.sentiment} (${Math.round(s.confidence * 100)}%)</div>
              </div>`
              )
              .join("")
          : "<p>No per-speaker breakdown available.</p>"
      }
    </div>

    <!-- Key Topics -->
    <div class="section">
      <div class="section-title">🏷️ Key Topics</div>
      <div class="topics">
        ${(data.key_topics || []).map((t) => `<span class="topic-tag">${escapeHtml(t)}</span>`).join("")}
      </div>
    </div>

    <!-- Follow-up Email -->
    <div class="section">
      <div class="section-title">📧 Follow-up Email Draft</div>
      <div class="email-box">${escapeHtml(data.follow_up_email || "")}</div>
    </div>

  </div>

  <div class="footer">
    Generated by MeetMind AI &middot; ${new Date().toISOString()}
  </div>

</body>
</html>`;
}

// ── Helpers ──────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getHealthColor(score) {
  if (score >= 80) return "#27ae60";
  if (score >= 60) return "#2980b9";
  if (score >= 40) return "#e67e22";
  return "#c0392b";
}

function getSentimentColor(sentiment) {
  const map = {
    positive: "#27ae60",
    neutral: "#2980b9",
    tense: "#e67e22",
    conflict: "#c0392b",
    mixed: "#8e44ad",
  };
  return map[sentiment] || "#2980b9";
}

module.exports = { generatePdf };
