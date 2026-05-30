from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from playwright.async_api import async_playwright
from groq import Groq
from core.config import settings
import base64

router = APIRouter()
client = Groq(api_key=settings.GROQ_API_KEY)

class BrowserRequest(BaseModel):
    url: str
    question: str = "¿Qué información importante hay en esta página?"

class ScriptRequest(BaseModel):
    task: str

@router.post("/screenshot")
async def take_screenshot(req: BrowserRequest):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(req.url, wait_until="networkidle")
        screenshot = await page.screenshot(full_page=False)
        await browser.close()

    base64_image = base64.b64encode(screenshot).decode("utf-8")

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{base64_image}"}
                    },
                    {
                        "type": "text",
                        "text": f"Eres Jarvis. Analiza esta página web y responde: {req.question}"
                    }
                ]
            }
        ],
        max_tokens=1024
    )

    return {
        "analysis": response.choices[0].message.content,
        "screenshot": base64_image
    }

@router.post("/scrape")
async def scrape_page(req: BrowserRequest):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(req.url, wait_until="networkidle")
        content = await page.inner_text("body")
        await browser.close()

    content = content[:4000]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "Eres Jarvis. Analiza el contenido de páginas web y responde preguntas sobre ellas."
            },
            {
                "role": "user",
                "content": f"Contenido de {req.url}:\n\n{content}\n\nPregunta: {req.question}"
            }
        ]
    )

    return {"analysis": response.choices[0].message.content}