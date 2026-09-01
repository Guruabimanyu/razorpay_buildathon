import React, { useState, useEffect } from 'react';
import { Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const VendorsView: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/vendors-customers/').then(r => r.json()).then(setData).catch(() => {
      setData({
        vendors: [
          { id: 1, name: "Alpha Supplies Corp", category: "Hardware", total_spend: 1850000, txn_count: 6, risk_score: 82, renegotiation_candidate: true, duplicate_invoice_count: 1 },
          { id: 2, name: "AWS Cloud Services", category: "SaaS & Cloud", total_spend: 3420000, txn_count: 12, risk_score: 25, renegotiation_candidate: false },
          { id: 3, name: "Global Media Ads", category: "Marketing", total_spend: 2380000, txn_count: 4, risk_score: 65, renegotiation_candidate: true }
        ],
        renegotiation_suggestions: [
          { vendor: "Alpha Supplies Corp", potential_savings: "₹2.4L", reason: "4.1x higher invoice variation; candidate for Net-45 renegotiation." },
          { vendor: "Global Media Ads", potential_savings: "₹2.1L", reason: "Low ROI conversion relative to historical customer acquisition cost." }
        ]
      });
    });
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-400 font-mono">Loading Vendor Intelligence...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-400" />
          Vendor Intelligence & Renegotiation Candidates
        </h1>

        {/* Renegotiation Cards (Requirement #31) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Vendor Renegotiation Candidates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.renegotiation_suggestions.map((r: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#0B132B] border border-blue-500/30 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-100">
                  <span>{r.vendor}</span>
                  <span className="text-emerald-400 font-mono">Save: {r.potential_savings}</span>
                </div>
                <p className="text-slate-300">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B132B] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Vendor</th>
                <th className="p-3">Category</th>
                <th className="p-3">Total Spend</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.vendors.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-100">{v.name}</td>
                  <td className="p-3">{v.category}</td>
                  <td className="p-3 font-mono font-bold">₹{v.total_spend.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono font-bold text-amber-400">{v.risk_score} / 100</td>
                  <td className="p-3">
                    {v.renegotiation_candidate ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">Renegotiate</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Verified</span>
                    )}
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
