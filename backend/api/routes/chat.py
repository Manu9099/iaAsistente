from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from core.config import settings

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = "Eres Jarvis, un asistente IA avanzado. Respondes de forma concisa, inteligente y directa. Eres como el Jarvis de Iron Man: eficiente, sofisticado, proactivo."

class ChatRequest(BaseModel):
    message: str
    history: list = []

def stream_response(message: str, history: list):
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
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_response(request.message, request.history),
        media_type="text/plain"
    )