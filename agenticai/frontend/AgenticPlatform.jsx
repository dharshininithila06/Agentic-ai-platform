import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/* ═══════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════ */
const AGENTS = [
  { id: "a1", name: "MonitorAgent", type: "monitoring", model: "claude-sonnet-4", status: "running", tasksCompleted: 1247, successRate: 98.2, avgLatency: 340, description: "Monitors system health, API latency, error rates and triggers alerts", tools: ["web_search", "api_call", "database_query", "alert_send"], lastRun: "2m ago", impact: "Replaced 3 manual monitoring workflows" },
  { id: "a2", name: "OptimizeAgent", type: "optimization", model: "gpt-4o", status: "running", tasksCompleted: 892, successRate: 94.7, avgLatency: 820, description: "Analyzes performance bottlenecks and suggests/applies optimizations", tools: ["code_analysis", "database_query", "benchmark_run", "deploy"], lastRun: "5m ago", impact: "Reduced query time by 34%" },
  { id: "a3", name: "RAGInsightAgent", type: "rag", model: "claude-sonnet-4", status: "running", tasksCompleted: 634, successRate: 97.1, avgLatency: 1240, description: "Retrieves documents, generates insights using RAG pipeline", tools: ["vector_search", "document_fetch", "summarize", "report_gen"], lastRun: "1m ago", impact: "Auto-generates 12 dashboards/week" },
  { id: "a4", name: "DataPipelineAgent", type: "pipeline", model: "gpt-4o", status: "idle", tasksCompleted: 421, successRate: 99.1, avgLatency: 2100, description: "Orchestrates ETL pipelines, validates data quality, triggers alerts", tools: ["etl_run", "data_validate", "s3_upload", "notify"], lastRun: "18m ago", impact: "Processes 2M records/day" },
  { id: "a5", name: "AlertTriageAgent", type: "triage", model: "claude-sonnet-4", status: "running", tasksCompleted: 2103, successRate: 96.4, avgLatency: 180, description: "Classifies, prioritizes and auto-resolves incoming alerts", tools: ["classify", "severity_score", "auto_resolve", "escalate"], lastRun: "30s ago", impact: "Reduced MTTR by 67%" },
];

const WORKFLOWS = [
  { id: "w1", name: "System Health Monitor", agents: ["MonitorAgent", "AlertTriageAgent"], status: "active", runsToday: 48, successRate: 98.5, lastRun: "2m ago", trigger: "cron:5min", graph: [["MonitorAgent", "AlertTriageAgent"]] },
  { id: "w2", name: "Daily Performance Optimizer", agents: ["MonitorAgent", "OptimizeAgent", "RAGInsightAgent"], status: "active", runsToday: 3, successRate: 95.2, lastRun: "2h ago", trigger: "cron:daily", graph: [["MonitorAgent", "OptimizeAgent"], ["OptimizeAgent", "RAGInsightAgent"]] },
  { id: "w3", name: "RAG Insight Pipeline", agents: ["DataPipelineAgent", "RAGInsightAgent"], status: "active", runsToday: 12, successRate: 97.8, lastRun: "8m ago", trigger: "event:data_upload", graph: [["DataPipelineAgent", "RAGInsightAgent"]] },
  { id: "w4", name: "Incident Response", agents: ["AlertTriageAgent", "MonitorAgent", "OptimizeAgent"], status: "active", runsToday: 7, successRate: 100, lastRun: "45m ago", trigger: "event:alert", graph: [["AlertTriageAgent", "MonitorAgent"], ["MonitorAgent", "OptimizeAgent"]] },
];

const EXEC_LOGS = [
  { id: 1, ts: "10:42:01", agent: "MonitorAgent", workflow: "System Health", status: "success", tokens: 842, latency: 312, message: "CPU: 67% | Memory: 78% | API p95: 234ms — All within thresholds" },
  { id: 2, ts: "10:42:31", agent: "AlertTriageAgent", workflow: "Incident Response", status: "success", tokens: 421, latency: 178, message: "Alert #4821 classified as LOW severity — auto-resolved" },
  { id: 3, ts: "10:43:15", agent: "RAGInsightAgent", workflow: "RAG Insight Pipeline", status: "success", tokens: 2104, latency: 1340, message: "Generated weekly performance dashboard — 8 insights extracted from 34 documents" },
  { id: 4, ts: "10:44:02", agent: "OptimizeAgent", workflow: "Performance Optimizer", status: "running", tokens: 0, latency: 0, message: "Analyzing query execution plans for users_table..." },
  { id: 5, ts: "10:44:45", agent: "MonitorAgent", workflow: "System Health", status: "success", tokens: 763, latency: 289, message: "DB connections: 42/100 | Cache hit: 94.2% | Disk: 61% — Healthy" },
  { id: 6, ts: "10:45:10", agent: "DataPipelineAgent", workflow: "RAG Insight Pipeline", status: "success", tokens: 1204, latency: 2340, message: "ETL complete — 847,234 records processed, 0 validation errors" },
];

