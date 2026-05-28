from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.chat import router as chat_router
from api.routes.voice import router as voice_router
from api.routes.memory import router as memory_router
from core.config import settings
from core.database import engine
from core import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(voice_router, prefix="/api/voice")
app.include_router(memory_router, prefix="/api/memory")

@app.get("/")
async def root():
    return {"status": "online", "system": settings.APP_NAME}