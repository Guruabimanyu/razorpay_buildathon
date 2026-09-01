import React, { useState } from 'react';
import { Settings, ShieldCheck, Cpu, Save, Users, Building2, Bell } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [minReserve, setMinReserve] = useState(25000000); // ₹2.5 Cr
  const [preferredRunway, setPreferredRunway] = useState(6.0); // 6 Months
  const [approvalThreshold, setApprovalThreshold] = useState(500000); // ₹5 Lakhs
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Organization & CFO Memory Settings
          </h1>
          <p className="text-xs text-slate-400">Configure Minimum Cash Reserves, Approval Thresholds, and RBAC Roles</p>
        </div>
      </div>

      {/* CFO Memory Rules Form (Requirement #68) */}
      <form onSubmit={handleSave} className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-6">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-400" />
          FinPilot AI CFO Memory & Guardrail Thresholds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Minimum Cash Safety Reserve (₹)</label>
            <input
              type="number" value={minReserve} onChange={(e) => setMinReserve(Number(e.target.value))}
              className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono mt-1"
            />
            <p className="text-[10px] text-slate-500 mt-1">CFO Agent triggers critical alerts if cash balance drops below this line.</p>
          </div>

          <div>
            <label className="text-slate-400 font-medium">Preferred Cash Runway Buffer (Months)</label>
            <input
              type="number" step="0.5" value={preferredRunway} onChange={(e) => setPreferredRunway(Number(e.target.value))}
              className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono mt-1"
            />
            <p className="text-[10px] text-slate-500 mt-1">Minimum acceptable runway for Digital Twin scenario approvals.</p>
          </div>

          <div>
            <label className="text-slate-400 font-medium">Executive Approval Threshold (₹)</label>
            <input
              type="number" value={approvalThreshold} onChange={(e) => setApprovalThreshold(Number(e.target.value))}
              className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono mt-1"
            />
            <p className="text-[10px] text-slate-500 mt-1">Transactions exceeding this limit require mandatory CFO authorization.</p>
          </div>
        </div>

        {/* RBAC Roles Summary */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Role-Based Access Control (RBAC)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
              <span className="font-bold text-blue-400">CFO (Sarah Jenkins)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Full financial analysis, forecasts, budgets, AI decision override.</p>
            </div>
            <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
              <span className="font-bold text-slate-200">Finance Manager</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Transactions, invoices, expenses, operational reports.</p>
            </div>
            <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
              <span className="font-bold text-slate-400">Analyst / Employee</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Read-only analytics and limited expense submission access.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && <span className="text-xs text-emerald-400 font-bold">✅ Settings saved to CFO memory!</span>}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

    </div>
  );
};
