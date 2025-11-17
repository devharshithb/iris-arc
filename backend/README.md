# 🔧 Iris Arc Backend — FastAPI Server

This is the **backend server** for Iris Arc, built with **FastAPI** and **Python 3.11+**. It provides a RESTful API with real-time streaming capabilities for AI-powered cybersecurity incident response.

---

## 📋 Overview

The backend handles:

- **Authentication** — JWT-based user authentication with bcrypt password hashing
- **Project Management** — CRUD operations for security investigation projects
- **Chat Management** — Conversation threads and message persistence
- **Real-time Streaming** — Server-Sent Events (SSE) for AI response streaming
- **Database Operations** — SQLite with SQLAlchemy ORM for data persistence
- **API Documentation** — Auto-generated OpenAPI/Swagger docs

---

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   └── routes.py       # Login, register, token refresh
│   │   ├── chats/
│   │   │   ├── __init__.py
│   │   │   └── routes.py       # Chat CRUD operations
│   │   ├── projects/
│   │   │   ├── __init__.py
│   │   │   └── routes.py       # Project management
│   │   └── stream/
│   │       ├── __init__.py
│   │       └── routes.py       # SSE streaming endpoints
│   ├── core/                   # Core configurations
│   │   ├── config.py           # Settings & env variables
│   │   └── security.py         # JWT & password utilities
│   ├── db/                     # Database configuration
│   │   ├── __init__.py
│   │   └── session.py          # SQLAlchemy setup
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py             # User model
│   │   ├── project.py          # Project model
│   │   ├── conversation.py     # Conversation model
│   │   └── message.py          # Message model
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py             # Auth request/response schemas
│   │   ├── project.py          # Project schemas
│   │   └── chat.py             # Chat schemas
│   └── main.py                 # FastAPI app entry point
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (DO NOT commit)
└── irisarc.db                  # SQLite database (auto-generated)
```

---

## ⚙️ Tech Stack

- **Framework:** FastAPI 0.115.4
- **ASGI Server:** Uvicorn 0.32.0
- **Database:** SQLite with SQLAlchemy 2.0.36
- **Authentication:** PyJWT 2.9.0 + bcrypt 4.1.2
- **Validation:** Pydantic 2.9.2
- **Environment:** python-dotenv 1.2.1
- **HTTP Client:** httpx 0.27.2 (for external API calls)

---

## 🚀 Getting Started

### Option 1: Using Docker (Recommended)

The backend is automatically built and run when using the main project's Docker setup:

```bash
# From project root
cd /path/to/iris-arc
docker compose up backend
```

This will:
- Build the Python 3.11-slim Docker image
- Install all dependencies from requirements.txt
- Start Uvicorn on port 8000
- Create database volume for persistence
- Set up health checks

### Option 2: Local Development

For local development without Docker:

### Prerequisites

- Python 3.11 or higher
- pip or uv package manager
- Virtual environment tool (venv, virtualenv, or conda)

### Installation

1. **Navigate to backend directory**

```bash
cd backend
```

2. **Create and activate virtual environment**

```bash
# Create virtual environment
python3 -m venv venv

# Activate (Linux/macOS)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set up environment variables**

Create a `.env` file in the `backend/` directory:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:3000

# Development Settings
SHOW_DEV_OTP=1
```

5. **Run the development server**

```bash
uvicorn app.main:app --reload --port 8000
```

The server will start at:
- **API:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint                  | Description                    | Auth Required |
| ------ | ------------------------- | ------------------------------ | ------------- |
| POST   | `/api/auth/register`      | Register new user              | No            |
| POST   | `/api/auth/login`         | Login and get access token     | No            |
| POST   | `/api/auth/refresh`       | Refresh access token           | Yes           |
| GET    | `/api/auth/me`            | Get current user info          | Yes           |

### Projects (`/api/projects`)

| Method | Endpoint                  | Description                    | Auth Required |
| ------ | ------------------------- | ------------------------------ | ------------- |
| GET    | `/api/projects`           | List all user's projects       | Yes           |
| POST   | `/api/projects`           | Create new project             | Yes           |
| GET    | `/api/projects/{id}`      | Get project by ID              | Yes           |
| PUT    | `/api/projects/{id}`      | Update project                 | Yes           |
| DELETE | `/api/projects/{id}`      | Delete project                 | Yes           |

### Chats (`/api/chats`)

| Method | Endpoint                           | Description                    | Auth Required |
| ------ | ---------------------------------- | ------------------------------ | ------------- |
| GET    | `/api/chats`                       | List all conversations         | Yes           |
| POST   | `/api/chats`                       | Create new conversation        | Yes           |
| GET    | `/api/chats/{id}`                  | Get conversation by ID         | Yes           |
| DELETE | `/api/chats/{id}`                  | Delete conversation            | Yes           |
| GET    | `/api/chats/{id}/messages`         | Get messages in conversation   | Yes           |
| POST   | `/api/chats/{id}/messages`         | Add message to conversation    | Yes           |

### Streaming (`/api/stream`)

| Method | Endpoint                  | Description                    | Auth Required |
| ------ | ------------------------- | ------------------------------ | ------------- |
| POST   | `/api/stream/chat`        | Stream AI response (SSE)       | Yes           |

---

## 🔐 Authentication Flow

### 1. User Registration

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

### 2. User Login

```bash
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=SecurePass123!
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Using Access Token

