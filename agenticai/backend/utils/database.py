"""PostgreSQL database setup with SQLAlchemy."""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Float, DateTime, JSON
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/agentic_ai")

engine = create_async_engine(DATABASE_URL, echo=False)

class Base(DeclarativeBase):
    pass

class AgentExecution(Base):
    __tablename__ = "agent_executions"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    agent_name: Mapped[str] = mapped_column(String)
    workflow_id: Mapped[str] = mapped_column(String, nullable=True)
    task: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="running")
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    output: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    workflow_name: Mapped[str] = mapped_column(String)
    task: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="running")
    agents_used: Mapped[list] = mapped_column(JSON, default=list)
    final_report: Mapped[str] = mapped_column(String, nullable=True)
    success_rate: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
