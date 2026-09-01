import React, { useState, useEffect } from 'react';
import { 
  Globe, TrendingUp, TrendingDown, Activity, Sparkles, BarChart2, 
  Clock, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export const NSEMarketView: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [indices, setIndices] = useState<any[]>([]);
  const [breadth, setBreadth] = useState<any>(null);
  const [movers, setMovers] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState<any>(null);
  
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY 50');
  const [timeframe, setTimeframe] = useState('6M');
  const [chartHistory, setChartHistory] = useState<any[]>([]);
  const [activeMoverTab, setActiveMoverTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');

  const loadNSEData = () => {
    fetch('/api/stocks/nse/status').then(r => r.json()).then(setMarketStatus);
    fetch('/api/stocks/nse/indices').then(r => r.json()).then(res => setIndices(res.indices || []));
    fetch('/api/stocks/nse/breadth').then(r => r.json()).then(setBreadth);
    fetch('/api/stocks/nse/movers').then(r => r.json()).then(setMovers);
    fetch('/api/stocks/nse/announcements').then(r => r.json()).then(res => setAnnouncements(res.announcements || []));
    fetch('/api/stocks/nse/accuracy').then(r => r.json()).then(setAccuracy);

    // Load chart data
    fetch(`/api/stocks/TCS/history?timeframe=${timeframe}`).then(r => r.json()).then(res => setChartHistory(res.history || []));
  };

  useEffect(() => {
    loadNSEData();
  }, []);

  useEffect(() => {
    fetch(`/api/stocks/TCS/history?timeframe=${timeframe}`).then(r => r.json()).then(res => setChartHistory(res.history || []));
  }, [timeframe, selectedSymbol]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#FF9933] via-white to-[#138808] flex items-center justify-center font-black text-slate-950 text-sm shadow-lg">
            NSE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">NSE India Market Intelligence Terminal</h1>
              {marketStatus && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {marketStatus.status_tag}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Compliant Multi-Market Architecture • Official Licensed Gateway Feed</p>
          </div>
        </div>

        {marketStatus && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-2.5 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[10px]">Market State</div>
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <Activity className="h-3 w-3 animate-pulse" />
                <span>{marketStatus.market_state}</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[10px]">Timestamp</div>
              <div className="font-bold text-slate-200">{marketStatus.timestamp}</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Indices Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {indices.map((idx, i) => (
          <div
            key={i}
            onClick={() => setSelectedSymbol(idx.symbol)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-lg ${
              selectedSymbol === idx.symbol ? 'bg-blue-600/20 border-blue-500/40' : 'bg-[#1C2541] border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>{idx.symbol}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0B132B] text-slate-400">{idx.status}</span>
            </div>
            <div className="text-base font-black text-slate-100 font-mono mt-1">
              {idx.price?.toLocaleString()}
            </div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${idx.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {idx.change_pct >= 0 ? '+' : ''}{idx.change} ({idx.change_pct}%)
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main NIFTY Chart & Market Breadth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">{selectedSymbol} Market Chart</h3>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">Asia/Kolkata IST</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0B132B] p-1 rounded-xl border border-slate-800">
              {["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    timeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <defs>
                  <linearGradient id="niftyColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="close" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#niftyColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Breadth & Turnover (1 col) */}
        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">Market Breadth & Turnover</h3>
          
          {breadth && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex justify-between items-center">
                <span className="text-slate-300 font-medium">Advances (Gainers)</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{breadth.advances}</span>
              </div>
              <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl flex justify-between items-center">
                <span className="text-slate-300 font-medium">Declines (Losers)</span>
                <span className="font-mono font-bold text-rose-400 text-sm">{breadth.declines}</span>
              </div>
              <div className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-300 font-medium">Advance / Decline Ratio</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{breadth.advance_decline_ratio}</span>
              </div>
              <div className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-300 font-medium">NSE Turnover</span>
                <span className="font-mono font-bold text-slate-100 text-sm">{breadth.turnover_cr}</span>
              </div>
            </div>
          )}

          {accuracy && (
            <div className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/30 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">FINPILOT FORECAST ACCURACY</div>
              <div className="text-xl font-black text-slate-100 font-mono">{accuracy.walk_forward_accuracy}</div>
              <div className="text-[11px] text-slate-300 font-mono">MAE: {accuracy.mean_absolute_error_mae} | RMSE: {accuracy.root_mean_square_error_rmse}</div>
            </div>
          )}

        </div>

      </div>

      {/* 4. Movers & Corporate Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Movers */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-100 text-sm">NSE Top Movers</h3>
            <div className="flex gap-1 bg-[#0B132B] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveMoverTab('gainers')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${activeMoverTab === 'gainers' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                Gainers
              </button>
              <button
                onClick={() => setActiveMoverTab('losers')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${activeMoverTab === 'losers' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
              >
                Losers
              </button>
              <button
                onClick={() => setActiveMoverTab('volume')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${activeMoverTab === 'volume' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                Volume
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {movers && (activeMoverTab === 'gainers' ? movers.top_gainers : activeMoverTab === 'losers' ? movers.top_losers : movers.volume_gainers)?.map((stk: any, i: number) => (
              <div key={i} className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-100">{stk.company_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{stk.ticker} • {stk.sector}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-100">₹{stk.current_price?.toLocaleString()}</div>
                  <div className={`text-[11px] font-bold font-mono ${stk.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stk.change_pct >= 0 ? '+' : ''}{stk.change_pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Announcements */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">NSE Corporate Announcements</h3>
          <div className="space-y-2.5 text-xs">
            {announcements.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">{item.type}</span>
                  <span className="text-[10px] text-slate-400">{item.date}</span>
                </div>
                <div className="font-bold text-slate-100">{item.company} ({item.symbol})</div>
                <p className="text-[11px] text-slate-300">{item.event}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
