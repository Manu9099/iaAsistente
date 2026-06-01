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
    },
    {
        "type": "function",
        "function": {
            "name": "reply_email",
            "description": "Responde un correo electrónico existente en Gmail",
            "parameters": {
                "type": "object",
                "properties": {
                    "thread_id": {"type": "string", "description": "ID del hilo del correo"},
                    "message_id": {"type": "string", "description": "ID del mensaje original"},
                    "to": {"type": "string", "description": "Email del destinatario"},
                    "subject": {"type": "string", "description": "Asunto del correo original"},
                    "body": {"type": "string", "description": "Cuerpo de la respuesta"}
                },
                "required": ["thread_id", "message_id", "to", "subject", "body"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_inbox",
            "description": "Obtiene los últimos correos del inbox de Gmail",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "search_emails",
            "description": "Busca correos específicos en Gmail por remitente, asunto o palabra clave",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Término de búsqueda, ej: 'from:juan@gmail.com' o 'subject:reunión'"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_email",
            "description": "Lee el contenido completo de un correo específico",
            "parameters": {
                "type": "object",
                "properties": {
                    "message_id": {"type": "string", "description": "ID del mensaje a leer"}
                },
                "required": ["message_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_word",
            "description": "Crea un documento Word y lo guarda en el computador",
            "parameters": {
                "type": "object",
                "properties": {
                    "filename": {"type": "string", "description": "Nombre del archivo sin extensión"},
                    "content": {"type": "string", "description": "Contenido del documento"},
                    "folder": {"type": "string", "description": "Subcarpeta donde guardar (opcional)"}
                },
                "required": ["filename", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_excel",
            "description": "Crea un archivo Excel con datos y lo guarda en el computador",
            "parameters": {
                "type": "object",
                "properties": {
                    "filename": {"type": "string", "description": "Nombre del archivo sin extensión"},
                    "headers": {"type": "array", "items": {"type": "string"}, "description": "Encabezados de columnas"},
                    "data": {"type": "array", "items": {"type": "array"}, "description": "Filas de datos"},
                    "folder": {"type": "string", "description": "Subcarpeta donde guardar (opcional)"}
                },
                "required": ["filename", "data"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "open_app",
            "description": "Abre una aplicación en el computador como Word, Excel, Spotify, Chrome",
            "parameters": {
                "type": "object",
                "properties": {
                    "app": {"type": "string", "description": "Nombre de la aplicación: word, excel, spotify, chrome, notepad, calculator"}
                },
                "required": ["app"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "open_document",
            "description": "Abre un documento Word o Excel guardado por Jarvis",
            "parameters": {
                "type": "object",
                "properties": {
                    "filename": {"type": "string", "description": "Nombre del archivo a abrir"},
                    "folder": {"type": "string", "description": "Subcarpeta donde está guardado (opcional)"}
                },
                "required": ["filename"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "play_song",
            "description": "Reproduce una canción en Spotify",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Nombre de la canción o artista a reproducir"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "pause_music",
            "description": "Pausa la música en Spotify",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "next_song",
            "description": "Pasa a la siguiente canción en Spotify",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "current_song",
            "description": "Muestra qué canción está sonando en Spotify",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
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
    elif name == "reply_email":
        from api.routes.automation import reply_email, ReplyRequest
        result = await reply_email(ReplyRequest(**args))
        return f"Respuesta enviada a {result['to']}"
    elif name == "get_inbox":
        from api.routes.automation import get_inbox
        result = await get_inbox()
        emails = "\n".join([f"- De: {e['from']} | Asunto: {e['subject']} | ID: {e['id']}" for e in result])
        return f"Últimos correos:\n{emails}"
    elif name == "search_emails":
        from api.routes.automation import search_emails
        result = await search_emails(query=args["query"])
        emails = "\n".join([f"- De: {e['from']} | Asunto: {e['subject']} | ID: {e['id']} | Thread: {e['thread_id']}" for e in result])
        return f"Correos encontrados:\n{emails}"
    elif name == "read_email":
        from api.routes.automation import read_email
        result = await read_email(message_id=args["message_id"])
        return f"Correo de {result['from']}\nAsunto: {result['subject']}\nFecha: {result['date']}\n\nContenido:\n{result['body']}"
    elif name == "create_word":
        from api.routes.computer import create_word, WordRequest
        result = await create_word(WordRequest(**args))
        return f"Documento Word creado en: {result['path']}"
    elif name == "create_excel":
        from api.routes.computer import create_excel, ExcelRequest
        result = await create_excel(ExcelRequest(**args))
        return f"Archivo Excel creado en: {result['path']}"
    elif name == "open_app":
        from api.routes.computer import open_file, AppRequest
        result = await open_file(AppRequest(app=args["app"]))
        return f"Aplicación {result['app']} abierta"
    elif name == "open_document":
        from api.routes.computer import open_document, OpenFileRequest
        result = await open_document(OpenFileRequest(**args))
        return f"Documento abierto: {result['path']}"
    elif name == "play_song":
        from api.routes.spotify import play_song, PlayRequest
        result = await play_song(PlayRequest(query=args["query"]))
        if result["status"] == "reproduciendo":
            return f"Reproduciendo {result['song']} de {result['artist']}"
        return f"Error: {result.get('detail', 'No se pudo reproducir')}"
    elif name == "pause_music":
        from api.routes.spotify import pause
        result = await pause()
        return "Música pausada"
    elif name == "next_song":
        from api.routes.spotify import next_track
        result = await next_track()
        return "Siguiente canción"
    elif name == "current_song":
        from api.routes.spotify import current_track
        result = await current_track()
        if "song" in result:
            return f"Sonando: {result['song']} de {result['artist']}"
        return "No hay nada reproduciendo"

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