import React, { useState, useEffect } from 'react';
import { Layers, Activity, TrendingUp, TrendingDown, RefreshCw, Filter, ShieldCheck } from 'lucide-react';

export const OptionChainView: React.FC = () => {
  const [symbol, setSymbol] = useState('NIFTY');
  const [optionData, setOptionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadOptionChain = (sym: string) => {
    setLoading(true);
    fetch(`/api/stocks/nse/option-chain?symbol=${sym}`)
      .then(r => r.json())
      .then(data => {
        setOptionData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOptionChain(symbol);
  }, [symbol]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Title & Symbol Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">NSE Option Chain & Derivatives Terminal</h1>
            <p className="text-xs text-slate-400">Live Strike Matrix • Open Interest (OI) Analysis • Max Pain • Put-Call Ratio (PCR)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["NIFTY", "BANKNIFTY", "TCS"].map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                symbol === s ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-[#0B132B] text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
          <button onClick={() => loadOptionChain(symbol)} className="p-2 bg-[#0B132B] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      {optionData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono">Spot Price ({optionData.symbol})</div>
            <div className="text-base font-black text-slate-100 font-mono">₹{optionData.spot_price?.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono">Put-Call Ratio (PCR)</div>
            <div className="text-base font-black text-emerald-400 font-mono">{optionData.pcr} ({optionData.sentiment})</div>
          </div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono">Max Pain Strike</div>
            <div className="text-base font-black text-purple-400 font-mono">₹{optionData.max_pain?.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono">Expiry Date</div>
            <div className="text-base font-black text-slate-100 font-mono">{optionData.expiry_date}</div>
          </div>
        </div>
      )}

      {/* Option Chain Table */}
      {optionData && (
        <div className="bg-[#1C2541] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#0B132B] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th colSpan={5} className="p-2 border-r border-slate-800 text-emerald-400 bg-emerald-950/20">CALL OPTIONS (CE)</th>
                  <th className="p-2 bg-purple-950/30 text-purple-300 font-bold">STRIKE</th>
                  <th colSpan={5} className="p-2 border-l border-slate-800 text-rose-400 bg-rose-950/20">PUT OPTIONS (PE)</th>
                </tr>
                <tr className="border-t border-slate-800">
                  <th className="p-2">OI (Contracts)</th>
                  <th className="p-2">Chg in OI</th>
                  <th className="p-2">Volume</th>
                  <th className="p-2">IV %</th>
                  <th className="p-2 border-r border-slate-800">Call LTP (₹)</th>
                  <th className="p-2 bg-purple-950/30 text-purple-300 font-bold">Price</th>
                  <th className="p-2 border-l border-slate-800">Put LTP (₹)</th>
                  <th className="p-2">IV %</th>
                  <th className="p-2">Volume</th>
                  <th className="p-2">Chg in OI</th>
                  <th className="p-2">OI (Contracts)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-300 text-[11px]">
                {optionData.strikes?.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-800/60 transition-colors ${
                      row.is_atm ? 'bg-amber-500/20 font-bold border-y-2 border-amber-500/50' : idx % 2 === 0 ? 'bg-[#1C2541]' : 'bg-[#0B132B]/50'
                    }`}
                  >
                    <td className="p-2.5 text-slate-400">{row.call.oi.toLocaleString()}</td>
                    <td className="p-2.5 text-emerald-400">+{row.call.change_oi.toLocaleString()}</td>
                    <td className="p-2.5 text-slate-300">{row.call.volume.toLocaleString()}</td>
                    <td className="p-2.5 text-slate-400">{row.call.iv}%</td>
                    <td className="p-2.5 font-bold text-emerald-400 border-r border-slate-800">₹{row.call.ltp}</td>
                    
                    <td className="p-2.5 font-black text-slate-100 bg-purple-950/40 text-xs">
                      {row.strike} {row.is_atm && <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded ml-1">ATM</span>}
                    </td>
                    
                    <td className="p-2.5 font-bold text-rose-400 border-l border-slate-800">₹{row.put.ltp}</td>
                    <td className="p-2.5 text-slate-400">{row.put.iv}%</td>
                    <td className="p-2.5 text-slate-300">{row.put.volume.toLocaleString()}</td>
                    <td className="p-2.5 text-rose-400">+{row.put.change_oi.toLocaleString()}</td>
                    <td className="p-2.5 text-slate-400">{row.put.oi.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
