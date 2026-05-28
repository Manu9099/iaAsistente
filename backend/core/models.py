from sqlalchemy import Column, Integer, String, Text, DateTime, func
from core.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=func.now())

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    key = Column(String)
    value = Column(Text)
    created_at = Column(DateTime, default=func.now())