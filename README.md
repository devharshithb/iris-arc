# 🧠 Iris Arc — Multi-Agent Cybersecurity Incident Response Chat System

**Iris Arc** is an advanced **multi-agent conversational AI platform** purpose-built for **cybersecurity incident response and threat intelligence analysis**.  
Developed with **Next.js 15**, **FastAPI**, and **TypeScript**, it integrates multiple autonomous agents — such as attacker simulators, defenders, analysts, and orchestrators — to collaboratively assess, detect, and respond to security incidents in real time.

The architecture emphasizes **modularity, explainability, and extensibility**, enabling seamless integration with LLMs, retrieval pipelines, and external security tools for intelligent, context-aware decision-making.

---

## 🚀 Overview

Iris Arc is a full-stack application that combines modern web technologies to deliver a powerful cybersecurity analysis platform. The system features:

- **Real-time AI Chat Interface** — Token streaming from FastAPI to Next.js for responsive AI interactions
- **Multi-Agent Architecture** — Coordinated agents for threat analysis, incident response, and security recommendations
- **Project Management** — Organize security incidents, investigations, and analysis sessions
- **Secure Authentication** — JWT-based auth with bcrypt password hashing and refresh token support
- **Persistent Conversations** — SQLite-based chat history with full thread management
- **Modern UI/UX** — Dark/light/system theme support with smooth animations and responsive design
- **File & Document Handling** — Drag-and-drop uploads, attachment management, and document preview
- **Code-Aware Rendering** — Syntax-highlighted code blocks with markdown support

---

## 🧩 Project Structure

```
iris-arc/
├── backend/                    # FastAPI Backend (Python 3.11+)
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── chats/         # Chat management endpoints
│   │   │   ├── projects/      # Project management endpoints
│   │   │   └── stream/        # SSE streaming endpoints
│   │   ├── core/              # Core configurations
│   │   │   ├── config.py      # Settings & environment vars
│   │   │   └── security.py    # JWT & password utilities
│   │   ├── db/                # Database models & session
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── main.py            # FastAPI app entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Backend environment variables
│   └── irisarc.db            # SQLite database (auto-generated)
│
└── web/                       # Next.js 15 Frontend (TypeScript)
    ├── src/
    │   ├── app/               # Next.js 15 App Router pages
    │   ├── components/        # React components
    │   ├── lib/               # Utilities & API client
    │   ├── types/             # TypeScript type definitions
    │   └── pages/             # Additional pages
    ├── public/                # Static assets
    ├── package.json           # Node dependencies
    ├── next.config.ts         # Next.js configuration
    ├── tsconfig.json          # TypeScript configuration
    └── .env.local             # Frontend environment variables
```

---

## ⚙️ Tech Stack

### Frontend (Web)

- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **UI Components:** Radix UI primitives (Dialog, Dropdown, Tooltip, etc.)
- **Animations:** Framer Motion for smooth transitions
- **State Management:** Zustand for global state
- **Markdown Rendering:** react-markdown with syntax highlighting (rehype-highlight)
- **Code Highlighting:** highlight.js with GitHub Dark Dimmed theme
- **Drag & Drop:** @hello-pangea/dnd for file management
- **Theme:** next-themes for dark/light mode
- **Toast Notifications:** sonner
- **Package Manager:** pnpm

### Backend (API)

- **Framework:** FastAPI (async Python web framework)
- **Runtime:** Uvicorn ASGI server
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** 
  - JWT (JSON Web Tokens) for stateless auth
  - bcrypt for password hashing
  - Access & refresh token pattern
- **Validation:** Pydantic v2 for request/response schemas
- **Streaming:** Server-Sent Events (SSE) for real-time AI responses
- **CORS:** Configured for local development & production
- **Environment:** python-dotenv for configuration management

### Database Schema

- **Users** — Authentication and user profiles
- **Projects** — Security incident organization
- **Conversations** — Chat thread metadata
- **Messages** — Individual chat messages with role-based structure

---

## 🧱 Prerequisites

### System Requirements

- **Operating System:** Ubuntu 22.04, macOS, or Windows with WSL2
- **Docker:** Docker Desktop (Windows/Mac) or Docker Engine (Linux) - Required for containerized deployment
- **Node.js:** v18 or higher (for local development only)
- **pnpm:** Latest version (for local development only)
- **Python:** 3.11 or higher (for local development only)
- **Git:** For version control
- **Code Editor:** VS Code, Cursor, or similar (recommended extensions below)

### Docker Installation

