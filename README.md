# 🔄 SkillSync

**Intelligent, Fair, and Transparent Internship & Project Matching**

[![Node.js](https://img.shields.io/badge/Node.js-v20_LTS-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🎯 Overview

Traditional internship and project allocation systems rely on keyword matching and manual screening, which fail to accurately evaluate candidates' competencies. **SkillSync** solves this with an intelligent, explainable platform that:

- Evaluates candidates using **weighted skill competencies**
- Generates a transparent **Match Score** with full skill-by-skill breakdown
- Provides **gap guidance** — telling candidates exactly what to learn to become eligible
- Gives recruiters a **ranked, data-driven candidate view** with one-click notifications
- Parses resumes using **NLP-powered extraction** (spaCy + pdfminer)

---

## 🌐 Live Demo

> **The application is live and deployed at:**
>
> ### 🔗 [https://skill-sync-nine.vercel.app/](https://skill-sync-nine.vercel.app/)
>
> Visit the link above to explore SkillSync in action. You can create an account and use the platform freely for **personal or testing purposes**.

---

## ✨ Key Features

| For Candidates                         | For Recruiters                       |
| -------------------------------------- | ------------------------------------ |
| 📄 Smart Resume Parsing (NLP)          | 📝 Post Internships & Projects       |
| 📊 Match Score with skill breakdown    | 📈 Ranked candidate lists            |
| 🎯 Gap guidance & learning suggestions | 🔔 One-click candidate notifications |
| 🏆 Transparent rankings                | ✏️ Manage & edit postings            |
| 🔔 Accept/Reject notifications         | 👤 Company profile management        |

---

## 🏗 Architecture

```
┌─────────────────────┐
│   React/Vite SPA    │     TypeScript + Tailwind + Shadcn UI
│   (port 8080)       │
└────────┬────────────┘
         │ HTTP REST
         ▼
┌────────────────────────┐
│  Node.js / Express API │     Express 5 + Prisma + Zod
│  (port 5000)           │
│  9 route modules       │
└────────┬───────────────┘
         │ Internal HTTP          ┌───────────────┐
         ▼                        │  PostgreSQL   │
┌────────────────────────┐        │  (10 models)  │
│  Python / FastAPI      │        └───────▲───────┘
│  (port 8000)           │                │
│  Resume parsing + NLP  │            Prisma ORM
│  Score calculation     │
└────────────────────────┘
```

---

## 🔧 Tech Stack

| Layer           | Technologies                                                                        |
| --------------- | ----------------------------------------------------------------------------------- |
| **Frontend**    | React 18, TypeScript, Vite 5, Tailwind CSS, Shadcn UI, React Router, TanStack Query |
| **Backend API** | Node.js, Express 5, Prisma 5, PostgreSQL, JWT, bcrypt, Zod 4                        |
| **NLP Service** | Python 3.11, FastAPI, spaCy, pdfminer.six, Custom Skill Taxonomy (200+ skills)      |

> See [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md) for detailed documentation.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+ &nbsp;|&nbsp; **Python** 3.11+ &nbsp;|&nbsp; **PostgreSQL**

### 1. Clone & Setup Database

```bash
git clone git remote add origin  https://github.com/Kaustubh-Thallam/skill-sync.git
cd SkillSync
```

```sql
CREATE DATABASE skillsync_dev;
```

### 2. Node.js API

```bash
cd backend/node-service
npm install
# Configure .env (see backend/README.md for all variables)
npx prisma db push && npx prisma generate
npx prisma db seed    # Load sample data
npm run dev            # → http://localhost:5000
```

### 3. Python NLP Service

```bash
cd backend/python-service
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_md
python main.py         # → http://localhost:8000
```

### 4. Frontend

```bash
cd frontend
npm install
echo VITE_API_BASE_URL=http://localhost:5000 > .env
npm run dev            # → http://localhost:8080
```

---

## 🧮 Match Score Algorithm

```
Score = (Σ min(candidate_proficiency, required_proficiency) × weight)
      / (Σ required_proficiency × weight)
      × 100
```

Each posting skill has a **weight** (importance, 1–5) and a **required proficiency** (minimum level, 1–5). A candidate's proficiency is capped at the required level — exceeding it doesn't inflate the score.

| Required Skill | Weight | Req. Prof. | Candidate Prof. | Contribution | Max    |
| -------------- | ------ | ---------- | --------------- | ------------ | ------ |
| Python         | 5      | 4          | 5 → capped 4   | 20           | 20     |
| Django         | 4      | 3          | 0 (missing)     | 0            | 12     |
| SQL            | 3      | 3          | 3               | 9            | 9      |
| **Total**      |        |            |                 | **29**       | **41** |

**Score = 70.7%** → Below 80% threshold → Gap guidance provided

The system also expands skills using a taxonomy (e.g., Flask → Python, React → JavaScript).

---

## 🔑 Sample Credentials

Run `npx prisma db seed` to populate sample data. **Password for all: `password123`**

| Role      | Email                    | Name/Company   |
| --------- | ------------------------ | -------------- |
| Candidate | alice@example.com        | Alice Johnson  |
| Candidate | bob@example.com          | Bob Smith      |
| Candidate | carol@example.com        | Carol Williams |
| Recruiter | recruiter1@techcorp.com  | TechCorp       |
| Recruiter | recruiter2@startupai.com | StartupAI      |

---

## 📁 Project Structure

```
synaptix26_DreamDevelopers/
├── frontend/               # React + Vite SPA (see frontend/README.md)
│   ├── src/pages/          # 19 pages (4 public + 8 candidate + 7 recruiter)
│   ├── src/components/     # 10 custom + 49 Shadcn UI components
│   └── public/favicon.svg  # App icon
├── backend/
│   ├── node-service/       # Express API (see backend/README.md)
│   │   ├── src/routes/     # 9 route files, 25+ endpoints
│   │   └── prisma/         # Schema (10 models) + seed data
│   └── python-service/     # FastAPI NLP microservice
│       ├── main.py         # Resume parsing + score calculation
│       └── skill_taxonomy.py # 200+ skill mappings
└── README.md               # This file
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by <strong>Dream Developers</strong>
</p>
