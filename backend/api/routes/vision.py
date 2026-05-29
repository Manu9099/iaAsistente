from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from groq import Groq
from core.config import settings
import base64

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY)

class VisionQuery(BaseModel):
    question: str = "¿Qué ves en esta imagen? Describe detalladamente."

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    question: str = "¿Qué ves en esta imagen? Describe detalladamente."
):
    image_bytes = await file.read()
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    ext = file.filename.split(".")[-1].lower()
    media_type = f"image/{ext}" if ext != "jpg" else "image/jpeg"

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{base64_image}"
                        }
                    },
                    {
                        "type": "text",
                        "text": f"Eres Jarvis, un asistente IA avanzado. {question}"
                    }
                ]
            }
        ],
        max_tokens=1024
    )

    return {"analysis": response.choices[0].message.content}