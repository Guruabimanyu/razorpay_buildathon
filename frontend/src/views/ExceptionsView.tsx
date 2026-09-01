import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, X } from 'lucide-react';
import { fetchExceptions, resolveException } from '../services/api';

interface ExceptionsViewProps {
  currentOrg?: string;
}

export const ExceptionsView: React.FC<ExceptionsViewProps> = ({ currentOrg = 'NovaTech AI Systems' }) => {
  const [data, setData] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadExceptions = () => {
    fetchExceptions(selectedStatus, selectedCategory, currentOrg).then(setData);
  };

  useEffect(() => {
    loadExceptions();
  }, [selectedStatus, selectedCategory, currentOrg]);

  const handleResolve = async (excId: string) => {
    setResolvingId(excId);
    try {
      await resolveException(excId, "Finance Manager executive override approval.");
      loadExceptions();
    } catch (e) {
      alert("Error resolving exception.");
    } finally {
      setResolvingId(null);
    }
  };

  if (!data) return <div className="p-8 text-center text-slate-400 font-mono">Loading Exception Engine...</div>;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#1C2541] via-slate-900 to-[#1C2541] border border-rose-500/40 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-rose-500 text-white tracking-widest">EXCEPTION CONTROLLER</span>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
              Automated Exception Management Engine
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Categorizes financial anomalies, billing rate surges, duplicate invoices, and tax discrepancies with recommended resolution actions.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-bold">
            {data.open_count} OPEN
          </span>
          <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-bold">
            {data.under_review_count} UNDER REVIEW
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
            <Filter className="h-4 w-4 text-blue-400" />
            <span>Filter Status:</span>
          </div>
          {["All", "OPEN", "UNDER_REVIEW", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'bg-[#0B132B] text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Exceptions Grid */}
      <div className="space-y-4">
        {data.exceptions?.map((exc: any) => (
          <div
            key={exc.exception_id}
            className={`p-5 bg-[#1C2541] border rounded-2xl space-y-3 transition-all ${
              exc.status === 'RESOLVED'
                ? 'border-emerald-500/30 opacity-70'
                : exc.severity === 'CRITICAL'
                ? 'border-rose-500/40 shadow-lg shadow-rose-500/5'
                : 'border-amber-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs text-slate-400">{exc.exception_id}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono uppercase ${
                  exc.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {exc.severity}
                </span>
                <span className="text-xs font-bold text-slate-100">{exc.category.replace('_', ' ')}</span>
                <span className="text-xs text-slate-400 font-mono">({exc.transaction_id})</span>
              </div>

              <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                exc.status === 'RESOLVED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : exc.status === 'UNDER_REVIEW'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {exc.status}
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">{exc.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400">Expected Value:</span>
                <div className="font-bold text-emerald-400">{exc.expected_value}</div>
              </div>
              <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400">Actual Value / Variance:</span>
                <div className="font-bold text-rose-400">{exc.actual_value}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-300">
                <strong className="text-slate-400">Recommended Action:</strong> {exc.recommended_action}
              </div>

              {exc.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolve(exc.exception_id)}
                  disabled={resolvingId === exc.exception_id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 shrink-0 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  {resolvingId === exc.exception_id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Approve & Resolve</span>
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
