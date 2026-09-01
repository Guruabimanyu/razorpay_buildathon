import React from 'react';
import { Bell, ShieldAlert, AlertTriangle } from 'lucide-react';

export const AlertsView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-400" />
          Proactive Financial Alerts & Notification Center
        </h1>
        <p className="text-xs text-slate-400">Proactively identifies financial problems instead of waiting for the user to ask.</p>

        <div className="space-y-3">
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-rose-300">🔴 CRITICAL: Duplicate Invoice Detected</div>
            <p className="text-slate-300">Invoice #INV-2026-881 for ₹4,85,000 matches previous entry for Alpha Supplies Corp.</p>
          </div>
          <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-amber-300">🟠 WARNING: Marketing Budget Overrun</div>
            <p className="text-slate-300">Marketing department spent ₹23.8L against allocated budget of ₹20.0L (+19% variance).</p>
          </div>
          <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-amber-300">🟠 WARNING: Receivable Delay Alert</div>
            <p className="text-slate-300">₹18.0L receivable from ABC Corp Enterprise has a 72% predicted probability of late payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
