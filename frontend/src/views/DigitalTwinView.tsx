import React, { useState, useEffect } from 'react';
import { Cpu, Play, Sparkles, CheckCircle2, XCircle, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';
import { simulateDigitalTwin } from '../services/api';
import { DigitalTwinSimulation } from '../types';

interface DigitalTwinViewProps {
  onOpenAskCFO: (query?: string) => void;
  presetScenario?: any;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ onOpenAskCFO, presetScenario }) => {
  const [revChange, setRevChange] = useState<number>(0);
  const [expChange, setExpChange] = useState<number>(0);
  const [hiring, setHiring] = useState<number>(0);
  const [marketingDelta, setMarketingDelta] = useState<number>(0);
  const [capex, setCapex] = useState<number>(0);

  const [simulation, setSimulation] = useState<DigitalTwinSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Apply preset scenario if passed
  useEffect(() => {
    if (presetScenario) {
      const inputs = presetScenario.inputs || {};
      setRevChange(inputs.revenue_change_pct || 0);
      setExpChange(inputs.expense_change_pct || 0);
      setHiring(inputs.hiring_count || 0);
      setMarketingDelta(inputs.marketing_delta || 0);
      setCapex(inputs.lump_sum_capex || 0);
    }
  }, [presetScenario]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    const result = await simulateDigitalTwin({
      revenue_change_pct: revChange,
      expense_change_pct: expChange,
      hiring_count: hiring,
      marketing_delta: marketingDelta,
      lump_sum_capex: capex
    });
    setSimulation(result);
    setIsSimulating(false);
  };

  useEffect(() => {
    handleRunSimulation();
  }, [revChange, expChange, hiring, marketingDelta, capex]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-gradient-to-r from-indigo-900/60 via-[#1C2541] to-slate-900 border border-indigo-500/40 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-400 animate-pulse" />
            <h1 className="text-xl font-black text-slate-100">Financial Digital Twin Matrix</h1>
          </div>
          <p className="text-xs text-slate-300">Virtual financial model of NovaTech AI Systems. Adjust variables on the left to simulate live cash runway, profit, and risk.</p>
        </div>
        <button
          onClick={() => onOpenAskCFO("Can we afford expansion under this digital twin simulation?")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask CFO Verdict</span>
        </button>
      </div>

      {/* Preset Scenario Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="text-slate-400 font-semibold">Preset Scenarios:</span>
        <button
          onClick={() => { setRevChange(-20); setExpChange(0); setHiring(0); setMarketingDelta(0); setCapex(0); }}
          aria-label="Load preset: Revenue Crisis (-20%)"
          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
        >
          Revenue Crash (-20%)
        </button>
        <button
          onClick={() => { setRevChange(0); setExpChange(0); setHiring(10); setMarketingDelta(500000); setCapex(0); }}
          aria-label="Load preset: Rapid Hiring (+10 employees)"
          className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30"
        >
          Rapid Hiring (+10 Employees)
        </button>
        <button
          onClick={() => { setRevChange(10); setExpChange(5); setHiring(5); setMarketingDelta(300000); setCapex(5000000); }}
          aria-label="Load preset: New Branch Expansion (₹50L Capex)"
          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30"
        >
          New Branch Expansion (₹50L Capex)
        </button>
        <button
          onClick={() => { setRevChange(0); setExpChange(-15); setHiring(0); setMarketingDelta(0); setCapex(0); }}
          aria-label="Load preset: Cost Reduction (-15% Opex)"
          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
        >
          Cost Cut (-15% Opex)
        </button>
      </div>

      {/* Split Screen Experience (Requirement #22) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SCENARIO CONTROLS */}
        <div className="lg:col-span-5 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm">Scenario Control Variables</h3>
            <button
              onClick={() => { setRevChange(0); setExpChange(0); setHiring(0); setMarketingDelta(0); setCapex(0); }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Reset Baseline
            </button>
          </div>

          {/* Variable 1: Revenue Change % */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Revenue Growth / Contraction</span>
              <span className={revChange >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {revChange > 0 ? `+${revChange}%` : `${revChange}%`}
              </span>
            </div>
            <input
              type="range" min="-40" max="50" step="5"
              value={revChange}
              onChange={(e) => setRevChange(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Variable 2: Opex Change % */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">General Expense Change %</span>
              <span className={expChange <= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {expChange > 0 ? `+${expChange}%` : `${expChange}%`}
              </span>
            </div>
            <input
              type="range" min="-30" max="40" step="5"
              value={expChange}
              onChange={(e) => setExpChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Variable 3: Hiring Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">New Employee Hires</span>
              <span className="text-blue-400 font-bold">+{hiring} Employees</span>
            </div>
            <input
              type="range" min="0" max="30" step="1"
              value={hiring}
              onChange={(e) => setHiring(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 font-mono">Added Monthly Payroll: ₹{((hiring * 100000)/100000).toFixed(1)}L/mo</div>
          </div>

          {/* Variable 4: Marketing Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Monthly Extra Marketing Spend</span>
              <span className="text-blue-400 font-bold">₹{(marketingDelta/100000).toFixed(1)} Lakhs</span>
            </div>
            <input
              type="range" min="0" max="2000000" step="100000"
              value={marketingDelta}
              onChange={(e) => setMarketingDelta(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Variable 5: Lump Sum Capex */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Lump-Sum Investment / Capex</span>
              <span className="text-purple-400 font-bold">₹{(capex/100000).toFixed(1)} Lakhs</span>
            </div>
            <input
              type="range" min="0" max="10000000" step="500000"
              value={capex}
              onChange={(e) => setCapex(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE SIMULATION IMPACT & CFO VERDICT */}
        <div className="lg:col-span-7 space-y-6">
          {simulation && (
            <>
              {/* CFO Verdict Box */}
              <div className={`p-6 rounded-2xl border shadow-2xl space-y-3 ${
                simulation.cfo_verdict === 'REJECT'
                  ? 'bg-rose-950/40 border-rose-500/50'
                  : simulation.cfo_verdict === 'DELAY'
                  ? 'bg-amber-950/40 border-amber-500/50'
                  : 'bg-emerald-950/40 border-emerald-500/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">FINPILOT AI CFO VERDICT</div>
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                    simulation.cfo_verdict === 'REJECT'
                      ? 'bg-rose-500 text-white'
                      : simulation.cfo_verdict === 'DELAY'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {simulation.cfo_verdict}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-100 leading-relaxed">{simulation.ai_reasoning}</p>
              </div>

              {/* Simulation Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Revenue */}
                <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Monthly Revenue</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-100">₹{(simulation.simulation.sim_revenue/10000000).toFixed(2)} Cr</span>
                    <span className="text-xs text-slate-400">Base: ₹1.54 Cr</span>
                  </div>
                </div>

                {/* Expenses */}
                <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Monthly Expenses</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-100">₹{(simulation.simulation.sim_expenses/10000000).toFixed(2)} Cr</span>
                    <span className="text-xs text-slate-400">Base: ₹1.12 Cr</span>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Monthly Net Profit</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-bold ${simulation.simulation.sim_net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{(simulation.simulation.sim_net_profit/100000).toFixed(1)} Lakhs
                    </span>
                    <span className="text-xs text-slate-400">Base: ₹42.0L</span>
                  </div>
                </div>

                {/* Runway */}
                <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Cash Runway</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-bold ${simulation.simulation.sim_runway >= 6 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simulation.simulation.sim_runway} Months
                    </span>
                    <span className="text-xs text-slate-400">Base: 8.7 Mo</span>
                  </div>
                </div>

              </div>

              {/* Scenario Comparison Table */}
              <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-Scenario Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0B132B] text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2">Scenario</th>
                        <th className="p-2">Revenue</th>
                        <th className="p-2">Expenses</th>
                        <th className="p-2">Runway</th>
                        <th className="p-2">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr className="hover:bg-slate-800/30">
                        <td className="p-2 font-semibold">Baseline Trajectory</td>
                        <td className="p-2">₹1.54 Cr</td>
                        <td className="p-2">₹1.12 Cr</td>
                        <td className="p-2">8.7 Mo</td>
                        <td className="p-2 text-emerald-400 font-bold">HEALTHY</td>
                      </tr>
                      <tr className="bg-blue-600/10 font-bold border-l-2 border-blue-500">
                        <td className="p-2">Active Simulation</td>
                        <td className="p-2">₹{(simulation.simulation.sim_revenue/10000000).toFixed(2)} Cr</td>
                        <td className="p-2">₹{(simulation.simulation.sim_expenses/10000000).toFixed(2)} Cr</td>
                        <td className="p-2">{simulation.simulation.sim_runway} Mo</td>
                        <td className={`p-2 ${simulation.cfo_verdict === 'REJECT' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {simulation.cfo_verdict}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
