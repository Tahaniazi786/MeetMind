<div align="center">

# 🧠 MeetMind — AI Meeting Intelligence Platform

**Transform any meeting into actionable intelligence in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*MeetMind uses GPT-4o to analyze meeting transcripts and audio, extracting action items, decisions, sentiment analysis, conflict detection, and generating exportable PDF reports — all in a stunning dark editorial dashboard.*

</div>

---

## ✨ Features

### 🎯 Core Intelligence
| Feature | Description |
|---------|-------------|
| **3-Level Smart Summary** | TL;DR, Executive, and Detailed summaries with tab switching |
| **Action Item Extraction** | Auto-detects tasks with owner, deadline, and priority |
| **Decision Log** | Every decision captured with context and decision-maker |
| **Sentiment Analysis** | Overall + per-speaker sentiment with confidence scores |
| **Meeting Health Score** | 0-100 score based on clarity, decisions, participation, actionability |
| **Key Topics Word Cloud** | Visual representation of most discussed topics |
| **Follow-up Email Draft** | AI-generated professional email with copy + Gmail integration |
| **PDF Report Export** | Client-side PDF generation — no server needed |

### 🚀 Unique Differentiators

#### 🔴 Meeting Archetype Badge
AI classifies every meeting into one of 5 types:
- 🔴 **Decision Meeting** — major choices were made
- 🟡 **Status Update** — informational, low action
- 🟢 **Brainstorm** — creative, idea generation
- 🔵 **Crisis Meeting** — high tension, urgent
- ⚪ **Sync** — routine alignment

#### ⚠️ Conflict Detector
Detects inter-speaker tension and friction:
> *"⚠️ Potential friction detected between **John** and **Sarah** around the topic of **timeline compression**. Consider a 1:1 follow-up."*

#### 📊 Health Score Explainer
AI-generated one-line explanations for each health metric:
- Clarity: 22/25 — *"Communication was mostly clear with 2 ambiguous directives"*
- Decisions: 23/25 — *"4 concrete decisions were reached, each with clear ownership"*
- Participation: 17/25 — *"John dominated ~45% of speaking time"*
- Actionability: 25/25 — *"6 clear action items with owners assigned"*

---

## 🖼️ Screenshots

<div align="center">

### Results Dashboard — Top Section
*Meeting Archetype Badge + Conflict Detector + Health Score + Stat Cards*

### Results Dashboard — Action Items & Decisions
*Prioritized action items table + decision log with context*

### Results Dashboard — Sentiment, Topics & Email
*Per-speaker sentiment bars + word cloud + auto-generated follow-up email*

### Landing Page
*Animated waveform hero with feature grid*

</div>

---

## 🏗️ Architecture

```
MeetMind/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── index.js         # Express server with CORS
│   │   ├── chains/
│   │   │   └── analyzeChain.js  # LangChain + GPT-4o pipeline
│   │   ├── routes/
│   │   │   ├── analyze.js   # POST /api/analyze
│   │   │   ├── transcribe.js # POST /api/transcribe (Whisper)
│   │   │   └── exportPdf.js # POST /api/export-pdf
│   │   ├── lib/
│   │   │   ├── whisper.js   # OpenAI Whisper integration
│   │   │   └── pdfGenerator.js # Puppeteer PDF generation
│   │   └── middleware/
│   │       └── errorHandler.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                # Next.js 14 (App Router)
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── analyze/page.tsx # Upload/paste transcript
│   │   ├── results/page.tsx # Intelligence dashboard
│   │   ├── demo/page.tsx    # Demo with mock data
│   │   ├── layout.tsx       # Root layout + providers
│   │   └── globals.css      # Design system tokens
│   ├── components/results/
│   │   ├── StatCards.tsx     # Health gauge + metrics
│   │   ├── SmartSummary.tsx  # 3-tab summary
│   │   ├── ActionItemsTable.tsx
│   │   ├── DecisionLog.tsx
│   │   ├── SentimentChart.tsx
│   │   ├── WordCloud.tsx
│   │   ├── EmailDraft.tsx
│   │   ├── ExportBar.tsx    # Client-side PDF export
│   │   ├── HealthGauge.tsx  # Animated circular gauge
│   │   ├── ArchetypeBadge.tsx  # Meeting type badge
│   │   └── ConflictDetector.tsx # Friction warning
│   ├── context/
│   │   └── MeetingContext.tsx # Global state + localStorage
│   ├── lib/
│   │   └── api.ts           # API client + mock fallback
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **AI/ML** | OpenAI GPT-4o, Whisper API, LangChain.js |
| **PDF Export** | Client-side (window.print) + Server-side (Puppeteer) |
| **State** | React Context + localStorage persistence |
| **Design** | Dark Editorial theme (Charcoal, Amber, Cool White) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

### 1. Clone the repository
```bash
git clone https://github.com/Tahaniazi786/MeetMind.git
cd MeetMind
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

npm run dev
# ✅ Backend running on http://localhost:4000
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Create .env.local
cp .env.example .env.local

npm run dev
# ✅ Frontend running on http://localhost:3000
```

### 4. Open the app
Navigate to `http://localhost:3000` and start analyzing meetings!

> **💡 No API key?** The app works without a backend too! It uses intelligent client-side analysis as a fallback.

---

## 📱 Usage

1. **Upload audio** or **paste a transcript** on the analyze page
2. Click **"Analyze Meeting →"** — GPT-4o processes the transcript (~15-30s)
3. View the full **Intelligence Dashboard** with all metrics
4. Click **"Export PDF Report"** to save a styled dark-themed PDF
5. Use the **Follow-up Email** section to copy or open in Gmail

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0D0F12` | Main background (Charcoal) |
| `--accent` | `#F5A623` | Primary accent (Amber) |
| `--text` | `#F0EDE8` | Body text (Cool White) |
| **Heading Font** | Syne | Display headings |
| **Mono Font** | DM Mono | Data, labels, code |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/transcribe` | Audio → text (Whisper) |
| `POST` | `/api/analyze` | Transcript → AI analysis |
| `POST` | `/api/export-pdf` | Analysis → PDF (server-side) |

### Example: Analyze a transcript
```bash
curl -X POST http://localhost:4000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Sarah: Let'\''s discuss the Q4 roadmap..."}'
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Connect GitHub repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add env: `NEXT_PUBLIC_API_URL` = your backend URL

### Backend → Railway
1. Connect GitHub repo on [railway.app](https://railway.app)
2. Set root directory to `backend`
3. Add env: `OPENAI_API_KEY`, `FRONTEND_URL`, `PORT`

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for the Hackathon**

*MeetMind — Because every meeting deserves intelligence.*

</div>
