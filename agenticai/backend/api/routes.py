"""FastAPI routes — Agents, Workflows, Executions, Insights"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from datetime import datetime

# ── Agents Router ─────────────────────────────────────────────
router = APIRouter()

AGENTS_DB = [
    {"id": "a1", "name": "MonitorAgent", "type": "monitoring", "model": "claude-3-5-sonnet", "status": "running", "tasks_completed": 1247, "success_rate": 98.2},
    {"id": "a2", "name": "OptimizeAgent", "type": "optimization", "model": "gpt-4o", "status": "running", "tasks_completed": 892, "success_rate": 94.7},
    {"id": "a3", "name": "RAGInsightAgent", "type": "rag", "model": "claude-3-5-sonnet", "status": "running", "tasks_completed": 634, "success_rate": 97.1},
    {"id": "a4", "name": "DataPipelineAgent", "type": "pipeline", "model": "gpt-4o", "status": "idle", "tasks_completed": 421, "success_rate": 99.1},
    {"id": "a5", "name": "AlertTriageAgent", "type": "triage", "model": "claude-3-5-sonnet", "status": "running", "tasks_completed": 2103, "success_rate": 96.4},
]

@router.get("/")
async def list_agents():
    return {"success": True, "agents": AGENTS_DB, "total": len(AGENTS_DB)}

@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    agent = next((a for a in AGENTS_DB if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"success": True, "agent": agent}

class AgentRunRequest(BaseModel):
    task: str
    agent_id: str
    context: Optional[dict] = None

@router.post("/{agent_id}/run")
async def run_agent(agent_id: str, request: AgentRunRequest, background_tasks: BackgroundTasks):
    agent = next((a for a in AGENTS_DB if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    execution_id = str(uuid4())
    return {"success": True, "execution_id": execution_id, "agent": agent["name"], "status": "queued", "task": request.task}
