import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Activity, ShieldAlert,
  Sparkles, ArrowUpRight, ArrowDownRight, Bot, ChevronRight, CheckCircle2,
  Building2, MapPin, Users, FileText, CreditCard, Tag, Landmark
} from 'lucide-react';
import { fetchOverviewData } from '../services/api';
import { FinancialHealth, ExecutiveBrief } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OverviewViewProps {
  onOpenAskCFO: (query?: string) => void;
  onNavigateView: (view: string) => void;
  currentOrg?: string;
}

const ORG_PROFILES: Record<string, any> = {
  'NovaTech AI Systems': {
    name: 'NovaTech AI Systems',
    legal_name: 'NovaTech AI Solutions Private Limited',
    sector: 'B2B Enterprise SaaS & AI Infrastructure',
    tagline: 'Generative AI Compute & Enterprise Intelligence',
    gstin: '29AAACN9821K1ZB',
    location: 'Koramangala, Bengaluru, Karnataka',
    employees: '48 Full-time Engineers & Ops',
    business_model: 'Annual SaaS Subscriptions & Consumption Compute',
    primary_bank: 'HDFC Bank Commercial (A/c ...2341)',
    theme_gradient: 'from-[#1C2541] via-[#0B132B] to-[#1C2541] border-blue-500/40',
    badge_color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    accent: 'text-blue-400',
    icon_bg: 'bg-blue-600/20 text-blue-400 border-blue-500/40'
  },
  'GreenCart E-Commerce': {
    name: 'GreenCart E-Commerce',
    legal_name: 'GreenCart Retail Technologies Private Limited',
    sector: 'Direct-to-Consumer (D2C) & E-Commerce Platform',
    tagline: 'Sustainable Consumer Goods & Rapid Delivery',
    gstin: '27AABCG4512L1ZC',
    location: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra',
    employees: '112 Logistics, Warehouse & Sales Ops',
    business_model: 'Gross Merchandise Value (GMV) & Merchant Fees',
    primary_bank: 'Axis Bank Commercial (A/c ...1290)',
    theme_gradient: 'from-[#064E3B]/60 via-[#0B132B] to-[#064E3B]/40 border-emerald-500/40',
    badge_color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    accent: 'text-emerald-400',
    icon_bg: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
  },
  'MediCore Healthcare': {
    name: 'MediCore Healthcare',
    legal_name: 'MediCore Diagnostics & Hospitals Private Limited',
    sector: 'Multi-Specialty Diagnostics & Clinical Labs',
    tagline: 'Advanced Diagnostic Pathology & Healthcare Supplies',
    gstin: '36AABCM3382P1ZD',
    location: 'HITECH City, Hyderabad, Telangana',
    employees: '240 Pathologists, Doctors & Technicians',
    business_model: 'Hospital Diagnostic Contracts & Patient Testing',
    primary_bank: 'State Bank of India Treasury (A/c ...2384)',
    theme_gradient: 'from-[#155E75]/60 via-[#0B132B] to-[#155E75]/40 border-cyan-500/40',
    badge_color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    accent: 'text-cyan-400',
    icon_bg: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40'
  },
  'UrbanBite FoodTech': {
    name: 'UrbanBite FoodTech',
    legal_name: 'UrbanBite Hospitality & Kitchens Private Limited',
    sector: 'Dark Kitchen Hubs & Quick Service Delivery (QSR)',
    tagline: 'Multi-Brand Cloud Kitchens & Corporate Catering',
    gstin: '07AABCU1190R1ZE',
    location: 'Cyber City, Gurugram, Delhi NCR',
    employees: '85 Kitchen Chefs, Staff & Delivery Ops',
    business_model: 'Food Delivery Volume (Swiggy/Zomato) & Subscriptions',
    primary_bank: 'ICICI FoodTech Account (A/c ...2312)',
    theme_gradient: 'from-[#7C2D12]/60 via-[#0B132B] to-[#7C2D12]/40 border-amber-500/40',
    badge_color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    accent: 'text-amber-400',
    icon_bg: 'bg-amber-600/20 text-amber-400 border-amber-500/40'
  }
};

