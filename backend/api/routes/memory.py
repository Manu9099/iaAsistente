from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db
from core.models import Conversation, Memory

router = APIRouter()

class MessageSave(BaseModel):
    session_id: str
    role: str
    content: str

class MemorySave(BaseModel):
    session_id: str
    key: str
    value: str

@router.post("/conversation")
def save_message(data: MessageSave, db: Session = Depends(get_db)):
    msg = Conversation(
        session_id=data.session_id,
        role=data.role,
        content=data.content
    )
    db.add(msg)
    db.commit()
    return {"status": "saved"}

@router.get("/conversation/{session_id}")
def get_conversation(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(Conversation)\
        .filter(Conversation.session_id == session_id)\
        .order_by(Conversation.created_at)\
        .all()
    return [{"role": m.role, "content": m.content} for m in messages]

@router.post("/remember")
def save_memory(data: MemorySave, db: Session = Depends(get_db)):
    existing = db.query(Memory)\
        .filter(Memory.session_id == data.session_id, Memory.key == data.key)\
        .first()
    if existing:
        existing.value = data.value
    else:
        db.add(Memory(session_id=data.session_id, key=data.key, value=data.value))
    db.commit()
    return {"status": "saved"}

@router.get("/remember/{session_id}")
def get_memories(session_id: str, db: Session = Depends(get_db)):
    memories = db.query(Memory)\
        .filter(Memory.session_id == session_id)\
        .all()
    return {m.key: m.value for m in memories}

@router.delete("/conversation/{session_id}")
def clear_conversation(session_id: str, db: Session = Depends(get_db)):
    db.query(Conversation)\
        .filter(Conversation.session_id == session_id)\
        .delete()
    db.commit()
    return {"status": "cleared"}