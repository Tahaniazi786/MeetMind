<div align="center">

# 🧠 MeetMind — AI Meeting Intelligence Platform

**Transform raw meeting audio & transcripts into structured, actionable intelligence in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_3.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel_Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://meet-mind-chi.vercel.app)

*MeetMind leverages Google Gemini multimodal AI to transcribe audio recordings and analyze meeting transcripts, extracting action items, decisions, sentiment analysis, conflict detection, and generating exportable PDF reports — stored in a persistent SQLite database with an interactive dark editorial dashboard.*

👉 **Live Demo & App:** [https://meet-mind-chi.vercel.app](https://meet-mind-chi.vercel.app)

</div>

---

## ✨ Features & Capabilities

### 🎯 Core Intelligence
| Feature | Description |
|---------|-------------|
| **Multimodal Audio Transcription** | Real-time speaker diarization and audio-to-text supporting `.mp3`, `.wav`, `.m4a`, `.webm`, and `.ogg` |
| **3-Level Smart Summary** | Instant TL;DR (2 sentences), Executive (5-7 sentences), and Detailed comprehensive summaries |
| **Interactive Action Items** | Auto-detected tasks with assigned owners, deadlines, priority tags, and interactive completion checkmarks |
| **Decision Log** | Every explicit and implicit decision captured with surrounding context and decision-maker |
| **Per-Speaker Sentiment Analysis** | Sentiment breakdown per participant (positive, neutral, tense) with confidence metrics |
| **Meeting Health Score (0-100)** | Balanced scoring across clarity, decisions reached, speaker participation, and actionability |
| **Key Topics Word Cloud** | Top 15 discussion topics visualized for instant scanability |
| **1-Click Follow-up Email Draft** | Auto-generated professional email recap ready to copy with a single click |
| **Executive PDF Export** | Clean, high-contrast printable meeting report generation |

### 🚀 Unique Differentiators

#### 🏷️ Meeting Archetype Classification
AI automatically categorizes every meeting into one of 5 distinct archetypes:
- 🎯 **Decision Meeting** — major choices made and approved
- 🚨 **Crisis Meeting** — high tension, urgent escalations or rollbacks
- 🔄 **Sync Meeting** — routine alignment and status check-in
- 💡 **Brainstorming Session** — creative ideation and scoping
- 📋 **Status Update** — informational broadcast

#### ⚠️ Conflict & Friction Detection
Identifies interpersonal tension, disagreements, or friction:
> *"⚠️ Potential friction detected between **John** and **Sarah** regarding headcount allocation and timeline compression."*

#### 📊 4-Dimension Health Explainer
Specific explanations detailing why each score was awarded:
- **Clarity (25/25):** Clear communication of objectives with minimal ambiguity.
- **Decisions (23/25):** Concrete decisions made and explicitly assigned.
- **Participation (22/25):** Balanced speaking distribution across detected participants.
- **Actionability (25/25):** High number of actionable tasks with explicit deadlines.

#### 🗄️ Persistent SQLite Meeting Intelligence Archive
- Search meeting history by keywords, titles, and topics.
- Filter by meeting archetype pills.
- Aggregate analytics banner (Total meetings, average health, completed action items).
- 1-click rehydration into the interactive Results dashboard.

---

## 🏗️ Architecture

```
MeetMind/
├── frontend/                          # Next.js 14 App Router + Vercel Serverless
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── analyze/page.tsx           # Audio upload & transcript input
│   │   ├── results/page.tsx           # Meeting intelligence dashboard
│   │   ├── history/page.tsx           # SQLite-synced searchable meeting archive
│   │   ├── demo/page.tsx              # Standalone demo
│   │   └── api/                       # Unified Serverless AI API routes
│   │       ├── transcribe/route.ts    # POST /api/transcribe (Gemini Audio)
│   │       ├── analyze/route.ts       # POST /api/analyze (Gemini Intelligence)
│   │       └── health/route.ts        # GET /api/health
│   ├── components/results/
│   │   ├── ActionItemsTable.tsx       # Interactive task checklist
│   │   ├── ArchetypeBadge.tsx         # Meeting type classifier
│   │   ├── ConflictDetector.tsx       # Tension detector
│   │   ├── DecisionLog.tsx            # Decisions catalogue
│   │   ├── EmailDraft.tsx             # Follow-up email
│   │   ├── ExportBar.tsx              # PDF export & Save to History
│   │   ├── HealthGauge.tsx            # Circular health donut
│   │   ├── SentimentChart.tsx         # Sentiment analysis
│   │   ├── SmartSummary.tsx           # 3-tab summary
│   │   ├── StatCards.tsx              # Score breakdown cards
│   │   └── WordCloud.tsx              # Key topics cloud
│   ├── context/
│   │   └── MeetingContext.tsx         # React Context state provider
│   ├── lib/
│   │   ├── api.ts                     # API client & local persistence
│   │   └── geminiServer.ts            # Server-side Gemini AI engine
│   └── package.json
│
├── backend/                           # Standalone Express + SQLite Service (Optional)
│   ├── src/
│   │   ├── index.js                   # Express server entry point
│   │   ├── chains/analyzeChain.js     # Gemini analysis pipeline
│   │   ├── lib/
│   │   │   ├── database.js            # SQLite database manager (better-sqlite3)
│   │   │   └── geminiAudio.js         # Multimodal audio transcription
│   │   └── routes/
│   │       ├── analyze.js             # /api/analyze
│   │       ├── transcribe.js          # /api/transcribe
│   │       ├── meetings.js            # /api/meetings CRUD
│   │       └── exportPdf.js           # /api/export-pdf
│   ├── data/                          # SQLite persistent database storage
│   └── package.json
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide Icons |
| **AI Model & Engine** | Google Gemini 3.5 Flash Lite (`@google/generative-ai`) |
| **Audio Processing** | Gemini Multimodal Audio (Base64 inline + File API) |
| **Database** | SQLite (`better-sqlite3`) with WAL mode & LocalStorage sync |
| **PDF Generation** | Custom DOM canvas & print styles (`html2canvas`, `jspdf`) |
| **Deployment** | Vercel (Frontend & Serverless AI Functions) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/Tahaniazi786/MeetMind.git
cd MeetMind
```

### 2. Run the Unified Next.js App
```bash
cd frontend
npm install

# Run dev server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 3. (Optional) Run the Standalone Backend
```bash
cd backend
npm install
npm run dev
# ✅ Backend running on http://localhost:4000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/transcribe` | Audio file → Diarized transcript (Gemini) |
| `POST` | `/api/analyze` | Transcript → Full intelligence JSON schema |
| `GET` | `/api/meetings` | List saved meetings with search (`?q=`) & filter (`?archetype=`) |
| `POST` | `/api/meetings` | Save meeting analysis to SQLite database |
| `PATCH` | `/api/meetings/:id/action-items/:index` | Toggle action item completion status |
| `GET` | `/api/meetings/stats/summary` | Aggregate analytics (total meetings, health, action items) |

---

## 🌐 Live Deployment

* **Production URL:** [https://meet-mind-chi.vercel.app](https://meet-mind-chi.vercel.app)
* **Analyze:** [https://meet-mind-chi.vercel.app/analyze](https://meet-mind-chi.vercel.app/analyze)
* **History:** [https://meet-mind-chi.vercel.app/history](https://meet-mind-chi.vercel.app/history)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

<div align="center">

**MeetMind — Because every meeting deserves intelligence.**

</div>
