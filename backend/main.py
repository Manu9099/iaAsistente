from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.chat import router as chat_router
from api.routes.voice import router as voice_router
from api.routes.memory import router as memory_router
from api.routes.documents import router as documents_router
from api.routes.auth import router as auth_router
from api.routes.automation import router as automation_router
from api.routes.agents import router as agents_router
from api.routes.vision import router as vision_router
from api.routes.browser import router as browser_router
from api.routes.career import router as career_router
from api.routes.computer import router as computer_router
from api.routes.spotify import router as spotify_router
from api.routes.microsoft import router as microsoft_router
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
app.include_router(documents_router, prefix="/api/documents")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(automation_router, prefix="/api/automation")
app.include_router(agents_router, prefix="/api/agents")
app.include_router(vision_router, prefix="/api/vision")
app.include_router(browser_router, prefix="/api/browser")
app.include_router(career_router, prefix="/api/career")
app.include_router(computer_router, prefix="/api/computer")
app.include_router(spotify_router, prefix="/api/spotify")
app.include_router(microsoft_router, prefix="/api/microsoft")

@app.get("/")
async def root():
    return {"status": "online", "system": settings.APP_NAME}