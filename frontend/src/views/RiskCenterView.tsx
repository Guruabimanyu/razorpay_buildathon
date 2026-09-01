import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const RiskCenterView: React.FC = () => {
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/risk/').then(r => r.json()).then(setRiskData).catch(() => {
      setRiskData({
        overall_risk_score: 28,
        risk_status: "Low-Medium Risk",
        risk_categories: [
          { category: "Transaction & Fraud Risk", score: 35, status: "Medium", alert_count: 1 },
          { category: "Liquidity & Cash Flow Risk", score: 20, status: "Low", alert_count: 0 },
          { category: "Vendor & Payable Risk", score: 42, status: "Medium", alert_count: 1 },
          { category: "Receivable Collection Risk", score: 68, status: "High", alert_count: 1 },
          { category: "Budget Utilization Risk", score: 50, status: "Medium", alert_count: 1 }
        ],
        active_alerts: [
          { id: 1, severity: "CRITICAL", category: "Duplicate Invoice", title: "Duplicate Invoice Flagged", description: "Invoice #INV-2026-881 for ₹4,85,000 matches previous entry.", impact_amount: 485000, recommended_action: "Hold payment and verify PO contract." },
          { id: 2, severity: "WARNING", category: "Budget Overrun", title: "Marketing Department Over Budget", description: "Marketing spent ₹23.8L against allocated budget of ₹20.0L.", impact_amount: 380000, recommended_action: "Reallocate ₹2L from unused events budget." },
          { id: 3, severity: "WARNING", category: "Receivable Delay Risk", title: "High Delayed Payment Risk for ABC Corp", description: "₹18.0L receivable from ABC Corp has a 72% predicted probability of late payment.", impact_amount: 1800000, recommended_action: "Initiate automated collection reminder." }
        ]
      });
    });
  }, []);

  if (!riskData) return <div className="p-8 text-center text-slate-400 font-mono">Loading Risk Engine...</div>;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Risk Header Score Card */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-2xl">
            {riskData.overall_risk_score}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Financial Risk Center
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase">{riskData.risk_status}</span>
            </h1>
            <p className="text-xs text-slate-400">Continuous 24/7 Anomaly Monitoring & Fraud Prevention</p>
          </div>
        </div>
      </div>

      {/* Categorized Risk Dashboard (Requirement #30) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskData.risk_categories.map((cat: any, idx: number) => (
          <div key={idx} className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span>{cat.category}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cat.status === 'High' ? 'bg-rose-500 text-white' :
                cat.status === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {cat.status} ({cat.score}/100)
              </span>
            </div>
            <div className="w-full bg-[#0B132B] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${cat.score > 60 ? 'bg-rose-500' : cat.score > 35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${cat.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Risk Alerts */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">Active Financial Risk Alerts</h3>
        <div className="space-y-3">
          {riskData.active_alerts.map((alt: any) => (
            <div key={alt.id} className="p-4 bg-[#0B132B] border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${alt.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                  {alt.title}
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">Impact: ₹{alt.impact_amount.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-slate-300">{alt.description}</p>
              <div className="pt-2 border-t border-slate-800 text-xs text-blue-400 font-semibold">
                Action: {alt.recommended_action}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
