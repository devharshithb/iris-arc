# 🧠 Iris Arc — Multi-Agent Cybersecurity Incident Response Chat System

**Iris Arc** is an advanced **multi-agent conversational AI platform** purpose-built for **cybersecurity incident response and threat intelligence analysis**.  
Developed with **Next.js 15**, **FastAPI**, and **TypeScript**, it integrates multiple autonomous agents — such as attacker simulators, defenders, analysts, and orchestrators — to collaboratively assess, detect, and respond to security incidents in real time.

The architecture emphasizes **modularity, explainability, and extensibility**, enabling seamless integration with LLMs, retrieval pipelines, and external security tools for intelligent, context-aware decision-making.

---

## 🚀 Overview

Iris Arc provides:

- Real-time token streaming from FastAPI → Next.js
- Persistent chat threads managed through Zustand
- Secure authentication (JWT + bcrypt)
- Dark / light / system theme sync
- File uploads + document attachment handling
- Markdown + syntax-highlighted code rendering
- Clean, responsive UI using Tailwind + shadcn + Framer Motion

---

## 🧩 Project Structure

```
iris-arc/
├── backend/              # FastAPI service (Python 3.11+)
│   └── main.py
└── web/                  # Next.js 15 frontend (TypeScript + Tailwind)
    ├── src/
    ├── public/
    ├── package.json
    └── tsconfig.json
```

---

## ⚙️ Tech Stack

### Frontend (Web)

- **Framework:** Next.js 15 (App Router + React 19 + TypeScript)
- **Styling:** Tailwind CSS 4 + Radix UI + shadcn/ui
- **Animations:** Framer Motion
- **State Management:** Zustand + React Context
- **Markdown:** react-markdown + rehype-highlight + remark-gfm
- **Toasts & UX:** sonner
- **Package Manager:** pnpm (LTS)

### Backend (API)

- **Framework:** FastAPI (Python 3.11+)
- **Runtime:** Uvicorn ASGI
- **Auth:** JWT (access + refresh) + bcrypt / passlib
- **DB (placeholder):** MongoDB or PostgreSQL w/ pgvector
- **CORS & Security:** Configured for frontend <-> backend communication
- **Streaming:** Async token streaming via `StreamingResponse`

---

## 🧱 Prerequisites

### System Requirements

- **Ubuntu 22.04 / WSL2** (recommended)
- **Node LTS (≥ 18)** + **pnpm** (`npm install -g pnpm`)
- **Python ≥ 3.11** + **pip/venv/uv**
- **Git + OpenSSH** (for cloning via SSH)
- **VS Code** with extensions:

  - Tailwind CSS IntelliSense
  - Python
  - Prettier / ESLint

---

## 🧭 Setup Guide

### 1️⃣ Clone the Repository

```bash
git clone git@github.com:<your-username>/iris-arc.git
cd iris-arc
```

---

### 2️⃣ Backend Setup (FastAPI)

```bash
cd backend
# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Run the backend server (default port 8000):

```bash
uvicorn main:app --reload --port 8000
```

Verify:

> [http://localhost:8000/docs](http://localhost:8000/docs) → OpenAPI interactive docs

---

### 3️⃣ Frontend Setup (Next.js)

```bash
cd web
pnpm install
pnpm dev
```

By default, it runs at:

> [http://localhost:3000](http://localhost:3000)

The frontend will automatically connect to the backend at `http://localhost:8000` (update `.env.local` if needed).

---

## ⚙️ Environment Variables

### Frontend (`web/.env.local`)

```bash
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret_key
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

```

---

## 🧩 Development Scripts

### Web (frontend)

| Command      | Description                                                               |
| ------------ | ------------------------------------------------------------------------- |
| `pnpm dev`   | Start Next.js dev server ([http://localhost:3000](http://localhost:3000)) |
| `pnpm build` | Build production bundle                                                   |
| `pnpm start` | Run production server                                                     |
| `pnpm lint`  | Lint codebase with ESLint                                                 |

### Backend (FastAPI)

| Command                                 | Description               |
| --------------------------------------- | ------------------------- |
| `uvicorn main:app --reload --port 8000` | Run dev server            |
| `pytest`                                | Run tests (if configured) |

---

## 🌙 Features by Phase (High-Level)

| Phase     | Description                                               |
| --------- | --------------------------------------------------------- |
| **0**     | Environment + Repo Setup (WSL2 + Node + Python toolchain) |
| **1**     | App Shell & Layout (UI structure, Sidebar + Composer)     |
| **2**     | Frontend ↔ Backend Streaming Orchestration                |
| **3**     | Global Zustand Store + UI State Integration               |
| **4**     | Markdown + Code Rendering System                          |
| **5**     | Authentication (JWT + Frontend Forms)                     |
| **6**     | Conversations + Persistence (Thread management)           |
| **7**     | File Attachment Support (Drag & Drop / Preview)           |
| **8**     | Unified API Client Layer (lib/api.ts)                     |
| **9-10**  | LLM Integration + RAG Pipeline (coming soon)              |
| **11-15** | Sidebar UX, Settings, Hardening, CI/CD, Optimization      |

---

## 🧠 Developer Workflow

1. **Pull latest main**

   ```bash
   git pull origin main
   ```

2. **Run both servers**

   - Terminal 1: `uvicorn main:app --reload`
   - Terminal 2: `pnpm dev`

3. **Edit → Test → Commit**

   ```bash
   git add .
   git commit -m "feat: update chat composer behavior"
   git push origin main
   ```

---

## 🧰 Recommended Tools

| Purpose              | Tool                    |
| -------------------- | ----------------------- |
| Package Manager      | pnpm                    |
| Linting / Formatting | ESLint + Prettier       |
| Version Control      | Git + SSH               |
| Python Deps          | pip / uv                |
| Process Manager      | pm2 (optional for prod) |
| Editor               | VS Code / Cursor / Zed  |

---

## 🧾 Deployment Notes

### Frontend

Deployed via **Vercel** or **Node server**:

```bash
pnpm build
pnpm start
```

### Backend

Deployed via **Railway**, **Fly.io**, or **Docker**:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Add appropriate CORS and JWT configurations for production domains.

---

## 🧑‍💻 Contributing

1. Fork → Clone → Create feature branch
2. Keep commits small & descriptive
3. Submit a PR with clear title and linked issue

---

## 🪶 License

No Licensed Yet

---

### 🌟 Credits

Developed by **Harshith B** and collaborators.
Architecture inspired by **ChatGPT’s frontend and FastAPI streaming patterns**.

---

**Run locally:**

```bash
# In two terminals
cd backend && uvicorn main:app --reload
cd web && pnpm dev
```

Then open 👉 **[http://localhost:3000](http://localhost:3000)**
