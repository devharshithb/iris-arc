# Quick Start Guide - Iris Arc

## 🚀 Running the Application

### Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate  # or: venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

Backend will run at: http://127.0.0.1:8000
API Docs: http://127.0.0.1:8000/docs

### Frontend (Terminal 2)
```bash
cd web
pnpm install  # if first time
pnpm dev
```

Frontend will run at: http://localhost:3000

## 🔑 Environment Setup

### Backend `.env`
Already configured in `backend/.env`

### Frontend `.env.local`
```bash
NEXT_PUBLIC_BACKEND_BASE_URL=http://127.0.0.1:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cc6383bb0f6e16ff87051d13771750fb
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📝 Testing the Application

1. **Sign up**: Navigate to http://localhost:3000/signup
   - Enter name, email, and password
   - Click "Create account"

2. **Login**: Navigate to http://localhost:3000/login
   - Enter email and password
   - Click "Continue"

3. **Chat**: After login, you'll see the main chat interface
   - Create new chats
   - Send messages
   - View streaming responses

## 🔍 Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Signup creates a new user
- [ ] Login works with created credentials
- [ ] Chats are user-specific (logged in users only see their chats)
- [ ] Messages persist correctly
- [ ] Streaming endpoint responds

## 🐛 Troubleshooting

**Backend won't start:**
- Check Python version: `python --version` (needs 3.11+)
- Reinstall dependencies: `pip install -r requirements.txt`

**Frontend won't start:**
- Check Node version: `node --version` (needs 18+)
- Reinstall dependencies: `rm -rf node_modules && pnpm install`

**API calls failing:**
- Verify `NEXT_PUBLIC_BACKEND_BASE_URL` doesn't have `/api` suffix
- Check backend is running on port 8000
- Check browser console for CORS errors

**Database errors:**
- Delete `backend/irisarc.db` and restart backend (will recreate)

## 📊 Database Inspection

```bash
cd backend
sqlite3 irisarc.db
.tables
.schema users
.schema chats
.schema messages
SELECT * FROM users;
```

## 🎯 Ready for LLM Integration

All core infrastructure is ready. Next step is to:
1. Choose LLM provider (OpenAI, Anthropic, Google, etc.)
2. Update `/api/chat/stream` endpoint with actual LLM calls
3. Implement any RAG or multi-agent logic

See `VERIFICATION.md` for detailed system documentation.
