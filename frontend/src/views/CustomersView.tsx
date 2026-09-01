import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/vendors-customers/').then(r => r.json()).then(res => setCustomers(res.customers || [])).catch(() => {
      setCustomers([
        { id: 1, name: "ABC Corp Enterprise", total_revenue: 24000000, outstanding_amount: 1800000, avg_payment_delay_days: 11, risk_score: 72, late_payment_prob: 0.72 },
        { id: 2, name: "FinTech Global Inc", total_revenue: 48000000, outstanding_amount: 0, avg_payment_delay_days: 2, risk_score: 10, late_payment_prob: 0.05 },
        { id: 3, name: "Nexus Cloud Systems", total_revenue: 16500000, outstanding_amount: 4200000, avg_payment_delay_days: 4, risk_score: 20, late_payment_prob: 0.15 }
      ]);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          Customer Intelligence & Debtor Delay Risks
        </h1>
        <p className="text-xs text-slate-400">Payment Delay Probability, Lifetime Value & Receivables Health</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B132B] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Total LTV Revenue</th>
                <th className="p-3">Outstanding AR</th>
                <th className="p-3">Avg Delay</th>
                <th className="p-3">Late Prob %</th>
                <th className="p-3">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-100">{c.name}</td>
                  <td className="p-3 font-mono">₹{(c.total_revenue/10000000).toFixed(2)} Cr</td>
                  <td className="p-3 font-mono font-bold text-slate-100">₹{(c.outstanding_amount/100000).toFixed(1)}L</td>
                  <td className="p-3 font-mono">{c.avg_payment_delay_days} Days</td>
                  <td className="p-3 font-mono font-bold text-amber-400">{Math.round(c.late_payment_prob * 100)}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.risk_score >= 60 ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {c.risk_score >= 60 ? 'High Delay Risk' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
