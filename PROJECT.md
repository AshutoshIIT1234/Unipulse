# UniPulse AI — University News & Feedback Intelligence

UniPulse AI is a full-stack intelligence platform that scrapes Reddit posts from Indian Institute of Technology (IIT) subreddits, performs sentiment analysis, tracks trends, and provides insights through a dashboard, comparison tools, and a RAG-powered chatbot.

---

## Architecture Overview

```
Frontend (React + Vite)              Backend (FastAPI + Python)
┌──────────────────────────┐        ┌──────────────────────────────┐
│  Dashboard (/, /compare,  │◄──────►│  API Server (port 8000)       │
│  /chatbot)                │  HTTP  │                              │
│  - Recharts visualizations│        │  ┌────────────────────────┐  │
│  - Mock + live data       │        │  │ Scraper (PRAW/Reddit)   │  │
│  - React Router           │        │  ├────────────────────────┤  │
└──────────────────────────┘        │  │ Sentiment (VADER)       │  │
                                    │  ├────────────────────────┤  │
                                    │  │ Agent System           │  │
                                    │  │  ├ SentimentAgent      │  │
                                    │  │  ├ TrendAgent          │  │
                                    │  │  └ ImprovementAgent   │  │
                                    │  ├────────────────────────┤  │
                                    │  │ RAG Chatbot (FAISS +   │  │
                                    │  │ SentenceTransformers)  │  │
                                    │  └────────────────────────┘  │
                                    │                              │
                                    │  PostgreSQL  FAISS  APScheduler│
                                    └──────────────────────────────┘
```

---

## Project Structure

```
Unipulse-main/
├── backend/
│   ├── main.py              FastAPI app — all API routes
│   ├── scraper.py           Reddit data collection via PRAW
│   ├── sentiment.py         VADER sentiment analysis
│   ├── rag_chatbot.py       RAG-based Q&A with FAISS vector store
│   ├── database.py          SQLAlchemy PostgreSQL setup
│   ├── scheduler.py          APScheduler periodic tasks
│   ├── models.py            SQLAlchemy ORM models
│   ├── agents/
│   │   ├── agent_runner.py  Agent orchestration (run/manage agents)
│   │   ├── sentiment_agent.py   IIT sentiment analysis
│   │   ├── trend_agent.py      Trend detection & anomaly alerts
│   │   └── improvement_agent.py Improvement recommendations
│   ├── reddit_mcp.py        Reddit MCP server integration
│   └── requirements.txt    Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          Root component with React Router
│   │   ├── main.jsx         Vite entry point
│   │   ├── index.css        Global styles
│   │   ├── api.js           Axios API client (all backend endpoints)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    Individual IIT sentiment view
│   │   │   ├── Compare.jsx      Multi-IIT comparison view
│   │   │   └── Chatbot.jsx      RAG-powered Q&A interface
│   │   └── components/
│   │       ├── Navbar.jsx       Navigation
│   │       ├── SentimentChart.jsx   Area chart for trends
│   │       ├── CategoryBars.jsx     Category bars
│   │       └── PostFeed.jsx         Reddit post display
│   ├── package.json
│   ├── vite.config.js
│   └── dist/                Production build output
│
├── IMPLEMENTATIONS.md       Detailed technical documentation
└── README.md
```

---

## IITs Covered

| Code  | Full Name               | Location                  | Founded |
|-------|-------------------------|---------------------------|---------|
| IITB  | IIT Bombay              | Mumbai, Maharashtra        | 1958    |
| IITM  | IIT Madras              | Chennai, Tamil Nadu       | 1959    |
| IITD  | IIT Delhi               | New Delhi                 | 1961    |
| IITKgp| IIT Kharagpur            | Kharagpur, West Bengal    | 1951    |
| IITBHU| IIT BHU (Varanasi)       | Varanasi, Uttar Pradesh  | 1919    |
| IITG  | IIT Guwahati             | Guwahati, Assam           | 1994    |
| IITP  | IIT Patna                | Patna, Bihar              | 2008    |

---

## Backend

### Tech Stack
- **Framework**: FastAPI
- **Data Scraping**: PRAW (Python Reddit API Wrapper)
- **Sentiment Analysis**: VADER (Valence Aware Dictionary and sEntiment Reasoner)
- **NLP/Embeddings**: Transformers, Torch, Sentence-Transformers (all-MiniLM-L6-v2)
- **Vector Search**: FAISS (Facebook AI Similarity Search)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Task Scheduling**: APScheduler
- **Server**: Uvicorn

### API Endpoints

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| GET    | `/api/sentiment/{iit_key}`          | Sentiment analysis for one IIT       |
| GET    | `/api/sentiment/report/{iit_key}`   | Detailed IIT report via agent        |
| GET    | `/api/sentiment/compare`            | Compare specific IITs by sentiment    |
| GET    | `/api/compare`                      | Rank all IITs by overall sentiment   |
| GET    | `/api/chatbot`                      | Query the RAG chatbot                |
| GET    | `/api/chatbot/index`                | Index IIT data for chatbot           |
| GET    | `/api/agents`                       | List all available agents            |
| GET    | `/api/agents/run/{agent_name}`      | Run a specific agent action          |
| GET    | `/api/agents/insights`              | Run all agents for combined insights |
| GET    | `/api/trends`                       | Current sentiment trends             |
| GET    | `/api/trends/anomalies`             | Detect sentiment anomalies           |
| GET    | `/api/trends/weekly`                | Weekly summary with rankings         |
| GET    | `/api/trends/categories`            | Compare sentiment across categories  |
| GET    | `/api/improvements`                 | Improvement recommendations           |

