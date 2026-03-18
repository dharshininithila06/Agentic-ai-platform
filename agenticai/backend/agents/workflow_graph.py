"""
LangGraph Agent Workflow Orchestration

Implements a multi-agent system using LangGraph's StateGraph for
workflow automation. Each node in the graph is an AI agent with
specific tools and responsibilities.
"""

from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langchain_core.messages import HumanMessage, AIMessage
import operator
import json
import os

# ── Shared workflow state ─────────────────────────────────────
class WorkflowState(TypedDict):
    task: str
    agent_outputs: Annotated[List[dict], operator.add]
    current_agent: str
    workflow_id: str
    status: str
    final_report: Optional[str]
    iterations: int

# ── Agent tools (LangChain @tool decorator) ───────────────────
@tool
def query_database(query: str) -> str:
    """Execute a read-only database query for monitoring data."""
    # In production: connects to PostgreSQL via SQLAlchemy
    return f"DB Query result for: {query} — [rows: 142, latency: 45ms]"

@tool
def check_api_health(endpoint: str) -> str:
    """Check the health and latency of an API endpoint."""
    import random
    latency = random.randint(80, 450)
    status = "healthy" if latency < 400 else "degraded"
    return f"Endpoint {endpoint}: {status} | p95: {latency}ms | uptime: 99.94%"

@tool
def search_knowledge_base(query: str) -> str:
    """RAG search over operational documents using ChromaDB vector store."""
    # In production: uses ChromaDB with sentence-transformers embeddings
    return f"RAG results for '{query}': Found 5 relevant documents with avg score 0.87"

@tool
def send_alert(message: str, severity: str) -> str:
    """Send an alert to the ops team via Slack/PagerDuty."""
    return f"Alert sent: [{severity.upper()}] {message} — Notified 3 team members"

@tool
def run_optimization(target: str) -> str:
    """Analyze and apply performance optimizations to a target system."""
    return f"Optimization applied to {target}: Query time -34%, Memory -12%, Added 2 indexes"

# ── Agent factory ─────────────────────────────────────────────
def create_monitor_agent():
    """MonitorAgent — uses Claude Sonnet for real-time system monitoring."""
    llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", api_key=os.getenv("ANTHROPIC_API_KEY"))
    tools = [query_database, check_api_health, send_alert]
    return llm.bind_tools(tools)

def create_optimizer_agent():
    """OptimizeAgent — uses GPT-4o for performance analysis."""
    llm = ChatOpenAI(model="gpt-4o", api_key=os.getenv("OPENAI_API_KEY"))
    tools = [query_database, run_optimization]
    return llm.bind_tools(tools)

def create_rag_agent():
    """RAGInsightAgent — uses Claude for document retrieval and insight generation."""
    llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", api_key=os.getenv("ANTHROPIC_API_KEY"))
    tools = [search_knowledge_base, query_database]
    return llm.bind_tools(tools)

# ── Graph node functions ──────────────────────────────────────
async def monitor_node(state: WorkflowState) -> WorkflowState:
    """MonitorAgent node — checks system health and triggers alerts."""
    agent = create_monitor_agent()
    response = await agent.ainvoke([
        HumanMessage(content=f"Monitor system health for task: {state['task']}. Check APIs and database metrics.")
    ])
    return {
        "agent_outputs": [{"agent": "MonitorAgent", "output": response.content, "model": "claude-sonnet"}],
        "current_agent": "OptimizeAgent",
        "iterations": state.get("iterations", 0) + 1,
    }

async def optimize_node(state: WorkflowState) -> WorkflowState:
    """OptimizeAgent node — analyzes bottlenecks and applies fixes."""
    agent = create_optimizer_agent()
    context = str(state.get("agent_outputs", []))
    response = await agent.ainvoke([
        HumanMessage(content=f"Based on monitoring data: {context[:500]}, identify and fix performance bottlenecks.")
    ])
    return {
        "agent_outputs": [{"agent": "OptimizeAgent", "output": response.content, "model": "gpt-4o"}],
        "current_agent": "RAGInsightAgent",
    }

async def rag_insight_node(state: WorkflowState) -> WorkflowState:
    """RAGInsightAgent node — retrieves docs and generates insights report."""
    agent = create_rag_agent()
    all_outputs = state.get("agent_outputs", [])
    response = await agent.ainvoke([
        HumanMessage(content=f"Generate operational insight report based on: {str(all_outputs)[:600]}")
    ])
    return {
        "agent_outputs": [{"agent": "RAGInsightAgent", "output": response.content, "model": "claude-sonnet"}],
        "current_agent": "END",
        "final_report": response.content,
        "status": "complete",
    }

# ── Routing logic (LangGraph conditional edges) ───────────────
def route_after_monitor(state: WorkflowState) -> str:
    """Decide next node based on monitoring results."""
    # Self-correction: if iterations > 3, skip to insights
    if state.get("iterations", 0) > 3:
        return "rag_insight"
    return "optimize"

# ── Build the LangGraph StateGraph ───────────────────────────
def build_workflow_graph() -> StateGraph:
    """
    Builds the LangGraph workflow as a directed state machine.

    Graph structure:
    monitor → optimize → rag_insight → END
         ↑                    |
         └──── (if issues) ───┘
    """
    graph = StateGraph(WorkflowState)

    # Add agent nodes
    graph.add_node("monitor", monitor_node)
    graph.add_node("optimize", optimize_node)
    graph.add_node("rag_insight", rag_insight_node)

    # Set entry point
    graph.set_entry_point("monitor")

    # Add conditional routing
    graph.add_conditional_edges(
        "monitor",
        route_after_monitor,
        {"optimize": "optimize", "rag_insight": "rag_insight"}
    )

    # Linear edges
    graph.add_edge("optimize", "rag_insight")
    graph.add_edge("rag_insight", END)

    return graph.compile()

# ── Execute workflow ──────────────────────────────────────────
async def run_workflow(task: str, workflow_id: str) -> dict:
    """Execute a full multi-agent workflow and return results."""
    graph = build_workflow_graph()
    initial_state = WorkflowState(
        task=task,
        agent_outputs=[],
        current_agent="MonitorAgent",
        workflow_id=workflow_id,
        status="running",
        final_report=None,
        iterations=0,
    )
    result = await graph.ainvoke(initial_state)
    return {
        "workflow_id": workflow_id,
        "task": task,
        "status": result.get("status", "complete"),
        "agents_used": [o["agent"] for o in result.get("agent_outputs", [])],
        "outputs": result.get("agent_outputs", []),
        "final_report": result.get("final_report"),
        "iterations": result.get("iterations", 0),
    }
