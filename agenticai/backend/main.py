from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from api.routes import agents, workflows, executions, insights
from utils.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield

app = FastAPI(
    title="Agentic AI Workflow Automation Platform",
    description="Multi-agent orchestration platform using LangChain, LangGraph, OpenAI and Anthropic Claude",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(executions.router, prefix="/api/executions", tags=["Executions"])
app.include_router(insights.router, prefix="/api/insights", tags=["RAG Insights"])

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "agentic-ai-platform", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
