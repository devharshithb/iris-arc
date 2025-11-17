from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.auth.routes import router as auth_router
from app.api.chats.routes import router as chat_router
from app.api.stream.routes import router as stream_router
from app.core.config import settings
from app.db.session import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("✅ IrisArc Backend started successfully.")
    yield
    # Shutdown
    print("🛑 IrisArc Backend shutting down.")


app = FastAPI(title="IrisArc Backend", version="1.0.0", lifespan=lifespan)
# Create DB tables
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Correct prefixes already defined in routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(stream_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "service": "IrisArc API", "docs": "/docs"}