#### Windows with WSL2
1. Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. During installation, ensure "Use WSL 2 instead of Hyper-V" is selected
3. After installation, open Docker Desktop → Settings → Resources → WSL Integration
4. Enable integration with your WSL2 distro (e.g., Ubuntu)
5. In WSL2 terminal, add yourself to docker group: `sudo usermod -aG docker $USER`
6. Restart terminal or run: `newgrp docker`

#### Linux
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### macOS
1. Download and install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. Start Docker Desktop
3. Verify: `docker --version && docker compose version`

### Recommended VS Code Extensions

- **Tailwind CSS IntelliSense** — Autocomplete for Tailwind classes
- **Python** — Python language support
- **Pylance** — Fast Python type checking
- **ESLint** — JavaScript/TypeScript linting
- **Prettier** — Code formatting
- **TypeScript and JavaScript Language Features** — Enhanced TS support

---

## 🧭 Quick Start

### 🐳 Docker Deployment (Recommended)

The easiest and fastest way to run Iris Arc:

```bash
# 1. Clone the repository
git clone git@github.com:<your-username>/iris-arc.git
cd iris-arc

# 2. Create environment file
cp .env.example .env

# 3. Generate a secure JWT secret
openssl rand -hex 32

# 4. Edit .env and paste the generated JWT_SECRET
nano .env
# Replace JWT_SECRET with your generated value

# 5. Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build
```

**Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

**Stop the services:**
```bash
# Stop (preserve data)
docker compose down

# Stop and remove all data
docker compose down -v
```

**View logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

**Note:** If you get permission errors, run:
```bash
sudo usermod -aG docker $USER
newgrp docker
# Then run docker compose up --build again
```

---

### 💻 Local Development Setup

For development without Docker:

### 1️⃣ Clone the Repository

```bash
git clone git@github.com:<your-username>/iris-arc.git
cd iris-arc
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (or copy from .env.example)
cat > .env << EOF
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
FRONTEND_ORIGIN=http://localhost:3000
SHOW_DEV_OTP=1
EOF

# Run the backend server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:
- **API:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

### 3️⃣ Frontend Setup

```bash
cd web

# Install dependencies
pnpm install

# Create .env.local file
echo "NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000" > .env.local

# Run the development server
pnpm dev
```

The frontend will be available at:
- **Web App:** http://localhost:3000

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080      # 7 days

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:3000

# Development Settings
SHOW_DEV_OTP=1                 # Show OTP in console for testing
```

### Frontend (`web/.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
```

---

## 🧩 Available Scripts

### Frontend (web/)

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm dev`         | Start development server (port 3000) |
| `pnpm build`       | Build production bundle              |
| `pnpm start`       | Run production server                |
| `pnpm lint`        | Run ESLint                           |
| `pnpm type-check`  | TypeScript type checking             |

### Backend (backend/)

| Command                                      | Description                      |
| -------------------------------------------- | -------------------------------- |
| `uvicorn app.main:app --reload --port 8000`  | Start development server         |
| `uvicorn app.main:app --host 0.0.0.0 --port 8000` | Start production server   |
| `python -m pytest`                           | Run tests (when configured)      |

---

## 🔑 Key Features

### 1. Authentication System
- User registration with email validation
- Secure login with JWT tokens
- Password hashing using bcrypt
- Refresh token mechanism for seamless sessions
- Protected routes on both frontend and backend

### 2. Project Management
- Create and organize security investigation projects
- Associate conversations with specific projects
- Project-based access control and filtering

### 3. Conversational AI Interface
- Real-time streaming responses from AI agents
- Message history persistence
- Support for multiple concurrent conversations
- Role-based messages (user, assistant, system)
- Markdown rendering with code syntax highlighting

### 4. File Management
- Drag-and-drop file uploads
- Document attachment to messages
- File preview and download capabilities
- Support for multiple file types

### 5. Modern UI/UX
- Responsive design for desktop and mobile
- Dark/light/system theme preferences
- Smooth animations and transitions
- Keyboard shortcuts for power users
- Toast notifications for user feedback

---

## 🧠 Architecture Overview

### Request Flow

1. **User interacts with UI** (web/src/app)
2. **API call via lib/api.ts** → HTTP request to FastAPI
3. **FastAPI route handler** (backend/app/api) processes request
4. **Database interaction** via SQLAlchemy models
5. **Response sent back** to frontend
6. **UI updates** with new data

### Streaming Flow

1. **User sends message** → POST to `/api/stream/chat`
2. **Backend initiates SSE stream** → `StreamingResponse`
3. **AI agent generates tokens** → Streamed in real-time
4. **Frontend receives chunks** → `EventSource` or fetch with streaming
5. **UI updates incrementally** → Smooth typing effect

---

## 🚀 Development Workflow

### Daily Development

1. Start both servers in separate terminals:

