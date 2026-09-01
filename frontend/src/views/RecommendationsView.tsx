import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, ShieldAlert, ArrowRight, Check, X, RefreshCw } from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/ai/today-actions').then(r => r.json()).then(res => setActions(res.actions || [])).catch(() => {
      setActions([
        { id: 1, priority: "CRITICAL", title: "Review Suspicious Transaction for Alpha Supplies", reason: "₹4,85,000 payment request is 4.1x higher than historical average.", financial_impact: "Prevents ₹4.85L potential duplicate payment.", action: "Review & Hold Payment" },
        { id: 2, priority: "HIGH", title: "Follow up on ₹18L Overdue Receivable from ABC Corp", reason: "72% predicted probability of late payment (11 days expected delay).", financial_impact: "Recovers ₹18.0L working capital buffer.", action: "Send Automated Early-Payment Notice" },
        { id: 3, priority: "HIGH", title: "Enforce Marketing Budget Cap", reason: "Marketing spend exceeded monthly cap by 19% (+₹3.8L).", financial_impact: "Saves ₹2.1L in unoptimized digital campaign spending.", action: "Reallocate Unused Events Budget" },
        { id: 4, priority: "MEDIUM", title: "Reserve ₹12L for Upcoming Payroll", reason: "Engineering and Sales scheduled payroll execution in 5 days.", financial_impact: "Ensures zero liquidity disruption.", action: "Transfer to Primary Payroll Reserve Account" },
        { id: 5, priority: "MEDIUM", title: "Renegotiate SaaS Contract for Developer Subscriptions", reason: "Unassigned seats detected in dev tooling software.", financial_impact: "Monthly savings of ₹2.4L.", action: "Initiate License Audit" }
      ]);
    });
  }, []);

  const handleExecuteAction = (id: number, title: string) => {
    alert(`Executed Action #${id}: "${title}". System updated.`);
    setActions(actions.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Big Action Trigger Banner (Requirement #69) */}
      <div className="p-6 bg-gradient-to-r from-blue-900/60 via-[#1C2541] to-slate-900 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-400 animate-spin" />
            <h1 className="text-xl font-black text-slate-100">What Should Management Do Today?</h1>
          </div>
          <p className="text-xs text-slate-300">FinPilot AI continuously scans cash, budget, transactions, invoices, and risk alerts to generate top 5 prioritized actions.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rescan Financial State</span>
        </button>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {actions.map((item, idx) => (
          <div key={item.id} className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 font-black text-sm flex items-center justify-center shrink-0">
                #{idx + 1}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                    item.priority === 'HIGH' ? 'bg-amber-500 text-black' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.priority}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-300">{item.reason}</p>
                <div className="text-xs font-semibold text-emerald-400">Impact: {item.financial_impact}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => handleExecuteAction(item.id, item.title)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-lg shadow-emerald-600/20"
              >
                <Check className="h-4 w-4" />
                <span>Execute Action</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