const PERF_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  tasks: Math.floor(40 + Math.random() * 80),
  success: Math.floor(90 + Math.random() * 9),
  tokens: Math.floor(8000 + Math.random() * 6000),
  latency: Math.floor(300 + Math.random() * 400),
}));

const MODEL_SPLIT = [
  { name: "Claude Sonnet", value: 58, color: "#8B5CF6" },
  { name: "GPT-4o", value: 42, color: "#3B82F6" },
];

const IMPACT_DATA = [
  { week: "W1", manual: 40, automated: 8 },
  { week: "W2", manual: 40, automated: 14 },
  { week: "W3", manual: 40, automated: 22 },
  { week: "W4", manual: 40, automated: 31 },
  { week: "W5", manual: 40, automated: 37 },
  { week: "W6", manual: 40, automated: 40 },
];

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&family=Clash+Display:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

:root {
  --bg: #0B0D14;--bg2: #0F1220;--bg3: #141828;--bg4: #1A1F35;
  --violet: #8B5CF6;--violet2: #A78BFA;--violet3: rgba(139,92,246,0.15);
  --blue: #3B82F6;--cyan: #06B6D4;--green: #10B981;--amber: #F59E0B;--red: #EF4444;
  --border: rgba(139,92,246,0.12);--border2: rgba(255,255,255,0.06);
  --text: #E2E8F0;--dim: rgba(226,232,240,0.45);--faint: rgba(226,232,240,0.15);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;overflow:hidden;}

/* BG */
.bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
.bg-mesh{position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 10% 15%,rgba(139,92,246,0.08) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 90% 85%,rgba(59,130,246,0.06) 0%,transparent 60%),radial-gradient(ellipse 30% 30% at 50% 50%,rgba(6,182,212,0.03) 0%,transparent 70%);}
.bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px);background-size:52px 52px;}

/* LAYOUT */
.app{position:relative;z-index:10;display:flex;height:100vh;overflow:hidden;}

/* SIDEBAR */
.sidebar{width:220px;flex-shrink:0;background:rgba(11,13,20,0.9);border-right:1px solid var(--border);display:flex;flex-direction:column;height:100vh;backdrop-filter:blur(10px);}
.logo-section{padding:18px 16px 14px;border-bottom:1px solid var(--border2);}
.logo{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.logo-mark{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--violet),var(--blue));display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800;color:white;}
.logo-name{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;letter-spacing:-0.02em;color:white;}
.logo-name span{color:var(--violet2);}
.logo-sub{font-size:0.55rem;color:var(--faint);letter-spacing:0.15em;text-transform:uppercase;font-family:'Fira Code',monospace;}

.nav{padding:10px 8px;flex:1;}
.nav-group{margin-bottom:16px;}
.nav-group-label{font-size:0.52rem;color:var(--faint);letter-spacing:0.18em;text-transform:uppercase;padding:4px 10px 6px;font-family:'Fira Code',monospace;}
.nav-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;cursor:pointer;transition:all .15s;color:var(--dim);font-size:0.8rem;font-weight:500;border:1px solid transparent;margin-bottom:1px;}
.nav-item:hover{background:rgba(139,92,246,0.07);color:var(--text);}
.nav-item.active{background:rgba(139,92,246,0.12);border-color:rgba(139,92,246,0.25);color:var(--violet2);}
.nav-icon{font-size:0.85rem;width:16px;text-align:center;}
.nav-badge{margin-left:auto;background:var(--violet);color:white;font-size:0.5rem;padding:1px 5px;border-radius:8px;font-weight:700;}