### Sentiment Categories

Posts are automatically categorized using keyword matching:

- **Academics** — exam, professor, course, grade, CGPA, study, lecture
- **Placements** — placement, internship, package, company, offer, PPO, LPA
- **Hostel Life** — hostel, mess, food, room, warden, canteen
- **Fests & Culture** — fest, cultural, techfest, mood indigo, spring fest, event
- **Mental Health** — stress, anxiety, depression, counseling, burnout, loneliness
- **Administration** — admin, dean, rule, policy, fee, bureaucracy, portal
- **Infrastructure** — lab, library, wifi, facility, building, campus, gym

### Agent System

**SentimentAgent** (`agents/sentiment_agent.py`)
- `analyze_all_iits()` — Analyze all IITs and return scores
- `get_iit_report(iit_key)` — Detailed report with category breakdown
- `compare_iits(iit_list)` — Ranked comparison between IITs

**TrendAgent** (`agents/trend_agent.py`)
- `get_current_trends()` — Current sentiment per IIT and category
- `detect_anomalies()` — Flag IITs with unusual sentiment spikes/drops
- `get_weekly_summary()` — Rankings + anomalies + timestamp
- `compare_categories()` — Cross-IIT category performance

**ImprovementAgent** (`agents/improvement_agent.py`)
- `generate_recommendations()` — Content, features, UX, engagement recommendations
- `generate_report()` — Prioritized action items

**AgentRunner** (`agents/agent_runner.py`)
- Orchestrates all agents and exposes a unified `run_agent()` interface

### RAG Chatbot

The chatbot uses Retrieval-Augmented Generation:

1. Scraped Reddit posts → VADER analysis → stored with sentiment metadata
2. Documents embedded using `sentence-transformers` (all-MiniLM-L6-v2)
3. Embedded documents stored in FAISS index
4. On query: retrieve top-K similar docs → build structured answer with rankings, positive/negative highlights, and source citations

### Data Flow

```
Reddit API (PRAW)
     │
     ▼
scraper.py → categorize_post() → post objects
     │
     ▼
sentiment.py → VADER analyzer → compound/label scores
     │
     ├─────────────────────────┐
     ▼                         ▼
Dashboard API             RAG Chatbot
(/api/sentiment/)         (index_posts → FAISS)
     │
     ▼
Agent System
(SentimentAgent / TrendAgent / ImprovementAgent)
```

---

## Frontend

### Tech Stack
- **Framework**: React 19 with Vite 7
- **Routing**: React Router DOM v7
- **Data Visualization**: Recharts (Area, Bar, Radar, Pie charts)
- **HTTP Client**: Axios
- **Markdown Rendering**: react-markdown + remark-gfm
- **Styling**: Inline CSS (no external CSS framework)

### Pages

**Dashboard** (`/`)
- IIT selector sidebar with overall scores
- Institute banner with sentiment score, trend indicator, post count
- Tabbed interface: Overview, Trends, Categories, Feed
- 6-week sentiment trend area chart
- Sentiment mix donut chart
- Category breakdown bars
- Reddit post feed with sentiment labels and scores

**Compare** (`/compare`)
- Leaderboard with ranked IIT cards
- Tabbed view: Leaderboard, Radar, Category, Details
- Radar chart for multi-dimensional multi-IIT comparison
- Grouped bar chart for category comparisons
- Score heatmap table across all IITs and categories
- Focus cards showing strengths and concerns per IIT

**Chatbot** (`/chatbot`)
- IIT selector dropdown (All IITs or specific)
- INDEX DATA button to load posts into FAISS vector store
- Chat interface with markdown-rendered responses
- Source citations with sentiment scores
- RAG response includes rankings, positive highlights, negative concerns

### API Client (`src/api.js`)

```javascript
fetchIITSentiment(iitKey)      // GET /api/sentiment/:iit_key
fetchIITReport(iitKey)          // GET /api/sentiment/report/:iit_key
fetchAllIITs()                  // GET /api/compare
indexChatbotData(iitKey)        // GET /api/chatbot/index
askChatbot(question, iitKey)   // GET /api/chatbot
listAgents()                    // GET /api/agents
runAgent(agentName, action)     // GET /api/agents/run/:agent_name
runAllInsights()                // GET /api/agents/insights
getTrends()                     // GET /api/trends
getAnomalies()                  // GET /api/trends/anomalies
getWeeklySummary()              // GET /api/trends/weekly
getCategoryComparison()          // GET /api/trends/categories
getImprovements()              // GET /api/improvements
compareIITs(iitList)           // GET /api/sentiment/compare
```

---

## Setup & Running

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL
- Reddit API credentials (client_id, client_secret, user_agent)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your Reddit API credentials and DATABASE_URL
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # Development server on port 5173
npm run build   # Production build
npm run preview # Preview production build
```

### Environment Variables (backend/.env)

```env
DATABASE_URL=postgresql://user:password@localhost/unipulse
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=UniPulse/1.0
```

---

## Current Status

- Backend API: Complete
- Agent system: Implemented
- Frontend pages: Complete
- Frontend-backend integration: Partial (uses static mock data fallback when API unavailable)
- Real-time data: Mock data mode available when Reddit API credentials not configured

The app works fully in **mock mode** without Reddit API credentials, using procedurally generated posts with realistic sentiment distributions per IIT.