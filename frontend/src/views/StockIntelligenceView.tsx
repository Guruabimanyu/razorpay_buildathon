import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Search, Filter, ShieldCheck, Sparkles, 
  BarChart2, LineChart as LineIcon, Activity, Globe, Eye, Bookmark, 
  Layers, ChevronRight, AlertTriangle, ArrowRight, Download, RefreshCw, Layers3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export const StockIntelligenceView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [marketPulse, setMarketPulse] = useState<any>(null);

  const [timeframe, setTimeframe] = useState('6M');
  const [chartType, setChartType] = useState<'Area' | 'Line' | 'Bar'>('Area');
  const [showSMA, setShowSMA] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState('1M');
  const [compareTickers, setCompareTickers] = useState<string[]>(['TCS', 'INFY']);
  const [compareData, setCompareData] = useState<any[]>([]);

  const loadStockData = (ticker: string) => {
    fetch(`/api/stocks/${ticker}`).then(r => r.json()).then(data => {
      setSelectedStock(data);
    });

    fetch(`/api/stocks/${ticker}/history?timeframe=${timeframe}`).then(r => r.json()).then(data => {
      setHistory(data.history || []);
    });

    fetch(`/api/stocks/${ticker}/forecast`).then(r => r.json()).then(data => {
      setForecast(data);
    });

    fetch(`/api/stocks/${ticker}/news`).then(r => r.json()).then(data => {
      setNews(data.news || []);
    });
  };

  const loadMarketPulse = () => {
    fetch('/api/stocks/market-pulse').then(r => r.json()).then(setMarketPulse);
    fetch('/api/stocks/watchlist/list').then(r => r.json()).then(res => setWatchlist(res.watchlist || []));
  };

  useEffect(() => {
    loadMarketPulse();
    loadStockData('TCS');
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetch(`/api/stocks/${selectedStock.ticker}/history?timeframe=${timeframe}`).then(r => r.json()).then(data => {
        setHistory(data.history || []);
      });
    }
  }, [timeframe]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    loadStockData(searchQuery.trim().toUpperCase());
  };

  const handleToggleWatchlist = (ticker: string) => {
    fetch('/api/stocks/watchlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker })
    }).then(() => loadMarketPulse());
  };

  const handleCompare = () => {
    fetch('/api/stocks/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers: compareTickers })
    }).then(r => r.json()).then(res => setCompareData(res.comparison || []));
  };

  useEffect(() => {
    handleCompare();
  }, [compareTickers]);

  if (!selectedStock) return <div className="p-8 text-center text-slate-400 font-mono">Loading Stock Intelligence Engine...</div>;

  const currentFc = forecast?.forecasts?.[selectedHorizon];

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Market Pulse Top Banner */}
      {marketPulse && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
          {marketPulse.indices?.map((idx: any, i: number) => (
            <div key={i} className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">{idx.symbol}</div>
                <div className="text-sm font-black text-slate-100 font-mono mt-0.5">{idx.price}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">{idx.change_pct}</span>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">{idx.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Global Stock Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30">
            {selectedStock.ticker.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100">{selectedStock.company_name}</h1>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">{selectedStock.ticker}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{selectedStock.exchange} • {selectedStock.country}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedStock.sector} • Data Source: <strong className="text-blue-400">{selectedStock.data_source}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {selectedStock.currency} {selectedStock.current_price?.toLocaleString()}
            </div>
            <div className={`text-xs font-bold font-mono ${selectedStock.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {selectedStock.change_pct >= 0 ? '+' : ''}{selectedStock.change_amount} ({selectedStock.change_pct}%) Today
            </div>
          </div>

          {(() => {
            const isWatchlisted = watchlist.some((w: any) => (typeof w === 'string' ? w : w.ticker) === selectedStock.ticker);
            return (
              <button
                onClick={() => {
                  if (isWatchlisted) {
                    fetch(`/api/stocks/watchlist/${selectedStock.ticker}`, { method: 'DELETE' }).then(() => loadMarketPulse());
                  } else {
                    fetch('/api/stocks/watchlist/add', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ticker: selectedStock.ticker })
                    }).then(() => loadMarketPulse());
                  }
                }}
                className={`px-3.5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shrink-0 transition-all ${
                  isWatchlisted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{isWatchlisted ? '✓ In Watchlist' : '+ Watchlist'}</span>
              </button>
            );
          })()}
        </div>

      </div>

      {/* Stock Search Input & Quick Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stock ticker (TCS, INFY, NVDA, AAPL, RELIANCE)..."
            className="w-full bg-[#0B132B] text-xs text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Popular Stocks:</span>
          {["TCS", "INFY", "RELIANCE", "HDFCBANK", "NVDA", "AAPL", "MSFT"].map((t) => (
            <button
              key={t}
              onClick={() => loadStockData(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedStock.ticker === t ? 'bg-blue-600 text-white shadow-md' : 'bg-[#0B132B] text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Chart & Timeframe Toolbar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Interactive Price Chart & Technicals */}
        <div className="lg:col-span-2 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSMA(!showSMA)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                  showSMA ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' : 'bg-[#0B132B] text-slate-400 border-slate-700'
                }`}
              >
                SMA 20
              </button>
              <button
                onClick={() => setShowRSI(!showRSI)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                  showRSI ? 'bg-purple-600/30 text-purple-300 border-purple-500/40' : 'bg-[#0B132B] text-slate-400 border-slate-700'
                }`}
              >
                RSI 14
              </button>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="stockColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="close" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#stockColor)" />
                {showSMA && <Area type="monotone" dataKey="sma_20" stroke="#818CF8" strokeDasharray="4 4" fill="none" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Histogram Chart */}
          <div className="h-20 w-full border-t border-slate-800/80 pt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volume Histogram</div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history.slice(-30)}>
                <Bar dataKey="volume" fill="#475569" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Right 1 Column: FinPilot Stock AI Score & Forecast Module */}
        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-6 shadow-xl">
          
          {/* AI Score Badge */}
          <div className="p-4 bg-gradient-to-br from-blue-900/40 via-[#0B132B] to-slate-900 border border-blue-500/40 rounded-xl text-center space-y-1">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">FINPILOT AI ANALYTICAL SCORE</div>
            <div className="text-4xl font-black text-slate-100 font-mono">{selectedStock.ai_score} <span className="text-lg text-slate-400 font-normal">/ 100</span></div>
            <div className="text-xs text-emerald-400 font-bold">Strong Technical & Fundamental Health</div>
          </div>

          {/* Forecast Multi-Horizon Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-400" />
                AI Probabilistic Stock Forecast
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Ensemble v2.4</span>
            </div>

            <div className="flex gap-1 bg-[#0B132B] p-1 rounded-xl border border-slate-800">
              {["1D", "1W", "1M", "3M", "6M", "1Y"].map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    selectedHorizon === h ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Horizon Output Cards */}
            {currentFc && (
              <div className="space-y-2 text-xs">
                
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-0.5">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Bull Case Scenario (High Growth)</div>
                  <div className="font-mono font-bold text-emerald-200">{currentFc.bull_range}</div>
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-0.5">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Base Case Scenario (Expected)</div>
                  <div className="font-mono font-bold text-blue-200">{currentFc.base_range}</div>
                </div>

                <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-0.5">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Bear Case Scenario (Downside Risk)</div>
                  <div className="font-mono font-bold text-rose-200">{currentFc.bear_range}</div>
                </div>

                <div className="p-2.5 bg-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Confidence: <strong className="text-emerald-400 font-mono">{currentFc.confidence_pct}%</strong></span>
                  <span className="text-slate-400 font-medium">Risk: <strong className="text-amber-400">{currentFc.risk_level}</strong></span>
                </div>

                <div className="text-[10px] text-slate-500 italic pt-1">
                  ⚠️ Disclaimer: FinPilot forecasts are analytical estimates based on statistical models and historical data, not guaranteed outcomes or investment advice.
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* 4. Fundamentals & News Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fundamentals & Key Metrics */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">Financial Fundamentals</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[10px]">P/E Ratio</div>
              <div className="text-sm font-bold text-slate-100 font-mono">{selectedStock.pe_ratio}x</div>
            </div>
            <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[10px]">Revenue Growth MoM</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">+{selectedStock.revenue_growth_pct || selectedStock.revenue_growth}%</div>
            </div>
            <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[10px]">Net Margin %</div>
              <div className="text-sm font-bold text-slate-100 font-mono">{selectedStock.net_margin_pct || selectedStock.net_margin}%</div>
            </div>
            <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[10px]">52-Week High / Low</div>
              <div className="text-xs font-bold text-slate-200 font-mono">{selectedStock.fifty_two_week_high || selectedStock["52w_high"]} / {selectedStock.fifty_two_week_low || selectedStock["52w_low"]}</div>
            </div>
          </div>
        </div>

        {/* News & Sentiment Impact */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">Stock News & AI Impact Sentiment</h3>
          <div className="space-y-2.5">
            {news.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">{item.sentiment} Sentiment</span>
                  <span className="text-[10px] text-slate-400">{item.published_at}</span>
                </div>
                <div className="text-xs font-bold text-slate-100">{item.headline}</div>
                <p className="text-[11px] text-slate-400">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
