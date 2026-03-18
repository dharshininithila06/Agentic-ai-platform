"""
Pytest tests for Agentic AI Workflow Platform

Tests cover:
- Agent workflow state transitions
- LangGraph graph compilation
- RAG pipeline document ingestion
- FastAPI endpoint responses
"""

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from agents.workflow_graph import WorkflowState, route_after_monitor, build_workflow_graph

class TestWorkflowGraph:

    def test_build_workflow_graph_compiles(self):
        """LangGraph StateGraph should compile without errors."""
        graph = build_workflow_graph()
        assert graph is not None

    def test_route_after_monitor_goes_to_optimize(self):
        """Should route to optimize when iterations < 3."""
        state = WorkflowState(
            task="test", agent_outputs=[], current_agent="monitor",
            workflow_id="w1", status="running", final_report=None, iterations=1
        )
        result = route_after_monitor(state)
        assert result == "optimize"

    def test_route_after_monitor_skips_to_rag_on_high_iterations(self):
        """Should skip optimize and go to rag_insight after 3+ iterations."""
        state = WorkflowState(
            task="test", agent_outputs=[], current_agent="monitor",
            workflow_id="w1", status="running", final_report=None, iterations=4
        )
        result = route_after_monitor(state)
        assert result == "rag_insight"

    def test_workflow_state_structure(self):
        """WorkflowState TypedDict should accept valid data."""
        state = WorkflowState(
            task="Monitor system health",
            agent_outputs=[{"agent": "MonitorAgent", "output": "All healthy"}],
            current_agent="OptimizeAgent",
            workflow_id="wf_123",
            status="running",
            final_report=None,
            iterations=1,
        )
        assert state["task"] == "Monitor system health"
        assert len(state["agent_outputs"]) == 1
        assert state["iterations"] == 1

class TestRAGPipeline:

    def test_rag_pipeline_instantiation(self):
        """RAGPipeline should instantiate without API calls."""
        with patch("services.rag_service.SentenceTransformerEmbeddings"):
            from services.rag_service import RAGPipeline
            pipeline = RAGPipeline()
            assert pipeline is not None
            assert pipeline.vectorstore is None

    def test_document_chunking(self):
        """Text splitter should chunk long documents correctly."""
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=20)
        long_text = "A" * 500
        chunks = splitter.split_text(long_text)
        assert len(chunks) > 1
        assert all(len(c) <= 120 for c in chunks)

class TestFastAPIRoutes:

    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_list_agents(self, client):
        response = client.get("/api/agents/")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["agents"]) == 5

    def test_get_agent_not_found(self, client):
        response = client.get("/api/agents/nonexistent")
        assert response.status_code == 404

    def test_run_agent_queues_job(self, client):
        response = client.post("/api/agents/a1/run", json={"task": "Monitor system", "agent_id": "a1"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "execution_id" in data
        assert data["status"] == "queued"
