from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db.session import get_db
from app.models import Chat, Message, User
from app.schemas import (
    ChatCreateIn,
    ChatUpdateIn,
    ChatOut,
    MessageCreateIn,
    MessageOut,
    PaginatedChats,
    PaginatedMessages,
)
from app.core.security import get_current_user

router = APIRouter(prefix="/api/chats", tags=["chats"])

# --------------------------------------------------------------------------
# 📜 List all chats for the current user
# --------------------------------------------------------------------------
@router.get("/", response_model=PaginatedChats)
def list_chats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.updated_at.desc())
        .all()
    )
    return {"items": chats, "total": len(chats)}

# --------------------------------------------------------------------------
# ➕ Create new chat
# --------------------------------------------------------------------------
@router.post("/", response_model=ChatOut, status_code=status.HTTP_201_CREATED)
def create_chat(
    payload: ChatCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = Chat(
        title=payload.title or "New Chat",
        user_id=user.id,
        project_id=payload.project_id,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

# --------------------------------------------------------------------------
# 💬 List messages for a chat
# --------------------------------------------------------------------------
@router.get("/{chat_id}/messages", response_model=PaginatedMessages)
def list_messages(
    chat_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at)
        .all()
    )
    return {"items": messages, "total": len(messages)}

# --------------------------------------------------------------------------
# 📝 Add message
# --------------------------------------------------------------------------
@router.post("/{chat_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def add_message(
    chat_id: int,
    payload: MessageCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    msg = Message(chat_id=chat_id, role=payload.role, content=payload.content)
    db.add(msg)
    chat.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)
    return msg

# --------------------------------------------------------------------------
# 📝 Update (rename) chat
# --------------------------------------------------------------------------
@router.patch("/{chat_id}", response_model=ChatOut)
def update_chat(
    chat_id: int,
    payload: ChatUpdateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    if payload.title is not None:
        chat.title = payload.title
    if payload.project_id is not None:
        chat.project_id = payload.project_id
    
    chat.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(chat)
    return chat

# --------------------------------------------------------------------------
# ❌ Delete chat
# --------------------------------------------------------------------------
@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    db.delete(chat)
    db.commit()
