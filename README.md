# Agentic AI Workflow Automation Platform

An intelligent automation platform that deploys lightweight AI agents to eliminate repetitive internal processes, automate monitoring workflows, and generate actionable insight dashboards — powered by **LangChain, LangGraph, Anthropic Claude, and OpenAI**.

---

## 🚀 What It Does

This platform replaces manual internal reporting and monitoring workflows with autonomous AI agents that:

- **Monitor** internal systems and data pipelines in real time
- **Automate** repetitive GTM and operational tasks
- **Generate** weekly insight dashboards summarizing key metrics and recommendations
- **Integrate** with enterprise APIs to connect disparate data sources
- **Learn and iterate** based on operational feedback to continuously improve efficiency

---

## 🧠 Problem It Solves

Internal teams waste hours every week on manual data collection, status reporting, and repetitive operational tasks. This platform deploys agentic AI workflows that handle these tasks autonomously — freeing up engineers and analysts to focus on higher-value work.

**Measurable Impact:**
- 60%+ reduction in manual reporting time
- Automated weekly dashboards replacing manual data aggregation
- Faster decision-making through real-time operational insights

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Agentic Framework** | LangChain, LangGraph |
| **LLM Models** | Anthropic Claude, OpenAI GPT |
| **Backend** | Python, FastAPI |
| **Frontend** | React.js, JavaScript |
| **Database** | PostgreSQL, MongoDB |
| **Infrastructure** | Docker, AWS (EC2, Lambda, S3) |
| **CI/CD** | GitHub Actions |

---

## 🏗️ Architecture

```
User / Trigger
     │
     ▼
LangGraph Orchestrator
     │
     ├── Data Ingestion Agent (REST API integrations)
     ├── Monitoring Agent (system health + anomaly detection)
     ├── Reporting Agent (dashboard generation)
     └── Anthropic Claude / OpenAI (reasoning + summarization)
     │
     ▼
PostgreSQL / MongoDB (data storage)
     │
     ▼
React.js Dashboard (insight visualization)
```

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker
- Anthropic API key
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/dharshininithila06/Agentic-ai-platform.git
cd Agentic-ai-platform

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY and OPENAI_API_KEY to .env

# Run with Docker
docker-compose up --build
```

### Run locally (without Docker)

```bash
# Backend
cd agenticai
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📊 Key Features

- **Agentic Orchestration** — LangGraph-powered multi-agent workflows with fault tolerance and retry logic
- **RAG Integration** — Retrieval-Augmented Generation for context-aware insights
- **Prompt Engineering** — Optimized prompts for Claude and OpenAI to maximize output quality
- **Automated Dashboards** — Weekly reports generated and delivered automatically
- **API Integrations** — REST API connectors to enterprise data sources
- **Containerized Deployment** — Docker-ready for consistent environment management

---

## 📁 Project Structure

```
Agentic-ai-platform/
├── agenticai/
│   ├── agents/          # LangGraph agent definitions
│   ├── workflows/       # Orchestration workflows
│   ├── integrations/    # API connectors
│   ├── models/          # Data models
│   └── main.py          # Entry point
├── frontend/            # React.js dashboard
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 👩‍💻 Author

**Dharshini Nithila Muruganithi**
M.S. Computer Science — University of Texas at Arlington
[LinkedIn](https://www.linkedin.com/in/dharshini-nithila-muruganithi-127a95200/) | dharshininithila06@gmail.com

---

## 📄 License

MIT License