.sidebar-footer{padding:12px 14px;border-top:1px solid var(--border2);}
.model-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
.model-label{font-size:0.58rem;color:var(--faint);font-family:'Fira Code',monospace;}
.model-chips{display:flex;gap:4px;}
.mchip{font-size:0.52rem;padding:2px 6px;border-radius:4px;font-weight:600;font-family:'Fira Code',monospace;}
.mchip.claude{background:rgba(139,92,246,0.15);color:var(--violet2);border:1px solid rgba(139,92,246,0.25);}
.mchip.openai{background:rgba(59,130,246,0.15);color:#93C5FD;border:1px solid rgba(59,130,246,0.25);}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden;}
.topbar{padding:14px 24px;border-bottom:1px solid var(--border2);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:rgba(11,13,20,0.6);backdrop-filter:blur(10px);}
.page-title{font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:-0.02em;color:white;}
.page-sub{font-size:0.65rem;color:var(--dim);margin-top:2px;}
.topbar-right{display:flex;align-items:center;gap:10px;}
.live-badge{display:flex;align-items:center;gap:5px;font-size:0.62rem;color:var(--green);font-family:'Fira Code',monospace;letter-spacing:0.06em;}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:blink 2s ease infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.tbtn{padding:6px 14px;border-radius:7px;font-size:0.72rem;font-weight:600;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}
.tbtn-primary{background:var(--violet);color:white;border:none;}
.tbtn-primary:hover{background:#7C3AED;}
.tbtn-secondary{background:rgba(255,255,255,0.05);color:var(--dim);border:1px solid var(--border2);}
.tbtn-secondary:hover{background:rgba(255,255,255,0.09);color:var(--text);}

/* CONTENT */
.content{flex:1;overflow-y:auto;padding:20px 24px;}
.content::-webkit-scrollbar{width:4px;}
.content::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.25);border-radius:4px;}

/* CARDS */
.card{background:rgba(15,18,32,0.8);border:1px solid var(--border2);border-radius:10px;position:relative;overflow:hidden;backdrop-filter:blur(8px);}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent);}
.card-hd{padding:14px 18px;border-bottom:1px solid var(--border2);display:flex;align-items:center;justify-content:space-between;}
.card-title{font-size:0.82rem;font-weight:700;color:white;display:flex;align-items:center;gap:7px;}
.card-body{padding:16px 18px;}
.card-tag{font-size:0.55rem;font-family:'Fira Code',monospace;letter-spacing:0.12em;text-transform:uppercase;color:var(--dim);padding:2px 7px;border:1px solid var(--border2);border-radius:3px;}

/* STAT CARDS */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}
.stat-card{background:rgba(15,18,32,0.8);border:1px solid var(--border2);border-radius:10px;padding:16px;position:relative;overflow:hidden;transition:all .2s;}
.stat-card:hover{border-color:rgba(139,92,246,0.3);transform:translateY(-2px);}
.stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--c,var(--violet));}
.stat-icon{font-size:1.2rem;margin-bottom:10px;}
.stat-val{font-family:'Syne',sans-serif;font-weight:700;font-size:1.8rem;color:white;line-height:1;margin-bottom:4px;}
.stat-label{font-size:0.68rem;color:var(--dim);margin-bottom:6px;}
.stat-change{font-size:0.62rem;display:flex;align-items:center;gap:4px;}
.chg-up{color:var(--green);}
.chg-down{color:var(--red);}

/* GRIDS */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px;}
.g2L{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;margin-bottom:14px;}
.g1{margin-bottom:14px;}

/* AGENT CARDS */
.agent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:14px;}
.agent-card{background:rgba(15,18,32,0.8);border:1px solid var(--border2);border-radius:10px;padding:16px;transition:all .2s;cursor:pointer;position:relative;}
.agent-card:hover{border-color:rgba(139,92,246,0.3);transform:translateY(-2px);}
.agent-card.selected{border-color:var(--violet);box-shadow:0 0 20px rgba(139,92,246,0.15);}
.agent-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}
.agent-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
.agent-icon.monitoring{background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.25);}
.agent-icon.optimization{background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.25);}
.agent-icon.rag{background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.25);}
.agent-icon.pipeline{background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.25);}
.agent-icon.triage{background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.25);}
.status-pill{font-size:0.58rem;font-weight:600;padding:3px 8px;border-radius:20px;font-family:'Fira Code',monospace;letter-spacing:0.06em;}
.sp-running{background:rgba(16,185,129,0.12);color:#34D399;border:1px solid rgba(16,185,129,0.25);}
.sp-idle{background:rgba(226,232,240,0.06);color:var(--dim);border:1px solid var(--border2);}
.agent-name{font-size:0.88rem;font-weight:700;color:white;margin-bottom:3px;}
.agent-desc{font-size:0.7rem;color:var(--dim);line-height:1.5;margin-bottom:10px;}
.agent-model{font-size:0.58rem;font-family:'Fira Code',monospace;color:var(--violet2);margin-bottom:8px;}
.agent-tools{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;}
.tool-chip{font-size:0.55rem;padding:2px 7px;border-radius:4px;background:rgba(255,255,255,0.04);border:1px solid var(--border2);color:var(--dim);font-family:'Fira Code',monospace;}
.agent-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border-top:1px solid var(--border2);padding-top:10px;}
.astat{text-align:center;}
.astat-val{font-size:0.88rem;font-weight:700;color:white;}
.astat-label{font-size:0.55rem;color:var(--dim);text-transform:uppercase;letter-spacing:0.08em;}
.agent-impact{font-size:0.65rem;color:var(--green);background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:5px;padding:5px 8px;margin-top:10px;}

