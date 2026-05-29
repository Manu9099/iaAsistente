from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from core.config import settings
import httpx
from bs4 import BeautifulSoup

router = APIRouter()
client = Groq(api_key=settings.GROQ_API_KEY)

class BrowserRequest(BaseModel):
    url: str
    question: str = "¿Qué información importante hay en esta página?"

@router.post("/scrape")
async def scrape_page(req: BrowserRequest):
    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as http:
        response = await http.get(req.url, headers={"User-Agent": "Mozilla/5.0"})
        html = response.text

    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    content = soup.get_text(separator="\n", strip=True)[:4000]

    result = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "Eres Jarvis. Analiza el contenido de páginas web y responde preguntas sobre ellas en español."
            },
            {
                "role": "user",
                "content": f"Contenido de {req.url}:\n\n{content}\n\nPregunta: {req.question}"
            }
        ]
    )

    return {"analysis": result.choices[0].message.content}