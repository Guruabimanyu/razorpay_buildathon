import React from 'react';
import { Sparkles, Bot, ShieldCheck, Cpu, TrendingUp, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

interface LandingPageViewProps {
  onLaunchDemo: () => void;
  onExploreCFO: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onLaunchDemo, onExploreCFO }) => {
  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 space-y-16 py-12 px-4 max-w-6xl mx-auto select-none">
      
      {/* Hero Section (Requirement #81) */}
      <div className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Autonomous Financial Operating System</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 leading-tight">
          Your AI CFO That <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Never Sleeps.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          FinPilot continuously analyzes your company's money, predicts financial risk, simulates hiring and expansion scenarios, and tells management exactly what to do next.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onLaunchDemo}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Hackathon Demo</span>
          </button>
          
          <button
            onClick={onExploreCFO}
            className="px-6 py-3.5 bg-[#1C2541] hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-2xl flex items-center gap-2 transition-all"
          >
            <Bot className="h-4 w-4 text-blue-400" />
            <span>Explore AI CFO Workspace</span>
          </button>
        </div>
      </div>

      {/* Product Value Proposition Flow (Requirement #96) */}
      <div className="p-8 bg-[#1C2541] border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">THE FINPILOT PARADIGM</span>
          <h2 className="text-xl font-bold text-slate-100">From Data Reports to Autonomous Action</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-bold font-mono">
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl text-slate-300">DATA</div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl text-blue-400">UNDERSTAND</div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl text-amber-400">DETECT</div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl text-purple-400">PREDICT</div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl text-indigo-400">SIMULATE</div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl text-emerald-400">RECOMMEND</div>
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg">ACTION</div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-3">
          <Cpu className="h-8 w-8 text-indigo-400" />
          <h3 className="font-bold text-slate-100 text-base">Financial Digital Twin</h3>
          <p className="text-xs text-slate-400">Simulate revenue drops, 10 new hires, or marketing expansion in real-time before committing capital.</p>
        </div>

        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-3">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-base">AI Risk & Duplicate OCR</h3>
          <p className="text-xs text-slate-400">Statistical Z-score anomaly scanning automatically catches 91% duplicate invoices & vendor fraud.</p>
        </div>

        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-3">
          <Bot className="h-8 w-8 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-base">Explainable AI CFO</h3>
          <p className="text-xs text-slate-400">Every decision cites strict evidence, financial impact, and backend calculation engine logic.</p>
        </div>
      </div>

    </div>
  );
};