/* WORKFLOW GRAPH */
.workflow-list{display:flex;flex-direction:column;gap:10px;}
.workflow-item{background:rgba(20,24,40,0.8);border:1px solid var(--border2);border-radius:8px;padding:14px 16px;transition:all .15s;cursor:pointer;}
.workflow-item:hover{border-color:rgba(139,92,246,0.25);}
.wf-top{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.wf-name{font-size:0.85rem;font-weight:700;color:white;flex:1;}
.wf-trigger{font-size:0.58rem;font-family:'Fira Code',monospace;color:var(--dim);padding:2px 7px;border:1px solid var(--border2);border-radius:3px;}
.wf-graph{display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;}
.wf-node{font-size:0.62rem;padding:4px 9px;border-radius:5px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);color:var(--violet2);font-weight:600;}
.wf-arrow{color:var(--dim);font-size:0.7rem;}
.wf-meta{display:flex;gap:14px;}
.wf-stat{font-size:0.62rem;color:var(--dim);font-family:'Fira Code',monospace;}
.wf-stat span{color:white;font-weight:600;}

/* LOG TABLE */
.log-table{width:100%;border-collapse:collapse;}
.log-table th{font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--dim);padding:8px 12px;text-align:left;border-bottom:1px solid var(--border2);background:rgba(255,255,255,0.02);}
.log-table td{padding:9px 12px;font-size:0.72rem;border-bottom:1px solid rgba(255,255,255,0.03);}
.log-table tr:hover td{background:rgba(255,255,255,0.02);}
.log-status{font-size:0.58rem;font-weight:600;padding:2px 7px;border-radius:10px;font-family:'Fira Code',monospace;}
.ls-success{background:rgba(16,185,129,0.1);color:#34D399;border:1px solid rgba(16,185,129,0.2);}
.ls-running{background:rgba(59,130,246,0.1);color:#93C5FD;border:1px solid rgba(59,130,246,0.2);animation:pulse 1.5s ease infinite;}
.ls-error{background:rgba(239,68,68,0.1);color:#FCA5A5;border:1px solid rgba(239,68,68,0.2);}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.log-mono{font-family:'Fira Code',monospace;font-size:0.65rem;color:var(--dim);}
.log-msg{font-size:0.7rem;color:var(--text);}

/* AI QUERY */
.ai-section{background:linear-gradient(135deg,rgba(139,92,246,0.05),rgba(15,18,32,0.95),rgba(59,130,246,0.04));border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:20px;margin-bottom:14px;position:relative;}
.ai-section::before{content:'⬡ AI WORKFLOW ASSISTANT';position:absolute;top:-1px;left:20px;background:var(--bg2);padding:0 12px;font-size:0.5rem;letter-spacing:0.18em;color:var(--violet2);font-family:'Fira Code',monospace;}
.ai-input-row{display:flex;gap:8px;margin-top:8px;}
.ai-input{flex:1;background:rgba(0,0,0,0.3);border:1px solid rgba(139,92,246,0.2);border-radius:7px;padding:10px 14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.82rem;outline:none;transition:all .2s;}
.ai-input::placeholder{color:rgba(226,232,240,0.18);}
.ai-input:focus{border-color:var(--violet);box-shadow:0 0 16px rgba(139,92,246,0.12);}
.ai-btn{background:linear-gradient(135deg,var(--violet),var(--blue));color:white;border:none;padding:10px 20px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s;}
.ai-btn:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(139,92,246,0.3);}
.ai-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.ai-response{margin-top:12px;padding:12px 14px;background:rgba(0,0,0,0.25);border-left:2px solid var(--violet);border-radius:0 6px 6px 0;animation:slideIn .25s ease;}
@keyframes slideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.ai-resp-hd{font-size:0.52rem;letter-spacing:0.18em;color:var(--violet2);margin-bottom:7px;font-family:'Fira Code',monospace;}
.ai-resp-text{font-size:0.78rem;line-height:1.7;color:var(--dim);}
.tdots{display:flex;gap:4px;}
.tdots span{width:6px;height:6px;border-radius:50%;background:var(--violet);animation:td 1.2s ease infinite;}
.tdots span:nth-child(2){animation-delay:.2s}.tdots span:nth-child(3){animation-delay:.4s}
@keyframes td{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}

/* CHARTS */
.chart-h{height:160px;margin-top:8px;}
.chart-h2{height:200px;margin-top:8px;}
.ct{background:rgba(15,18,32,0.9);border:1px solid rgba(139,92,246,0.15);padding:7px 11px;border-radius:6px;font-family:'Fira Code',monospace;font-size:0.62rem;color:var(--violet2);}

@media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)}.g2,.g2L,.g3{grid-template-columns:1fr}.sidebar{display:none}.main{width:100%}}
`;

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
export default function AgenticPlatform() {
  const [view, setView] = useState("dashboard");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [logs, setLogs] = useState(EXEC_LOGS);
  const [perfData, setPerfData] = useState(PERF_DATA);
  const [totalTasks, setTotalTasks] = useState(5297);
  const [totalTokens, setTotalTokens] = useState(18420000);

  useEffect(() => {
    const id = setInterval(() => {
      setTotalTasks(t => t + Math.floor(Math.random() * 3));
      setTotalTokens(t => t + Math.floor(Math.random() * 2000));
      setLogs(prev => {
        const agents = AGENTS.filter(a => a.status === "running");
        const agent = agents[Math.floor(Math.random() * agents.length)];
        const msgs = [
          `${agent.name}: Completed task — ${Math.floor(Math.random() * 800 + 200)} tokens`,
          `Alert classified as ${Math.random() > 0.5 ? "LOW" : "MEDIUM"} severity — auto-resolved`,
          `RAG query processed — ${Math.floor(Math.random() * 20 + 5)} documents retrieved`,
          `Performance check: API p95 ${Math.floor(Math.random() * 200 + 150)}ms — OK`,
        ];
        const newLog = { id: Date.now(), ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), agent: agent.name, workflow: "Live", status: "success", tokens: Math.floor(Math.random() * 1000 + 200), latency: Math.floor(Math.random() * 500 + 100), message: msgs[Math.floor(Math.random() * msgs.length)] };
        return [newLog, ...prev.slice(0, 19)];
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const askAI = useCallback(async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true); setAiResponse(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "You are an expert in agentic AI systems, LangChain, LangGraph, RAG, and workflow automation. Answer questions concisely and technically. Reference the context of a multi-agent monitoring and optimization platform.",
          messages: [{ role: "user", content: aiQuery }],
        }),
      });
      const data = await res.json();
      setAiResponse(data.content?.find(b => b.type === "text")?.text || "Unable to respond.");
    } catch { setAiResponse("AI assistant unavailable. Please try again."); }
    finally { setAiLoading(false); }
  }, [aiQuery, aiLoading]);

  const navItems = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "agents", icon: "🤖", label: "Agents", badge: AGENTS.filter(a => a.status === "running").length },
    { id: "workflows", icon: "⬡", label: "Workflows" },
    { id: "logs", icon: "📋", label: "Exec Logs" },
    { id: "insights", icon: "📊", label: "RAG Insights" },
  ];

  const runningAgents = AGENTS.filter(a => a.status === "running").length;

  return (
    <>
      <style>{CSS}</style>
      <div className="bg"><div className="bg-mesh"/><div className="bg-grid"/></div>

      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="logo-section">
            <div className="logo">
              <div className="logo-mark">⬡</div>
              <div className="logo-name">Agentic<span>AI</span></div>
            </div>
            <div className="logo-sub">Workflow Automation Platform</div>
          </div>
          <nav className="nav">
            <div className="nav-group">
              <div className="nav-group-label">Platform</div>
              {navItems.map(n => (
                <div key={n.id} className={`nav-item ${view === n.id ? "active" : ""}`} onClick={() => setView(n.id)}>
                  <span className="nav-icon">{n.icon}</span>{n.label}
                  {n.badge && <span className="nav-badge">{n.badge}</span>}
                </div>
              ))}
            </div>
          </nav>
          <div className="sidebar-footer">
            <div className="model-row">
              <span className="model-label">AI Models</span>
              <div className="model-chips">
                <span className="mchip claude">Claude</span>
                <span className="mchip openai">GPT-4o</span>
              </div>
            </div>
            <div style={{ fontSize: "0.58rem", color: "var(--faint)", fontFamily: "Fira Code" }}>LangChain · LangGraph · FastAPI</div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div>
              <div className="page-title">
                {view === "dashboard" && "Command Center"}
                {view === "agents" && "AI Agents"}
                {view === "workflows" && "Workflows"}
                {view === "logs" && "Execution Logs"}
                {view === "insights" && "RAG Insights"}
              </div>
              <div className="page-sub">LangChain · LangGraph · OpenAI · Anthropic Claude · FastAPI · PostgreSQL · AWS</div>
            </div>
            <div className="topbar-right">
              <div className="live-badge"><div className="live-dot"/>LIVE · {runningAgents} AGENTS RUNNING</div>
              <button className="tbtn tbtn-secondary" onClick={() => setView("agents")}>+ Deploy Agent</button>
              <button className="tbtn tbtn-primary" onClick={() => setView("workflows")}>+ New Workflow</button>
            </div>
          </div>

          <div className="content">

            {/* ── DASHBOARD ── */}
            {view === "dashboard" && (<>
              <div className="stats-grid">
                {[
                  { icon: "🤖", label: "Active Agents", val: runningAgents, sub: `${AGENTS.length} total deployed`, c: "var(--violet)", chg: "+2 this week", up: true },
                  { icon: "⬡", label: "Tasks Completed", val: totalTasks.toLocaleString(), sub: "all time", c: "var(--green)", chg: "+847 today", up: true },
                  { icon: "💰", label: "Tokens Used", val: `${(totalTokens / 1000000).toFixed(1)}M`, sub: "Claude + GPT-4o", c: "var(--blue)", chg: "+2.1M today", up: true },
                  { icon: "⚡", label: "Manual Work Replaced", val: "94%", sub: "of monitored workflows", c: "var(--amber)", chg: "↑ from 60% in W1", up: true },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ "--c": s.c }}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-val" style={{ color: s.c }}>{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                    <div className={`stat-change ${s.up ? "chg-up" : "chg-down"}`}>{s.chg}</div>
                  </div>
                ))}
              </div>

              {/* AI ASSISTANT */}
              <div className="ai-section">
                <div style={{ fontSize: "0.62rem", color: "var(--dim)", marginTop: 8 }}>Ask anything about your agents, workflows, or get optimization recommendations</div>
                <div className="ai-input-row">
                  <input className="ai-input" placeholder="e.g. Why is OptimizeAgent slow? How does LangGraph work? Explain RAG pipeline..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()} />
                  <button className="ai-btn" onClick={askAI} disabled={aiLoading || !aiQuery.trim()}>{aiLoading ? "Thinking..." : "Ask AI →"}</button>
                </div>
                {(aiLoading || aiResponse) && (
                  <div className="ai-response">
                    <div className="ai-resp-hd">CLAUDE AI · WORKFLOW ANALYSIS</div>
                    {aiLoading ? <div className="tdots"><span/><span/><span/></div> : <div className="ai-resp-text">{aiResponse}</div>}
                  </div>
                )}
              </div>

              <div className="g2L">
                <div className="card">
                  <div className="card-hd"><div className="card-title">📈 Tasks Completed / Hour</div><span className="card-tag">LIVE</span></div>
                  <div className="card-body">
                    <div className="chart-h">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={perfData.slice(-12)} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
                          <defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient></defs>
                          <XAxis dataKey="hour" tick={{ fontSize: 9, fontFamily: "Fira Code", fill: "rgba(226,232,240,0.3)" }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 9, fontFamily: "Fira Code", fill: "rgba(226,232,240,0.3)" }} tickLine={false} axisLine={false} />
                          <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="ct">{payload[0].value} tasks</div> : null} />
                          <Area type="monotone" dataKey="tasks" stroke="#8B5CF6" strokeWidth={2} fill="url(#vg)" dot={false} activeDot={{ r: 4, fill: "#8B5CF6" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-hd"><div className="card-title">🤖 Model Usage Split</div></div>
                  <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <PieChart width={120} height={120}>
                      <Pie data={MODEL_SPLIT} cx={55} cy={55} innerRadius={35} outerRadius={52} dataKey="value" strokeWidth={0}>
                        {MODEL_SPLIT.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                    <div style={{ flex: 1 }}>
                      {MODEL_SPLIT.map((m, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "white" }}>{m.name}</div>
                            <div style={{ fontSize: "0.62rem", color: "var(--dim)" }}>{m.value}% of calls</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="g2">
                <div className="card">
                  <div className="card-hd"><div className="card-title">📉 Manual Work Eliminated</div><span className="card-tag">WEEKLY IMPACT</span></div>
                  <div className="card-body">
                    <div className="chart-h">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={IMPACT_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
                          <XAxis dataKey="week" tick={{ fontSize: 9, fontFamily: "Fira Code", fill: "rgba(226,232,240,0.3)" }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 9, fontFamily: "Fira Code", fill: "rgba(226,232,240,0.3)" }} tickLine={false} axisLine={false} />
                          <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="ct">Manual: {payload[0]?.value}h | Automated: {payload[1]?.value}h</div> : null} />
                          <Bar dataKey="manual" fill="rgba(239,68,68,0.3)" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="automated" fill="#10B981" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.65rem", color: "var(--dim)" }}><div style={{ width: 8, height: 8, background: "rgba(239,68,68,0.5)", borderRadius: 2 }}/> Manual hours</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.65rem", color: "var(--dim)" }}><div style={{ width: 8, height: 8, background: "#10B981", borderRadius: 2 }}/> Automated</div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-hd"><div className="card-title">📋 Live Execution Log</div><span className="card-tag">STREAMING</span></div>
                  <div style={{ maxHeight: 200, overflowY: "auto", padding: "0 4px" }}>
                    {logs.slice(0, 6).map((l, i) => (
                      <div key={l.id} style={{ display: "flex", gap: 8, padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "0.58rem", color: "rgba(226,232,240,0.2)", fontFamily: "Fira Code", flexShrink: 0, marginTop: 2 }}>{l.ts}</span>
                        <span className={`log-status ${l.status === "success" ? "ls-success" : l.status === "running" ? "ls-running" : "ls-error"}`}>{l.status}</span>
                        <span style={{ fontSize: "0.68rem", color: "var(--dim)", flex: 1, lineHeight: 1.5 }}>{l.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>)}

            {/* ── AGENTS ── */}
            {view === "agents" && (<>
              <div style={{ marginBottom: 14, fontSize: "0.78rem", color: "var(--dim)" }}>
                {AGENTS.length} agents deployed · {runningAgents} running · LangChain tool-use enabled · Multi-model (Claude + GPT-4o)
              </div>
              <div className="agent-grid">
                {AGENTS.map(agent => (
                  <div key={agent.id} className={`agent-card ${selectedAgent?.id === agent.id ? "selected" : ""}`} onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}>
                    <div className="agent-top">
                      <div className={`agent-icon ${agent.type}`}>
                        {agent.type === "monitoring" ? "📡" : agent.type === "optimization" ? "⚡" : agent.type === "rag" ? "🧠" : agent.type === "pipeline" ? "🔄" : "🚨"}
                      </div>
                      <span className={`status-pill ${agent.status === "running" ? "sp-running" : "sp-idle"}`}>{agent.status.toUpperCase()}</span>
                    </div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-model">Model: {agent.model}</div>
                    <div className="agent-desc">{agent.description}</div>
                    <div className="agent-tools">
                      {agent.tools.map(t => <span key={t} className="tool-chip">{t}</span>)}
                    </div>
                    <div className="agent-stats">
                      <div className="astat"><div className="astat-val">{agent.tasksCompleted.toLocaleString()}</div><div className="astat-label">Tasks</div></div>
                      <div className="astat"><div className="astat-val" style={{ color: "var(--green)" }}>{agent.successRate}%</div><div className="astat-label">Success</div></div>
                      <div className="astat"><div className="astat-val">{agent.avgLatency}ms</div><div className="astat-label">Latency</div></div>
                    </div>
                    <div className="agent-impact">✓ {agent.impact}</div>
                  </div>
                ))}
              </div>
            </>)}

            {/* ── WORKFLOWS ── */}
            {view === "workflows" && (<>
              <div style={{ marginBottom: 14, fontSize: "0.78rem", color: "var(--dim)" }}>
                {WORKFLOWS.length} active workflows · LangGraph state machine orchestration · Event & cron triggers
              </div>
              <div className="workflow-list">
                {WORKFLOWS.map(wf => (
                  <div key={wf.id} className="workflow-item">
                    <div className="wf-top">
                      <div className="wf-name">{wf.name}</div>
                      <span className="wf-trigger">{wf.trigger}</span>
                      <span className={`status-pill ${wf.status === "active" ? "sp-running" : "sp-idle"}`}>{wf.status.toUpperCase()}</span>
                    </div>
                    <div className="wf-graph">
                      {wf.agents.map((a, i) => (<>
                        <span key={a} className="wf-node">{a}</span>
                        {i < wf.agents.length - 1 && <span key={`arr${i}`} className="wf-arrow">→</span>}
                      </>))}
                    </div>
                    <div className="wf-meta">
                      <div className="wf-stat">Runs today: <span>{wf.runsToday}</span></div>
                      <div className="wf-stat">Success: <span style={{ color: "var(--green)" }}>{wf.successRate}%</span></div>
                      <div className="wf-stat">Last run: <span>{wf.lastRun}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>)}

            {/* ── LOGS ── */}
            {view === "logs" && (<>
              <div className="card g1">
                <div className="card-hd"><div className="card-title">📋 Agent Execution Logs</div><span className="card-tag">LIVE STREAM</span></div>
                <table className="log-table">
                  <thead><tr><th>Time</th><th>Agent</th><th>Workflow</th><th>Status</th><th>Tokens</th><th>Latency</th><th>Message</th></tr></thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id}>
                        <td className="log-mono">{l.ts}</td>
                        <td style={{ fontWeight: 600, fontSize: "0.72rem", color: "var(--violet2)" }}>{l.agent}</td>
                        <td className="log-mono">{l.workflow}</td>
                        <td><span className={`log-status ${l.status === "success" ? "ls-success" : l.status === "running" ? "ls-running" : "ls-error"}`}>{l.status}</span></td>
                        <td className="log-mono">{l.tokens > 0 ? l.tokens : "—"}</td>
                        <td className="log-mono">{l.latency > 0 ? `${l.latency}ms` : "—"}</td>
                        <td className="log-msg">{l.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ── INSIGHTS ── */}
            {view === "insights" && (<>
              <div className="ai-section" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "0.62rem", color: "var(--dim)", marginTop: 8 }}>RAGInsightAgent — Ask questions about your operational data, get AI-generated insights</div>
                <div className="ai-input-row">
                  <input className="ai-input" placeholder="e.g. What caused the latency spike on Monday? Which agent has highest ROI? Summarize this week..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()} />
                  <button className="ai-btn" onClick={askAI} disabled={aiLoading || !aiQuery.trim()}>{aiLoading ? "Generating..." : "Generate Insight →"}</button>
                </div>
                {(aiLoading || aiResponse) && (
                  <div className="ai-response">
                    <div className="ai-resp-hd">RAG INSIGHT AGENT · CLAUDE AI</div>
                    {aiLoading ? <div className="tdots"><span/><span/><span/></div> : <div className="ai-resp-text">{aiResponse}</div>}
                  </div>
                )}
              </div>

              <div className="g3">
                {[
                  { title: "API Latency Trend", color: "#8B5CF6", key: "latency" },
                  { title: "Token Usage / Hour", color: "#3B82F6", key: "tokens" },
                  { title: "Task Success Rate", color: "#10B981", key: "success" },
                ].map(({ title, color, key }) => (
                  <div key={key} className="card">
                    <div className="card-hd"><div className="card-title">{title}</div></div>
                    <div className="card-body">
                      <div className="chart-h">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={perfData.slice(-10)} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
                            <XAxis dataKey="hour" tick={{ fontSize: 8, fontFamily: "Fira Code", fill: "rgba(226,232,240,0.3)" }} tickLine={false} axisLine={false} interval={2} />
                            <YAxis tick={{ fontSize: 8, fontFamily: "Fira Code", fill: "rgba(226,232,240,0.3)" }} tickLine={false} axisLine={false} />
                            <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="ct">{payload[0].value}</div> : null} />
                            <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>)}

          </div>
        </main>
      </div>
    </>
  );
}
