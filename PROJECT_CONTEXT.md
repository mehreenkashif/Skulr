# Skulr — Project Context File
> Paste this at the start of every new Claude session to restore full context instantly.
> Update the "Current Status" and "Session Log" sections after every session.

---

## Project Identity
- **Name:** Skulr
- **Tagline:** Your skill radar — know exactly where you stand, know exactly what's next
- **Type:** AI-powered career readiness and skill gap analysis web app
- **Target User:** Pakistani university students and fresh graduates entering the tech job market

---

## The Problem It Solves
Students invest time learning skills but have no way to measure whether that learning is moving them toward their career goal. Skulr solves this by comparing a user's current skill profile against real job market requirements and giving them a live, updating Job Readiness Score.

---

## Tech Stack (Decided)
| Layer | Technology | Reason |
|---|---|---|
| Frontend | React.js + Recharts | User knows it well |
| Backend | Python Flask | User knows it well |
| ML | scikit-learn | Course requirement |
| LLM | Google Gemini API (free) | Free tier, no credit card |
| NLP | pdfplumber + spaCy | Resume parsing |
| Database | SQLite (dev) → PostgreSQL (prod) | Simple start |
| Deployment | Vercel (React) + Render (Flask) | Both free tier |

---

## ML Algorithms (All 5 Required by Course)
| Algorithm | Role in Skulr |
|---|---|
| KNN | Match user skill profile to job postings, find similar hired profiles |
| Logistic Regression | Calculate Job Readiness Score 0–100 |
| Decision Tree | Rank and prioritize skill gaps by importance |
| K-Means | Cluster user's learning logs into categories |
| Apriori | Find skill association rules from job data |

---

## How Job Data Works
- No manual dataset, no live scraping
- Flask calls Gemini API with target role → Gemini returns required skills as JSON
- Response cached in database (same role never calls API twice)
- ML models run against this cached data

---

## Core Features
1. User registration + JWT auth
2. Resume PDF upload → NLP skill extraction
3. Target role selection
4. Job Readiness Score (Logistic Regression)
5. Skill match bars per skill (KNN)
6. Skill gap list ranked by priority (Decision Tree)
7. Learning log — daily entry form
8. Streak tracker
9. AI roadmap generator (Gemini API)
10. Company match — "people like you got hired at X"
11. Score history chart (Recharts)

---

## Project Folder Structure (Planned)
```
skulr/
├── frontend/          ← React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  ← API calls to Flask
│   │   └── App.jsx
│   └── package.json
│
├── backend/           ← Flask app
│   ├── app/
│   │   ├── routes/    ← auth, resume, ml, gemini, dashboard
│   │   ├── models/    ← SQLAlchemy DB models
│   │   ├── ml/        ← all 5 ML algorithm files
│   │   ├── nlp/       ← resume parser
│   │   └── __init__.py
│   ├── config.py
│   ├── requirements.txt
│   └── run.py
│
└── PROJECT_CONTEXT.md ← this file
```

---

## Key Decisions Log
| Decision | What | Why |
|---|---|---|
| 2025-01 | Gemini over OpenAI | Free, no card needed, Google brand |
| 2025-01 | SQLite for dev | Simple, zero setup, switch to Postgres for deploy |
| 2025-01 | No live scraping | Gemini API replaces need for dataset |
| 2025-01 | JWT auth | Industry standard, stateless, easy with Flask |

---

## Current Status
- [x] Project named: Skulr
- [x] Tech stack decided
- [x] Architecture designed
- [x] Context document created
- [ ] GitHub repo created
- [ ] Day 1: Folder structure + Flask setup
- [ ] Day 2: Database models
- [ ] Day 3: Resume upload + NLP
- [ ] Day 4: Gemini API integration
- [ ] Day 5: KNN + Logistic Regression
- [ ] Day 6: Decision Tree + K-Means + Apriori
- [ ] Day 7: React setup + Auth UI
- [ ] Day 8: Dashboard components
- [ ] Day 9: Connect React to Flask
- [ ] Day 10: Polish + Deploy

---

## Session Log
| Session | Date | What was built |
|---|---|---|
| Session 1 | Day 0 | Project planning, name selection, architecture, this document |

---

## How to Use This File
1. Save this file as `PROJECT_CONTEXT.md` in your GitHub repo root
2. At the start of every new Claude chat, paste the contents
3. Claude will have full context and we continue immediately
4. At the end of every session, update "Current Status" checkboxes and add a row to "Session Log"

---

## Instructor Talking Points
When your teacher asks about AI:
> "Skulr uses a hybrid AI architecture. Five traditional ML algorithms handle pattern detection and scoring — KNN, K-Means, Decision Tree, Logistic Regression, and Apriori. Google Gemini LLM handles real-time job market intelligence and roadmap generation. This mirrors how production AI systems are built in 2025."

