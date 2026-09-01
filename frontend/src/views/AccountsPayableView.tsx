import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AccountsPayableView: React.FC = () => {
  const schedule = [
    { order: 1, vendor: "Staff Direct (Payroll)", amount: 6400000, due: "In 5 Days", reason: "Critical internal obligation; essential for operational stability.", status: "APPROVED" },
    { order: 2, vendor: "AWS Cloud Services", amount: 284000, due: "In 8 Days", reason: "Key cloud infrastructure dependency; avoid service outage.", status: "APPROVED" },
    { order: 3, vendor: "Alpha Supplies Corp", amount: 485000, due: "Overdue 2 Days", reason: "FLAGGED: 91% duplicate invoice risk.", status: "HELD_FOR_REVIEW" }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-400" />
          Accounts Payable & AI Payment Scheduler
        </h1>
        <p className="text-xs text-slate-400">Prioritized using due dates, vendor criticality, late penalties, and projected cash liquidity.</p>

        <div className="space-y-3">
          {schedule.map((item) => (
            <div key={item.order} className="p-4 bg-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-600/20 text-blue-400 font-mono text-[10px] flex items-center justify-center font-bold">#{item.order}</span>
                  {item.vendor}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{item.reason}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-slate-100 text-xs">₹{item.amount.toLocaleString('en-IN')}</div>
                <div className={`text-[10px] font-bold ${item.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
