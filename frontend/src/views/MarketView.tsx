import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, Newspaper, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MarketView: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/market-news/').then(r => r.json()).then(setData).catch(() => {
      setData({
        data_status: "DEMO DATA",
        data_indicator: "● Demo Data Source",
        market_assets: [
          { symbol: "NIFTY50", name: "NIFTY 50 Index", price: 24850.40, change: 145.20, change_pct: 0.59, volume: "2.4M", sentiment: "BULLISH" },
          { symbol: "USDT/INR", name: "USD / INR Exchange Rate", price: 83.92, change: -0.08, change_pct: -0.10, volume: "18.5B", sentiment: "NEUTRAL" },
          { symbol: "BRENT", name: "Brent Crude Oil", price: 78.45, change: 1.85, change_pct: 2.41, volume: "450K", sentiment: "BEARISH" }
        ],
        external_factor_analysis: {
          summary: "External macro conditions indicate rising cloud hardware tariffs and steady monetary policy rates.",
          impact_channels: [
            { factor: "GPU Compute Supply Tariffs", channel: "Engineering COGS", direction: "Increase (+8-12%)", risk: "Medium" },
            { factor: "Repo Rate Stability (6.5%)", channel: "Working Capital Credit", direction: "Neutral (0%)", risk: "Low" }
          ]
        }
      });
    });
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-400 font-mono">Fetching Financial Market Data...</div>;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Market Intelligence & Asset Ticker</h1>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              {data.data_indicator}
            </span>
          </div>
          <p className="text-xs text-slate-400">Live indices, FX exchange rates, commodities & macroeconomic external factors</p>
        </div>
      </div>

      {/* Asset Tickers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.market_assets.map((a: any) => (
          <div key={a.symbol} className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
              <span>{a.symbol} • {a.name}</span>
              <span className={`font-bold flex items-center ${a.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {a.change_pct >= 0 ? '+' : ''}{a.change_pct}% {a.change_pct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">{a.price}</div>
            <div className="text-[11px] text-slate-400">Volume: {a.volume} • Sentiment: <strong className="text-slate-200">{a.sentiment}</strong></div>
          </div>
        ))}
      </div>

      {/* External Factor Analysis (Requirement #74) */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-[#1C2541] to-slate-900 border border-blue-500/40 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-400" />
          External Factors → Company Impact Engine
        </h3>
        <p className="text-xs text-slate-300">{data.external_factor_analysis.summary}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {data.external_factor_analysis.impact_channels.map((ic: any, idx: number) => (
            <div key={idx} className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-100">{ic.factor}</div>
              <div className="text-slate-400">Channel: <span className="text-blue-300 font-medium">{ic.channel}</span></div>
              <div className="text-slate-300">Expected Direction: <strong className="text-emerald-400">{ic.direction}</strong></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
