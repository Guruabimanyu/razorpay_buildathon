import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Search, Filter, Lock } from 'lucide-react';
import { fetchAuditTrail } from '../services/api';

export const AuditTrailView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState<string>('');

  const loadAudit = () => {
    fetchAuditTrail(50).then(setData);
  };

  useEffect(() => {
    loadAudit();
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-400 font-mono">Loading Audit Trail...</div>;

  const logs = data.audit_logs?.filter((l: any) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.user_email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#1C2541] via-slate-900 to-[#1C2541] border border-blue-500/40 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-emerald-500 text-white tracking-widest flex items-center gap-1">
              <Lock className="h-3 w-3" />
              IMMUTABLE LOG
            </span>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-400" />
              Audit Trail & Compliance Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Immutable system audit log recording every automated AI decision, human review approval, dataset upload, and parameter change.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs rounded-xl shrink-0">
          {data.total_count} Verified Audit Entries
        </span>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search audit trail by user, action, or details..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Audit Log Table */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="space-y-3 font-mono text-xs">
          {logs.map((log: any) => (
            <div key={log.id} className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                    {log.action}
                  </span>
                  <span className="text-slate-300">{log.user_email}</span>
                </div>
                <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
              </div>
              <div className="text-slate-200 text-xs font-sans mt-1">{log.details}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
