from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents.jarvis_agents import detect_agent, run_agent, AGENTS

router = APIRouter()

class AgentRequest(BaseModel):
    message: str
    history: list = []
    agent: str = "auto"

def stream_agent(message: str, history: list, agent_type: str):
    if agent_type == "auto":
        agent_type = detect_agent(message)
    
    agent_name = AGENTS.get(agent_type, {}).get("name", "Jarvis")
    yield f"🤖 [{agent_name}]\n"
    
    for chunk in run_agent(agent_type, message, history):
        yield chunk

@router.post("/run")
async def run(request: AgentRequest):
    return StreamingResponse(
        stream_agent(request.message, request.history, request.agent),
        media_type="text/plain"
    )

@router.get("/list")
async def list_agents():
    return [{"id": k, "name": v["name"]} for k, v in AGENTS.items()]