Add the token to the `Authorization` header:

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Token Refresh

```bash
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

---

## 🗄️ Database Models

### User Model

```python
class User:
    id: int
    email: str (unique)
    hashed_password: str
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

### Project Model

```python
class Project:
    id: int
    name: str
    description: str
    user_id: int (foreign key)
    created_at: datetime
    updated_at: datetime
```

### Conversation Model

```python
class Conversation:
    id: int
    title: str
    project_id: int (foreign key)
    user_id: int (foreign key)
    created_at: datetime
    updated_at: datetime
```

### Message Model

```python
class Message:
    id: int
    conversation_id: int (foreign key)
    role: str (user, assistant, system)
    content: str
    created_at: datetime
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

| Variable             | Description                          | Default               | Required |
| -------------------- | ------------------------------------ | --------------------- | -------- |
| `JWT_SECRET`         | Secret key for JWT encoding          | -                     | Yes      |
| `JWT_ALGORITHM`      | Algorithm for JWT                    | `HS256`               | Yes      |
| `JWT_EXPIRE_MINUTES` | Access token expiration (minutes)    | `10080` (7 days)      | Yes      |
| `FRONTEND_ORIGIN`    | Frontend URL for CORS                | `http://localhost:3000` | Yes    |
| `SHOW_DEV_OTP`       | Show OTP in console (dev only)       | `0`                   | No       |

### CORS Configuration

The backend is configured to accept requests from the frontend origin specified in `.env`. For production, update `FRONTEND_ORIGIN` to your deployed frontend URL.

---

## 🧪 Testing

### Manual Testing with cURL

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=test@example.com&password=Test123!'
```

**Create a project:**
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incident Investigation",
    "description": "Ransomware attack analysis"
  }'
```

### Testing with Interactive Docs

Visit http://localhost:8000/docs for the interactive Swagger UI where you can test all endpoints with a visual interface.

---

## 📦 Dependencies

Key dependencies from `requirements.txt`:

```
fastapi==0.115.4          # Web framework
uvicorn==0.32.0           # ASGI server
SQLAlchemy==2.0.36        # ORM
pydantic==2.9.2           # Data validation
PyJWT==2.9.0              # JWT tokens
bcrypt==4.1.2             # Password hashing
python-dotenv==1.2.1      # Environment variables
httpx==0.27.2             # HTTP client
python-multipart==0.0.12  # File upload support
```

See `requirements.txt` for the complete list.

---

## 🚀 Deployment

### Docker Deployment (Recommended)

The backend Dockerfile is optimized for production:

```dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Health check
HEALTHCHECK CMD python -c "import requests; requests.get('http://localhost:8000/')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run:**
```bash
# From backend directory
docker build -t iris-arc-backend .
docker run -p 8000:8000 --env-file .env iris-arc-backend

# Or use docker-compose from project root
cd ..
docker compose up backend
```

**Docker Features:**
- Health checks for monitoring
- Volume support for database persistence
- Environment variable configuration
- Optimized layer caching

---

### Production Server (Without Docker)

For production, use more workers and disable reload:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Gunicorn (Recommended for Production)

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t iris-arc-backend .
docker run -p 8000:8000 --env-file .env iris-arc-backend
```

### Environment Variables for Production

Update your `.env` for production:

```bash
JWT_SECRET=<strong-random-secret-generate-with-openssl>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
FRONTEND_ORIGIN=https://your-frontend-domain.com
SHOW_DEV_OTP=0
```

Generate a secure secret:
```bash
openssl rand -hex 32
```

---

## 🛠️ Development

### Running in Development Mode

```bash
# Activate virtual environment
source venv/bin/activate

# Run with auto-reload
uvicorn app.main:app --reload --port 8000
```

### Adding New Endpoints

1. Create a new router in `app/api/<module>/routes.py`
2. Define your Pydantic schemas in `app/schemas/<module>.py`
3. Create database models if needed in `app/models/<module>.py`
4. Import and include the router in `app/main.py`

Example:

```python
# In app/api/mymodule/routes.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/mymodule", tags=["mymodule"])

@router.get("/")
async def get_items():
    return {"items": []}

# In app/main.py
from app.api.mymodule.routes import router as mymodule_router
app.include_router(mymodule_router)
```

### Database Migrations

Currently using SQLAlchemy's `create_all()` for simple schema creation. For production, consider using Alembic for migrations:

```bash
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** `ModuleNotFoundError: No module named 'app'`
```bash
# Make sure you're running from the backend/ directory
cd backend
uvicorn app.main:app --reload
```

**Issue:** Database locked error
```bash
# Stop all running instances and delete the database
rm irisarc.db
# Restart the server to recreate the database
```

**Issue:** CORS errors
```bash
# Check that FRONTEND_ORIGIN in .env matches your frontend URL
# For local development: http://localhost:3000
```

**Issue:** JWT decode error
```bash
# Ensure JWT_SECRET is set in .env
# Make sure you're using the correct token from login response
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [JWT Best Practices](https://jwt.io/introduction)

---

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. Code follows PEP 8 style guidelines
2. New endpoints include appropriate Pydantic schemas
3. Authentication is properly enforced where needed
4. API documentation is updated for new endpoints

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**For the complete project documentation, see the main [README.md](../README.md) in the root directory.**
