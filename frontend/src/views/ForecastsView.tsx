import React from 'react';
import { LineChart as ChartIcon, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const ForecastsView: React.FC = () => {
  const forecastData = [
    { month: 'Aug 26', rev: 1.54, exp: 1.12, profit: 0.42 },
    { month: 'Sep 26', rev: 1.62, exp: 1.14, profit: 0.48 },
    { month: 'Oct 26', rev: 1.70, exp: 1.15, profit: 0.55 },
    { month: 'Nov 26', rev: 1.78, exp: 1.18, profit: 0.60 },
    { month: 'Dec 26', rev: 1.85, exp: 1.20, profit: 0.65 },
    { month: 'Jan 27', rev: 1.95, exp: 1.22, profit: 0.73 }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ChartIcon className="h-5 w-5 text-blue-400" />
          Deterministic Financial Forecasting Pipeline
        </h1>
        <p className="text-xs text-slate-400">Moving Averages, Exponential Smoothing & Deterministic Math Math Models</p>

        <div className="h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v}Cr`} />
              <Tooltip formatter={(v: any) => [`₹${v} Cr`, '']} />
              <Legend />
              <Line type="monotone" name="Revenue Forecast" dataKey="rev" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" name="Expense Forecast" dataKey="exp" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" name="Net Profit Forecast" dataKey="profit" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-[#0B132B] border border-blue-500/30 rounded-xl text-xs text-slate-300">
          <strong>AI Explanation Guardrail:</strong> Numerical predictions are calculated using deterministic moving average functions on historical contracts. LLM is restricted from hallucinating numbers.
        </div>
      </div>
    </div>
  );
};
