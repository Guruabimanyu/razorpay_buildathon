import React, { useState } from 'react';
import { Bot, Sparkles, Send, ShieldCheck, History, CheckCircle2 } from 'lucide-react';
import { askFinPilotCFO } from '../services/api';
import { CFOAgentResponse } from '../types';

export const AICFOView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CFOAgentResponse | null>(null);

  const handleAsk = async (qToAsk?: string) => {
    const q = qToAsk || query;
    if (!q.trim()) return;

    setLoading(true);
    const res = await askFinPilotCFO(q);
    setResponse(res);
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Ask FinPilot AI CFO & Decision Log</h1>
            <p className="text-xs text-slate-400">Natural Language CFO with Deterministic Tool Calling & Audit Trail</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="flex gap-2 pt-2">
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything (e.g. Why did expenses increase? Can we afford 10 hires?)..."
            className="flex-1 bg-[#0B132B] text-xs text-slate-100 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit" disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? "Analyzing..." : "Ask CFO"}</span>
          </button>
        </form>
      </div>

      {/* Response Box */}
      {response && (
        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl animate-in fade-in">
          <div className="text-xs font-mono text-slate-400 bg-[#0B132B] p-2.5 rounded-lg border border-slate-800">
            Query: "{response.user_prompt}"
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">CFO ANSWER</div>
            <p className="text-sm font-bold text-slate-100 leading-relaxed">{response.answer}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Reasoning</div>
              <p className="text-slate-300">{response.why}</p>
            </div>
            <div className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Evidence</div>
              <ul className="space-y-1 text-slate-300">
                {response.evidence.map((e, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Decision Log / Audit Trail (Requirement #67) */}
          <div className="p-4 bg-[#0B132B] border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-blue-400" />
              Enterprise AI Audit Trail
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Agents Involved: <span className="text-slate-200">{response.agents_involved.join(', ')}</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Tools Executed: <span className="text-slate-200">{response.tools_called.join(', ')}</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Confidence Score: <span className="text-emerald-400 font-bold">{response.confidence}%</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
