"""
MaternaAI — FastAPI Backend
Serves the React frontend and exposes REST endpoints for the agent.

Run with:
    uvicorn app.api:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import sys, os

sys.path.insert(0, str(Path(__file__).parent.parent))

app = FastAPI(title="MaternaAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-load agent so API starts even without models
_agent = None

def get_agent():
    global _agent
    if _agent is None:
        from agent.materna_agent import MaternaAgent
        _agent = MaternaAgent()
    return _agent


class ChatRequest(BaseModel):
    message: str
    patient_context: dict


class ChatResponse(BaseModel):
    response: str
    urgency: str
    risk_scores: dict
    rag_sources: list
    week: int = 0


@app.get("/health")
def health():
    return {"status": "ok", "model": "gemini-3.1-pro-preview"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        agent = get_agent()
        result = agent.respond(req.message, req.patient_context)
        return ChatResponse(
            response=result["response"],
            urgency=result.get("urgency", "normal"),
            risk_scores=result.get("risk_scores", {}),
            rag_sources=result.get("rag_sources", []),
            week=int(req.patient_context.get("gestational_week") or 0)
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reset")
def reset():
    global _agent
    if _agent:
        _agent.reset_chat()
    return {"status": "reset"}