import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap, Activity, CheckCircle2, RefreshCw, ArrowRight, Layers, Database, Lock, TrendingUp, Brain } from 'lucide-react';

interface BootingDashboardProps {
  currentOrg: string;
  onSelectOrg: (org: string) => void;
  onBootComplete: () => void;
}

export const BootingDashboard: React.FC<BootingDashboardProps> = ({
  currentOrg,
  onSelectOrg,
  onBootComplete
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isBootFinished, setIsBootFinished] = useState<boolean>(false);

  const bootSteps = [
    { step: "01/05", title: "Initializing Persistent Financial Store", detail: "Connecting SQLite / Supabase database schemas & ledger tables..." },
    { step: "02/05", title: "Activating CFO Multi-Agent Orchestrator", detail: "Connecting Groq LLM (openai/gpt-oss-120b) reasoning engine..." },
    { step: "03/05", title: "Building Financial Lineage Graph", detail: "Tracing invoice -> payment -> bank -> ledger entity resolution..." },
    { step: "04/05", title: "Verifying GST / TDS Compliance Rules", detail: "Validating GSTIN regex, IRN signals, and Section 194C thresholds..." },
    { step: "05/05", title: "Launching Autonomous Control Tower", detail: "All sub-agents operational. closed-loop governance initialized." }
  ];

  const orgs = [
    "NovaTech AI Systems",
    "MediCore Healthcare",
    "GreenCart E-Commerce",
    "UrbanBite FoodTech"
  ];

  useEffect(() => {
    setProgress(0);
    setCurrentStepIndex(0);
    setIsBootFinished(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBootFinished(true);
          return 100;
        }
        const next = prev + 4;
        const stepIdx = Math.min(Math.floor((next / 100) * bootSteps.length), bootSteps.length - 1);
        setCurrentStepIndex(stepIdx);
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [currentOrg]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] text-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl w-full bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative backdrop-blur-xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-white tracking-tight">FinPilot AI</span>
                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded-full font-mono">
                  v1.0.0 MONOREPO
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Tagline: <strong className="text-blue-300">"Verify every rupee. Explain every decision. Predict the next risk."</strong>
              </p>
            </div>
          </div>

          {/* Org Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold px-2">Target Org:</span>
            <select
              value={currentOrg}
              onChange={(e) => onSelectOrg(e.target.value)}
              className="bg-slate-900 text-xs font-bold text-blue-300 border border-slate-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {orgs.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Boot Status Banner */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 font-mono">
              <Activity className="h-4 w-4 animate-spin text-blue-400" />
              <span>SYSTEM BOOTING & DIAGNOSTIC SEQUENCE ({progress}%)</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              {bootSteps[currentStepIndex].step}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-150 shadow-md"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Current Boot Stage Detail */}
          <div className="flex items-start space-x-3 text-xs bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${progress === 100 ? 'text-emerald-400' : 'text-blue-400 animate-pulse'}`} />
            <div>
              <div className="font-bold text-white text-xs">{bootSteps[currentStepIndex].title}</div>
              <div className="text-slate-400 text-[11px] mt-0.5 font-mono">{bootSteps[currentStepIndex].detail}</div>
            </div>
          </div>
        </div>

        {/* Live Diagnostics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Finance Control Score</div>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              <span>84.0</span>
              <span className="text-[10px] text-emerald-400 font-normal">/ 100</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Close Readiness</div>
            <div className="text-lg font-black text-blue-400">92.0%</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Cash Reserves</div>
            <div className="text-lg font-black text-emerald-400">₹4.82 Cr</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Sub-Agents Logged</div>
            <div className="text-lg font-black text-purple-400">5 Active</div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-5">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Closed-Loop Autonomy Level 4 Governance Active</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setProgress(0);
                setIsBootFinished(false);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
              <span>Re-Run Boot Test</span>
            </button>
            
            <button
              onClick={onBootComplete}
              disabled={!isBootFinished}
              className={`flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 ${
                !isBootFinished ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'
              }`}
            >
              <span>Enter Autonomous Control Tower</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
