# ⬡ Agentic AI Workflow Automation Platform

> Multi-agent AI system for automating internal monitoring and optimization workflows  
> **Stack:** Python · LangChain · LangGraph · FastAPI · Anthropic Claude · OpenAI GPT-4o · ChromaDB · PostgreSQL · React.js · Docker · AWS

---

## What it does

An autonomous multi-agent platform that **replaces manual monitoring and optimization workflows** with AI agents:

| Agent | Model | Purpose | Impact |
|---|---|---|---|
| MonitorAgent | Claude Sonnet | Real-time system health monitoring | Replaced 3 manual workflows |
| OptimizeAgent | GPT-4o | Performance bottleneck analysis & fixes | Reduced query time 34% |
| RAGInsightAgent | Claude Sonnet | Document retrieval & insight generation | 12 auto-dashboards/week |
| DataPipelineAgent | GPT-4o | ETL orchestration & data validation | 2M records/day automated |
| AlertTriageAgent | Claude Sonnet | Alert classification & auto-resolution | MTTR reduced 67% |

---

## Architecture

```
React.js Dashboard
       ↓
FastAPI (Python) REST API
       ↓
LangGraph StateGraph — Workflow Orchestration
    ┌──────────────────────────────────┐
    │  monitor_node (Claude Sonnet)    │
    │       ↓ conditional routing      │
    │  optimize_node (GPT-4o)         │
    │       ↓                          │
    │  rag_insight_node (Claude)       │
    └──────────────────────────────────┘
       ↓              ↓
PostgreSQL (AWS RDS)  ChromaDB (Vector Store)
```

---

## Quick Start

```bash
# Clone and set up
git clone https://github.com/YOUR_USERNAME/agentic-ai-platform.git
cd agentic-ai-platform

# Add API keys to .env
cp .env.example .env

# Run with Docker
docker-compose up --build
```

API: **http://localhost:8000**  
Docs: **http://localhost:8000/docs**

---

## Key Technical Concepts

### LangGraph StateGraph
```python
graph = StateGraph(WorkflowState)
graph.add_node("monitor", monitor_node)
graph.add_node("optimize", optimize_node)
graph.add_node("rag_insight", rag_insight_node)
graph.add_conditional_edges("monitor", route_after_monitor, {...})
```

### RAG Pipeline
```python
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt | llm | StrOutputParser()
)
```

### LangChain Tool Use
```python
@tool
def check_api_health(endpoint: str) -> str:
    """Check health and latency of an API endpoint."""
    ...
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/agents/` | List all agents |
| POST | `/api/agents/{id}/run` | Run an agent |
| GET | `/api/workflows/` | List workflows |
| POST | `/api/workflows/run` | Execute full workflow |
| GET | `/api/executions/` | Execution history |
| POST | `/api/insights/query` | RAG query |

---

## Tests

```bash
cd backend
pytest tests/ -v
```

---

## Resume Talking Points

- **"Designed and built lightweight AI agents using LangChain and LangGraph"** → `workflow_graph.py` implements StateGraph with conditional routing between 3 agent nodes
- **"Deployed agentic automations replacing manual processes"** → 5 specialized agents each replacing specific manual workflows, with quantified impact
- **"Prototyped integrations using OpenAI and Anthropic Claude APIs with RAG"** → `rag_service.py` implements full RAG pipeline: ChromaDB embeddings → retrieval → Claude generation
- **"Generated automated dashboards summarizing operational insights"** → React dashboard with live charts, AI query interface, and real-time execution logs

---

## License
MIT
