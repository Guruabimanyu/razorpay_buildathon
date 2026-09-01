import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, Play, Sparkles, BarChart2, Check, X } from 'lucide-react';
import { runReconciliation, fetchReconciliationSummary } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface ReconciliationViewProps {
  currentOrg?: string;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({ currentOrg = 'NovaTech AI Systems' }) => {
  const [summary, setSummary] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResults, setLastRunResults] = useState<any>(null);
  const [batchSize, setBatchSize] = useState<number>(50);

  const loadSummary = () => {
    fetchReconciliationSummary(currentOrg).then(setSummary);
  };

  useEffect(() => {
    loadSummary();
  }, [currentOrg]);

  const handleRunReconciliation = async () => {
    setIsRunning(true);
    try {
      const res = await runReconciliation(currentOrg, batchSize);
      setLastRunResults(res);
      loadSummary();
    } catch (e) {
      alert("Error running reconciliation engine.");
    } finally {
      setIsRunning(false);
    }
  };

  if (!summary) return <div className="p-8 text-center text-slate-400 font-mono">Loading Reconciliation Engine...</div>;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#1C2541] via-slate-900 to-[#1C2541] border border-blue-500/40 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-blue-500 text-white tracking-widest">10-STAGE ENGINE</span>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="h-6 w-6 text-blue-400" />
              Multi-Source Reconciliation Controller
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Deterministic rules → RapidFuzz entity resolution → Groq AI structured reasoning. Reconciles multi-source records with weighted confidence scores.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="bg-[#0B132B] text-xs text-slate-200 border border-slate-700 px-3 py-2.5 rounded-xl focus:outline-none"
          >
            <option value={10}>10 Records</option>
            <option value={50}>50 Batch Records</option>
            <option value={100}>100 Batch Records</option>
            <option value={500}>500 Stress Test</option>
          </select>

          <button
            onClick={handleRunReconciliation}
            disabled={isRunning}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{isRunning ? "Reconciling..." : "Run Reconciliation"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs font-semibold text-slate-400">Total Records</div>
          <div className="text-2xl font-black text-slate-100">{summary.total_records}</div>
          <div className="text-[11px] text-slate-400">Multi-source batch</div>
        </div>

        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs font-semibold text-emerald-400">Auto Matched</div>
          <div className="text-2xl font-black text-emerald-400">{summary.matched}</div>
          <div className="text-[11px] text-emerald-300">Confidence ≥ 90%</div>
        </div>

        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs font-semibold text-amber-400">Review Queue</div>
          <div className="text-2xl font-black text-amber-400">{summary.pending_human_review}</div>
          <div className="text-[11px] text-amber-300">Human verification</div>
        </div>

        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs font-semibold text-rose-400">Unresolved Exceptions</div>
          <div className="text-2xl font-black text-rose-400">{summary.exceptions}</div>
          <div className="text-[11px] text-rose-300">Mismatches flagged</div>
        </div>

        <div className="p-5 bg-[#1C2541] border border-blue-500/40 rounded-2xl space-y-1 shadow-lg shadow-blue-500/10">
          <div className="text-xs font-semibold text-blue-400">Match Rate</div>
          <div className="text-2xl font-black text-blue-400">{summary.match_rate_pct}%</div>
          <div className="text-[11px] text-blue-300">Avg Conf: {summary.average_confidence}%</div>
        </div>
      </div>

      {/* 10-Stage Pipeline Visual Breakdown & Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stage Execution Pipeline */}
        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            10-Stage Multi-Source Engine Architecture
          </h2>

          <div className="space-y-2 text-xs">
            {[
              { stage: "Stage 1", title: "Exact Reference Matching", weight: "30%", status: "PASSED" },
              { stage: "Stage 2", title: "Invoice Number Resolution", weight: "Invoice ID", status: "PASSED" },
              { stage: "Stage 3", title: "Transaction ID Correlation", weight: "Txn ID", status: "PASSED" },
              { stage: "Stage 4", title: "Exact & Near Amount Match", weight: "25%", status: "PASSED" },
              { stage: "Stage 5", title: "RapidFuzz Entity Resolution", weight: "20%", status: "PASSED" },
              { stage: "Stage 6", title: "Date Window Tolerances (±7d)", weight: "10%", status: "PASSED" },
              { stage: "Stage 7", title: "Description Token Similarity", weight: "10%", status: "PASSED" },
              { stage: "Stage 8", title: "Fuzzy Cross-Attribute Score", weight: "5%", status: "PASSED" },
              { stage: "Stage 9", title: "Groq LLM AI Structured Reasoning", weight: "AI Agent", status: "AI CALL" },
              { stage: "Stage 10", title: "Final Weighted Confidence Calculation", weight: "Threshold", status: "FINAL" }
            ].map((st, idx) => (
              <div key={idx} className="p-2.5 bg-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded bg-blue-600/20 text-blue-400 text-[10px] font-mono font-bold flex items-center justify-center border border-blue-500/30">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-200">{st.title}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-400">Weight: {st.weight}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/20">
                    {st.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reconciliation Funnel Chart & Last Execution Metrics */}
        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-400" />
              Reconciliation Funnel Distribution
            </h2>

            <div className="space-y-3">
              {summary.reconciliation_funnel?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.stage}</span>
                    <span className="font-mono text-blue-400">{item.count} records</span>
                  </div>
                  <div className="h-2 w-full bg-[#0B132B] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / summary.total_records) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Execution Performance */}
          {lastRunResults && (
            <div className="p-4 bg-[#0B132B] border border-blue-500/30 rounded-xl space-y-2 text-xs font-mono">
              <div className="text-blue-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Reconciliation Batch Execution Complete
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Duration: <strong className="text-slate-100">{lastRunResults.metrics.processing_duration_sec}s</strong></div>
                <div>Throughput: <strong className="text-slate-100">{lastRunResults.metrics.throughput_rps} rps</strong></div>
                <div>Match Rate: <strong className="text-emerald-400">{lastRunResults.metrics.match_rate}%</strong></div>
                <div>Avg Conf: <strong className="text-blue-400">{lastRunResults.metrics.average_confidence}%</strong></div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
