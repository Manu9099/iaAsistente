from groq import Groq
from core.config import settings
import json

client = Groq(api_key=settings.GROQ_API_KEY)

AGENTS = {
    "research": {
        "name": "Research Agent",
        "prompt": "Eres un agente especializado en investigación. Buscas información detallada, analizas datos y produces resúmenes completos y precisos. Respondes siempre en español."
    },
    "coding": {
        "name": "Coding Agent", 
        "prompt": "Eres un agente especializado en programación. Escribes código limpio, explicas conceptos técnicos y resuelves problemas de desarrollo. Respondes siempre en español."
    },
    "content": {
        "name": "Content Agent",
        "prompt": "Eres un agente especializado en creación de contenido. Escribes posts para LinkedIn, artículos y textos persuasivos y profesionales. Respondes siempre en español."
    },
    "productivity": {
        "name": "Productivity Agent",
        "prompt": "Eres un agente especializado en productividad. Organizas tareas, priorizas actividades y ayudas a planificar proyectos de forma eficiente. Respondes siempre en español."
    }
}

def detect_agent(message: str) -> str:
    detection_prompt = f"""Analiza este mensaje y determina qué agente especializado debe responder.
    
Agentes disponibles:
- research: para investigación, búsqueda de información, análisis
- coding: para programación, código, desarrollo, bugs, arquitectura
- content: para posts LinkedIn, artículos, redacción, marketing
- productivity: para tareas, planificación, organización, agenda

Mensaje: "{message}"

Responde SOLO con el nombre del agente: research, coding, content, o productivity."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": detection_prompt}],
        max_tokens=10
    )
    
    agent = response.choices[0].message.content.strip().lower()
    return agent if agent in AGENTS else "research"

def run_agent(agent_type: str, message: str, history: list = []):
    agent = AGENTS.get(agent_type, AGENTS["research"])
    
    messages = [{"role": "system", "content": agent["prompt"]}]
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