export const OverviewView: React.FC<OverviewViewProps> = ({ onOpenAskCFO, onNavigateView, currentOrg = 'NovaTech AI Systems' }) => {
  const [data, setData] = useState<any>(null);
  const [activeHealthMetric, setActiveHealthMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchOverviewData(currentOrg).then(setData);
  }, [currentOrg]);

  if (!data) {
    return <div className="p-8 text-center text-slate-400 font-mono">Loading FinPilot Executive Dashboard...</div>;
  }

  const { metrics, financial_health: health, executive_brief: brief } = data;
  const activeProfile = ORG_PROFILES[currentOrg] || ORG_PROFILES['NovaTech AI Systems'];

  const sparklineData = [
    { month: 'Mar', rev: 1.25, exp: 1.02 },
    { month: 'Apr', rev: 1.32, exp: 1.05 },
    { month: 'May', rev: 1.40, exp: 1.08 },
    { month: 'Jun', rev: 1.45, exp: 1.10 },
    { month: 'Jul', rev: 1.50, exp: 1.11 },
    { month: 'Aug', rev: 1.54, exp: 1.12 },
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* Dynamic Active Organization Details Banner Card */}
      <div className={`p-5 bg-gradient-to-r ${activeProfile.theme_gradient} border rounded-2xl shadow-2xl space-y-4 animate-in fade-in duration-300`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className={`h-12 w-12 rounded-2xl ${activeProfile.icon_bg} flex items-center justify-center font-black text-xl shadow-lg shrink-0`}>
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-100 tracking-tight">{activeProfile.name}</h1>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${activeProfile.badge_color}`}>
                  {activeProfile.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{activeProfile.legal_name} • {activeProfile.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#0B132B]/80 border border-slate-800 rounded-xl text-xs font-mono flex items-center gap-2">
              <span className="text-slate-400">GSTIN:</span>
              <span className="font-bold text-slate-200">{activeProfile.gstin}</span>
            </div>
          </div>
        </div>

        {/* Organization Detail Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#0B132B]/80 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span>Headquarters Location</span>
            </div>
            <div className="font-semibold text-slate-200">{activeProfile.location}</div>
          </div>

          <div className="p-3 bg-[#0B132B]/80 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-400" />
              <span>Team & Headcount</span>
            </div>
            <div className="font-semibold text-slate-200">{activeProfile.employees}</div>
          </div>

          <div className="p-3 bg-[#0B132B]/80 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Tag className="h-3 w-3 text-slate-400" />
              <span>Core Revenue Model</span>
            </div>
            <div className="font-semibold text-slate-200 truncate">{activeProfile.business_model}</div>
          </div>

          <div className="p-3 bg-[#0B132B]/80 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Landmark className="h-3 w-3 text-slate-400" />
              <span>Primary Operating Bank</span>
            </div>
            <div className="font-semibold text-slate-200 truncate">{activeProfile.primary_bank}</div>
          </div>
        </div>
      </div>
      
      {/* Executive AI Brief Header Card */}
      <div className="p-5 bg-gradient-to-r from-[#1C2541] via-slate-900 to-[#1C2541] border border-blue-500/30 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{brief.salutation}</span>
            <h2 className="text-lg font-bold text-slate-100">{brief.headline}</h2>
          </div>
          <button
            onClick={() => onOpenAskCFO("What should management prioritize today?")}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 shrink-0"
          >
            <Bot className="h-4 w-4" />
            <span>Consult AI CFO</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {brief.bullets.map((b: any, idx: number) => (
            <div key={idx} className="p-2.5 bg-[#0B132B]/80 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-2">
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">FinPilot Recommendation: <strong className="text-slate-200">{brief.cfo_recommendation}</strong></span>
          <button onClick={() => onNavigateView('recommendations')} className="text-blue-400 hover:underline font-semibold flex items-center gap-1">
            <span>View Today's Actions</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Financial Health Score (Requirement #8) */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xl">
              78
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                Financial Health Score: <span className="text-emerald-400 font-extrabold">{health.overall_score} / 100</span>
              </h3>
              <p className="text-xs text-slate-400">{health.ai_summary}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-full uppercase">
            {health.status}
          </span>
        </div>

        {/* Breakdown Badges (Clickable) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(health.breakdown).map(([key, score]) => (
            <button
              key={key}
              onClick={() => setActiveHealthMetric(activeHealthMetric === key ? null : key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeHealthMetric === key
                  ? 'bg-blue-600/20 border-blue-500 shadow-md'
                  : 'bg-[#0B132B]/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider truncate">{key.replace('_', ' ')}</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">{score as number}</div>
            </button>
          ))}
        </div>

        {/* Selected Explanation Box */}
        {activeHealthMetric && (
          <div className="p-3 bg-[#0B132B] border border-blue-500/30 rounded-xl text-xs text-blue-300 font-mono animate-in fade-in">
            <strong>{activeHealthMetric.toUpperCase()}:</strong> {health.explanations[activeHealthMetric]}
          </div>
        )}
      </div>

      {/* Top Section KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Revenue (Monthly)</span>
            <span className="text-emerald-400 font-bold flex items-center">+12.4% <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="text-2xl font-black text-slate-100">{metrics.revenue.formatted}</div>
          <div className="h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="rev" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <strong>AI:</strong> {metrics.revenue.ai_explanation}
          </p>
        </div>

        {/* Expenses */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Expenses (Monthly)</span>
            <span className="text-amber-400 font-bold flex items-center">+8.2% <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="text-2xl font-black text-slate-100">{metrics.expenses.formatted}</div>
          <div className="h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="exp" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <strong>AI:</strong> {metrics.expenses.ai_explanation}
          </p>
        </div>

        {/* Cash Balance */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Cash Balance</span>
            <span className="text-blue-400 font-bold flex items-center">+4.1% <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="text-2xl font-black text-slate-100">{metrics.cash_balance.formatted}</div>
          <div className="text-xs text-slate-400">Reserved: ₹80.0L | Safety: ₹2.5 Cr</div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <strong>AI:</strong> {metrics.cash_balance.ai_explanation}
          </p>
        </div>

        {/* Runway */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Cash Runway</span>
            <span className="text-emerald-400 font-bold">Stable</span>
          </div>
          <div className="text-2xl font-black text-slate-100">{metrics.runway.formatted}</div>
          <div className="text-xs text-slate-400">Net Monthly Burn: ₹34.0L</div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <strong>AI:</strong> {metrics.runway.ai_explanation}
          </p>
        </div>
      </div>

      {/* Flagship Banner Trigger for Digital Twin */}
      <div className="p-6 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-blue-500 text-white tracking-widest">FLAGSHIP FEATURE</span>
            <h3 className="font-extrabold text-slate-100 text-lg">Financial Digital Twin Simulator</h3>
          </div>
          <p className="text-xs text-slate-300">Simulate hiring 10 employees, 20% revenue drop, or marketing expansion in real-time before making executive decisions.</p>
        </div>
        <button
          onClick={() => onNavigateView('digital-twin')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
        >
          <span>Launch Simulator</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
};