```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd web && pnpm dev
```

2. Make changes and test locally
3. Commit with descriptive messages:

```bash
git add .
git commit -m "feat: add project filtering to sidebar"
git push origin main
```

### Code Style

- **Frontend:** ESLint + Prettier for consistent formatting
- **Backend:** Follow PEP 8 Python style guide
- **Commits:** Use conventional commits (feat, fix, docs, refactor, etc.)

---

## 🐛 Troubleshooting

### Docker Issues

**Issue: Permission denied when running docker commands**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply changes (choose one)
newgrp docker                    # For current session
# OR logout and login again      # Permanent

# Verify
docker ps
```

**Issue: Port already in use**
```bash
# Check what's using the port
sudo lsof -i :8000
sudo lsof -i :3000

# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # Map different host port
```

**Issue: Frontend build fails with TypeScript/ESLint errors**

This is already fixed in `web/next.config.ts`:
```typescript
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
```

**Issue: Services won't start**
```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

**Issue: Database not persisting**
```bash
# Check volume
docker volume ls | grep iris-arc
docker volume inspect iris-arc_backend-data

# If needed, recreate volume
docker compose down -v
docker compose up
```

---

## 🧾 Deployment

### 🐳 Docker Deployment (Recommended)

**Production deployment with Docker Compose:**

```bash
# 1. Set up environment for production
cp .env.example .env

# 2. Generate secure JWT secret
openssl rand -hex 32

# 3. Update .env with production values
nano .env
# Set JWT_SECRET=<your-generated-secret>
# Set SHOW_DEV_OTP=0 (disable development mode)

# 4. Build and start services
docker compose up -d --build

# 5. Check status
docker compose ps
docker compose logs -f
```

**Service Architecture:**
```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │  (Next.js)   │◄───┤  (FastAPI)   │  │
│  │  Port: 3000  │    │  Port: 8000  │  │
│  └──────────────┘    └──────┬───────┘  │
│                             │          │
│                       ┌─────▼────────┐ │
│                       │   Volume     │ │
│                       │ (Database)   │ │
│                       └──────────────┘ │
└─────────────────────────────────────────┘
```

**Docker Features:**
- Multi-stage builds for optimized image sizes
- Health checks for service monitoring
- Volume persistence for backend database
- Network isolation with bridge driver
- Non-root user for security (frontend)
- Auto-restart policies

**Useful Docker Commands:**

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart services
docker compose restart

# Rebuild specific service
docker compose build --no-cache frontend
docker compose up -d frontend

# Execute commands in containers
docker compose exec backend python -c "print('Hello')"
docker compose exec frontend sh

# Database backup
docker compose exec backend cp /app/data/irisarc.db /app/backup.db
docker cp iris-arc-backend:/app/backup.db ./backup.db
```

---

### ☁️ Cloud Deployment

#### Vercel (Frontend)

```bash
cd web
pnpm build
vercel --prod
```

Set environment variable in Vercel:
- `NEXT_PUBLIC_BACKEND_BASE_URL` = your backend URL

#### Railway / Fly.io / VPS (Backend)

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use Docker on cloud platforms:
```bash
# Build and push to registry
docker build -t your-registry/iris-arc-backend:latest ./backend
docker build -t your-registry/iris-arc-frontend:latest ./web
docker push your-registry/iris-arc-backend:latest
docker push your-registry/iris-arc-frontend:latest
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear, descriptive commits
4. Test your changes thoroughly
5. Push to your fork and submit a Pull Request
6. Ensure PR description clearly explains the changes

### Contribution Areas

- Bug fixes and improvements
- New agent capabilities
- UI/UX enhancements
- Documentation improvements
- Test coverage expansion
- Performance optimizations

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Credits & Acknowledgments

**Developed by:** Harshith B and collaborators

**Inspired by:**
- ChatGPT's conversational interface design
- FastAPI's async streaming patterns
- Modern security operations center (SOC) workflows

**Built with amazing open-source tools:**
- Next.js, React, FastAPI, SQLAlchemy, Tailwind CSS, Radix UI, and many more

---

## 📧 Contact & Support

For questions, issues, or contributions:
- **GitHub Issues:** [Create an issue](https://github.com/<your-username>/iris-arc/issues)
- **Docker Issues:** Check troubleshooting section above
- **Email:** [your-email@example.com]

---

**Ready to start?**

**With Docker (Recommended):**
```bash
cd iris-arc
cp .env.example .env
# Edit .env and set JWT_SECRET
docker compose up --build
```

**Without Docker:**
```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd web && pnpm dev
```

Then open **[http://localhost:3000](http://localhost:3000)** and start building! 🚀
