from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from groq import Groq
from core.config import settings

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY)

@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    
    transcription = client.audio.transcriptions.create(
        file=(audio.filename, audio_bytes, audio.content_type),
        model="whisper-large-v3",
        language="es",
        response_format="text"
    )
    
    return JSONResponse({"text": transcription})