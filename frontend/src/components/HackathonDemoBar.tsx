import React from 'react';
import { Sparkles, AlertTriangle, TrendingDown, Users, ShieldAlert, Scissors } from 'lucide-react';

interface HackathonDemoBarProps {
  onSelectPreset: (presetId: string) => void;
}

export const HackathonDemoBar: React.FC<HackathonDemoBarProps> = ({ onSelectPreset }) => {
  const presets = [
    { id: 'expansion', label: 'Afford Expansion?', icon: Users, color: 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30' },
    { id: 'revenue_crash', label: 'Revenue Crash (-20%)', icon: TrendingDown, color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30' },
    { id: 'fraud_detection', label: 'Fraud & Duplicate Check', icon: ShieldAlert, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' },
    { id: 'cost_reduction', label: 'Cut ₹10L Expenses', icon: Scissors, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#1C2541] to-slate-900 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between overflow-x-auto text-xs">
      <div className="flex items-center gap-2 font-bold text-amber-400 shrink-0">
        <Sparkles className="h-4 w-4 animate-spin" />
        <span>HACKATHON DEMO MODES:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        {presets.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${p.color}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-mono">
        <span>Target: NovaTech AI Systems (₹18.4 Cr Rev)</span>
      </div>
    </div>
  );
};
