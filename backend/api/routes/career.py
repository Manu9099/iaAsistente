from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from core.config import settings
from core.knowledge_loader import load_all_knowledge

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY)

CAREER_KNOWLEDGE = load_all_knowledge()

SYSTEM_PROMPT = f"""Eres Jarvis, un asistente especializado en búsqueda de trabajo y desarrollo de carrera profesional.

Tienes acceso a la metodología Career-Ops, un sistema avanzado de búsqueda de trabajo con IA que incluye:
- Sistema de evaluación de ofertas A-F con 10 dimensiones
- Generación de CVs optimizados para ATS
- Preparación de entrevistas con metodología STAR
- Investigación de empresas
- Scripts de negociación salarial
- Mensajes de contacto para LinkedIn

Usa este conocimiento para ayudar al usuario:

{CAREER_KNOWLEDGE[:8000]}

Respondes siempre en español, de forma concisa y accionable."""

class CareerRequest(BaseModel):
    message: str
    history: list = []

def stream_career(message: str, history: list):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        stream=True
    )

    for chunk in response:
        content = chunk.choices[0].delta.content
        if content:
            yield content

@router.post("/chat")
async def career_chat(request: CareerRequest):
    return StreamingResponse(
        stream_career(request.message, request.history),
        media_type="text/plain"
    )