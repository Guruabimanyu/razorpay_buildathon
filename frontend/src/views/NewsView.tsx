import React, { useState, useEffect } from 'react';
import { Newspaper, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';

export const NewsView: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/market-news/').then(r => r.json()).then(res => setNews(res.financial_news || [])).catch(() => {
      setNews([
        {
          id: 1, headline: "Global SaaS & Tech Server Infrastructure Costs Surge 18% Amid AI Demand",
          publisher: "Financial Times", timestamp: "2 hours ago", category: "Technology", impact_level: "HIGH", sentiment: "NEGATIVE",
          ai_summary: "Surging GPU demand has led major cloud providers to adjust compute pricing globally.",
          potential_impact: "Engineering cloud opex expected to increase by 8-12% over next quarter.",
          finpilot_action: "Review cloud compute commitments and run cloud cost optimization scan."
        },
        {
          id: 2, headline: "RBI Maintains Policy Repo Rate at 6.5%; Forecasts Steady 7% GDP Growth",
          publisher: "Economic Times", timestamp: "5 hours ago", category: "Economy", impact_level: "MEDIUM", sentiment: "POSITIVE",
          ai_summary: "Central bank maintains monetary policy stability, supporting corporate credit access.",
          potential_impact: "Working capital borrowing costs remain stable.",
          finpilot_action: "No immediate debt restructuring required."
        }
      ]);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-blue-400" />
              Financial News & Impact Engine
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              ● DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-400">Automated Financial Impact Extraction & Executive Recommendation Pipeline</p>
        </div>
      </div>

      {/* News Cards with News-to-Impact Pipeline (Requirement #36) */}
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.publisher} • {item.timestamp}</span>
                <h3 className="font-bold text-slate-100 text-base mt-0.5">{item.headline}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase self-start sm:self-auto ${
                item.impact_level === 'HIGH' ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {item.impact_level} IMPACT
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{item.ai_summary}</p>

            {/* News-to-Impact Engine Box */}
            <div className="p-4 bg-[#0B132B] border border-blue-500/30 rounded-xl space-y-2 text-xs">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                FinPilot AI News-to-Impact Derivation
              </div>
              <div className="text-slate-300 font-medium">
                <strong>Potential Financial Impact:</strong> {item.potential_impact}
              </div>
              <div className="text-emerald-300 font-bold">
                <strong>FinPilot Action:</strong> {item.finpilot_action}
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                * AI-derived scenario impact estimate based on historical category correlation. Not a guaranteed outcome.
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
