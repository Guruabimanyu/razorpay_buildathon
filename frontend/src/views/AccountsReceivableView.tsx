import React from 'react';
import { Clock, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const AccountsReceivableView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Accounts Receivable & AI Collection Predictions
        </h1>
        <p className="text-xs text-slate-400">Predicted Customer Delay Probability & Working Capital Recovery Pipeline</p>

        <div className="p-5 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-amber-400">
            <span>🔴 High Delay Risk Customer Flagged</span>
            <span>72% Delay Probability</span>
          </div>
          <div className="text-sm font-bold text-slate-100">ABC Corp Enterprise — Invoice #INV-REC-904 (₹18,00,000)</div>
          <p className="text-xs text-slate-300">AI Prediction: 72% probability of late payment. Expected delay: 11 days beyond Net-30 term.</p>
          <div className="pt-2 border-t border-amber-900/40 text-xs text-amber-300 font-semibold">
            Action: Send automated early-payment discount notice (2% discount if settled in 5 days).
          </div>
        </div>
      </div>
    </div>
  );
};
