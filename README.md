# Agentic AI Workflow Automation Platform

An intelligent automation platform built with **LangChain, LangGraph, Python, and Anthropic Claude** that deploys lightweight AI agents to eliminate repetitive internal bottlenecks, automate monitoring workflows, and generate actionable insight dashboards.

---

## Problem It Solves

Internal reporting and monitoring workflows are often manual, slow, and error-prone. Teams spend hours compiling data, generating reports, and identifying issues — time that could be spent on higher-value work.

This platform replaces those manual processes with autonomous AI agents that:
- Monitor internal systems and data pipelines continuously
- Process and analyze operational data automatically
- Generate weekly impact dashboards summarizing insights and next steps
- Escalate anomalies and recommend optimizations in real time

**Result: 60%+ reduction in manual reporting time**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Agentic Framework | LangChain, LangGraph |
| AI Models | Anthropic Claude, OpenAI GPT |
| Backend | Python, FastAPI |
| Frontend | React.js, JavaScript |
| Containerization | Docker |
| Cloud | AWS (EC2, Lambda, S3, CloudWatch) |
| Data Processing | pandas, NumPy, SQL |

---

## Architecture

```
User / Trigger
      │
      ▼
  LangGraph Orchestrator
      │
      ├── Agent 1: Data Ingestion & Monitoring
      ├── Agent 2: Analysis & Insight Generation (Claude)
      ├── Agent 3: Dashboard Generation & Reporting
      └── Agent 4: Anomaly Detection & Alerting
      │
      ▼
  FastAPI Backend ──► React.js Dashboard
```

---

## Key Features

- **Agentic Workflows** — Multi-step autonomous agents built with LangGraph for durable, fault-tolerant execution
- **LLM-powered Analysis** — Anthropic Claude interprets data and generates human-readable summaries and recommendations
- **Automated Dashboards** — Weekly reports generated automatically with key metrics, trends, and action items
- **RAG Integration** — Retrieval-Augmented Generation for context-aware decision making
- **Prompt Engineering** — Optimized prompts for consistent, high-quality agent outputs
- **Containerized Deployment** — Docker-based setup for consistent environments

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker
- Anthropic API Key
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/dharshininithila06/Agentic-ai-platform.git
cd Agentic-ai-platform

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY and OPENAI_API_KEY to .env

# Run with Docker
docker-compose up --build
```

### Running locally (without Docker)

```bash
cd agenticai

# Install Python dependencies
pip install -r requirements.txt

# Start the backend
python main.py

# In a new terminal, start the frontend
npm install
npm start
```

---

## Impact

| Metric | Result |
|---|---|
| Manual reporting time reduced | 60%+ |
| Automated dashboards generated | Weekly |
| Processes automated | Internal monitoring, reporting, alerting |
| Agent response time | < 5 seconds per workflow |

---

## Project Structure

```
Agentic-ai-platform/
└── agenticai/
    ├── agents/          # LangGraph agent definitions
    ├── chains/          # LangChain workflow chains
    ├── api/             # FastAPI backend
    ├── frontend/        # React.js dashboard
    ├── utils/           # Data processing utilities
    ├── Dockerfile
    └── requirements.txt
```

---

## Author

**Dharshini Nithila Muruganithi**
M.S. Computer Science — University of Texas at Arlington
[LinkedIn](https://www.linkedin.com/in/dharshini-nithila-muruganithi-127a95200/) | dharshininithila06@gmail.com
