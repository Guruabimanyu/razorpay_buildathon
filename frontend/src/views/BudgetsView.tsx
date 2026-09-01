import React, { useState, useEffect } from 'react';
import { PieChart, Scissors, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const [targetReduction, setTargetReduction] = useState<number>(1000000); // ₹10 Lakhs
  const [optimizerRes, setOptimizerRes] = useState<any>(null);

  const fetchOptimization = (target: number) => {
    fetch(`/api/budgets/optimize?target=${target}`).then(r => r.json()).then(setOptimizerRes).catch(() => {
      setOptimizerRes({
        target_reduction: target,
        total_recommended_savings: 860000,
        shortfall: 140000,
        status_summary: "FinPilot AI identified ₹8.6L in high-probability savings across 5 non-critical categories. Additional ₹1.4L required from core headcount or payroll restructuring.",
        recommended_cuts: [
          { category: "SaaS Subscriptions", department: "Engineering", max_cut: 240000, recommendation: "Consolidate redundant monitoring tools and terminate unassigned software seats." },
          { category: "Discretionary Advertising", department: "Marketing", max_cut: 210000, recommendation: "Pause low-converting social acquisition campaigns and renegotiate retainers." },
          { category: "Executive & Sales Travel", department: "Sales", max_cut: 160000, recommendation: "Enforce virtual pitch policy for non-tier-1 prospective clients." },
          { category: "Vendor Services & Advisory", department: "Administration", max_cut: 140000, recommendation: "Renegotiate vendor payment terms from Net-15 to Net-45." },
          { category: "Administrative Catering", department: "Administration", max_cut: 110000, recommendation: "Optimize off-site events and office supplies procurement." }
        ],
        ai_action_plan: [
          "1. Instantly freeze unapproved SaaS purchasing across all engineering teams.",
          "2. Reallocate ₹2.1L from underperforming ad channels to working capital.",
          "3. Issue updated corporate travel policy limiting flights to tier-1 contract closings."
        ]
      });
    });
  };

  useEffect(() => {
    fetchOptimization(targetReduction);
  }, [targetReduction]);

  const departments = [
    { name: "Engineering", budget: 4500000, actual: 4420000, util: 98.2, status: "ON_BUDGET" },
    { name: "Marketing", budget: 2000000, actual: 2380000, util: 119.0, status: "OVER_BUDGET", explanation: "Marketing exceeded monthly budget by 19% due to ad campaign spikes." },
    { name: "Sales", budget: 1800000, actual: 1650000, util: 91.6, status: "ON_BUDGET" },
    { name: "Operations", budget: 1500000, actual: 1480000, util: 98.6, status: "ON_BUDGET" },
    { name: "HR & Admin", budget: 1400000, actual: 1270000, util: 90.7, status: "ON_BUDGET" }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-400" />
            Department Budget Control & AI Optimizer
          </h1>
          <p className="text-xs text-slate-400">Department Utilization Variance & Automated Cost-Reduction Engine</p>
        </div>
      </div>

      {/* Department Utilization Cards */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">Monthly Department Budgets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.name} className={`p-4 rounded-xl border ${d.status === 'OVER_BUDGET' ? 'bg-rose-950/30 border-rose-500/50' : 'bg-[#0B132B] border-slate-800'}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-100 text-sm">{d.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'OVER_BUDGET' ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {d.util}% Utilization
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2">Budget: ₹{(d.budget/100000).toFixed(1)}L | Actual: ₹{(d.actual/100000).toFixed(1)}L</div>
              {d.explanation && <p className="text-[11px] text-rose-300 font-semibold mt-2 pt-2 border-t border-rose-900/40">⚠️ {d.explanation}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* AI Budget Optimizer Engine (Requirement #15) */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-[#1C2541] to-slate-900 border border-blue-500/40 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
              <Scissors className="h-5 w-5 text-blue-400" />
              AI Cost Reduction Optimizer Engine
            </h3>
            <p className="text-xs text-slate-300">Answer question: "What should we cut to save target ₹X Lakhs?"</p>
          </div>

          <div className="flex items-center gap-2 bg-[#0B132B] px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Target Savings:</span>
            <input
              type="number" step="100000"
              value={targetReduction}
              onChange={(e) => setTargetReduction(Number(e.target.value))}
              className="w-28 bg-[#1C2541] text-xs text-blue-400 font-bold px-2 py-1 rounded border border-slate-700 font-mono"
            />
          </div>
        </div>

        {optimizerRes && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0B132B] border border-blue-500/30 rounded-xl text-xs text-slate-200">
              {optimizerRes.status_summary}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Line-Item Cuts (Ranked by ROI)</h4>
              <div className="space-y-2">
                {optimizerRes.recommended_cuts.map((cut: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{cut.category} ({cut.department})</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{cut.recommendation}</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      -₹{(cut.max_cut/100000).toFixed(1)}L
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
