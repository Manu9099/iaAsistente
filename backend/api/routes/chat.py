from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from core.config import settings
from api.routes.automation import send_email, create_event, EmailRequest, EventRequest
import json

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """Eres Jarvis, un asistente IA avanzado como el de Iron Man.
Respondes de forma concisa, inteligente y directa en español.
Tienes acceso a Gmail y Google Calendar para automatizar tareas reales.
Cuando el usuario pida enviar correos o crear eventos, usa las herramientas disponibles."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "send_email",
            "description": "Envía un correo electrónico via Gmail",
            "parameters": {
                "type": "object",
                "properties": {
                    "to": {"type": "string", "description": "Email del destinatario"},
                    "subject": {"type": "string", "description": "Asunto del correo"},
                    "body": {"type": "string", "description": "Cuerpo del correo"}
                },
                "required": ["to", "subject", "body"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_event",
            "description": "Crea un evento en Google Calendar",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Título del evento"},
                    "date": {"type": "string", "description": "Fecha en formato YYYY-MM-DD"},
                    "time": {"type": "string", "description": "Hora en formato HH:MM"},
                    "duration_hours": {"type": "integer", "description": "Duración en horas"},
                    "description": {"type": "string", "description": "Descripción del evento"}
                },
                "required": ["title", "date", "time"]
            }
        }
    }
]

class ChatRequest(BaseModel):
    message: str
    history: list = []

async def execute_tool(name: str, args: dict) -> str:
    if name == "send_email":
        result = await send_email(EmailRequest(**args))
        return f"Correo enviado a {result['to']}"
    elif name == "create_event":
        result = await create_event(EventRequest(**args))
        return f"Evento creado: {result['link']}"
    return "Herramienta no encontrada"

def stream_response(message: str, history: list):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
        stream=False
    )

    msg = response.choices[0].message

    if msg.tool_calls:
        for tool_call in msg.tool_calls:
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            yield f"⚡ Ejecutando {name}...\n"

            import asyncio
            loop = asyncio.new_event_loop()
            result = loop.run_until_complete(execute_tool(name, args))
            loop.close()
            yield f"✅ {result}\n"

            messages.append({"role": "assistant", "content": None, "tool_calls": [tool_call]})
            messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": result})

        final = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            stream=True
        )
        for chunk in final:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    else:
        if msg.content:
            yield msg.content

@router.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_response(request.message, request.history),
        media_type="text/plain"
    )