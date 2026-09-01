import React, { useState } from 'react';
import { Search, Bot, Bell, ChevronDown, Sparkles, ShieldCheck, Activity } from 'lucide-react';

interface NavbarProps {
  currentOrg: string;
  onSelectOrg: (org: string) => void;
  onOpenAskCFO: (initialQuery?: string) => void;
  onLaunchDemo: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOrg,
  onSelectOrg,
  onOpenAskCFO,
  onLaunchDemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const orgs = [
    { name: 'NovaTech AI Systems', type: 'Tech / AI SaaS', revenue: '₹18.4 Cr' },
    { name: 'GreenCart E-Commerce', type: 'E-Commerce', revenue: '₹9.5 Cr' },
    { name: 'MediCore Healthcare', type: 'Healthcare', revenue: '₹31.0 Cr' },
    { name: 'UrbanBite FoodTech', type: 'Food-Tech', revenue: '₹4.2 Cr' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenAskCFO(searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 bg-[#0B132B]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search & Natural Language Trigger */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ask FinPilot or search transactions, vendors, reports..."
          className="w-full bg-[#1C2541]/80 text-sm text-slate-100 placeholder-slate-400 pl-9 pr-24 py-2 rounded-lg border border-slate-700/60 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => onOpenAskCFO()}
          className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium rounded flex items-center gap-1 shadow-sm transition-all"
        >
          <Bot className="h-3.5 w-3.5" />
          <span>Ask AI</span>
        </button>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Data Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Demo Data Mode</span>
        </div>

        {/* Hackathon Launch Demo Button */}
        <button
          onClick={onLaunchDemo}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/20 border border-amber-400/30 transition-all transform active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Launch Demo</span>
        </button>

        {/* Notification Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1C2541] border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Financial Risk Notifications</h4>
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono">3 Action Needed</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <div className="font-semibold text-rose-300">🔴 Duplicate Invoice Flagged</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">Alpha Supplies ₹4.85L invoice matches previous entry.</div>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="font-semibold text-amber-300">🟠 Marketing Over Budget</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">Marketing spent ₹23.8L (+19% budget variance).</div>
                </div>
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="font-semibold text-blue-300">🔵 Delayed Receivable Alert</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">ABC Corp ₹18L invoice predicted 11 days late.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Organization Selector */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 bg-[#1C2541] hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-md"
          >
            <div className={`h-5 w-5 rounded flex items-center justify-center font-bold text-white text-[10px] ${
              currentOrg.includes('GreenCart') ? 'bg-emerald-600' :
              currentOrg.includes('MediCore') ? 'bg-cyan-600' :
              currentOrg.includes('UrbanBite') ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              {currentOrg[0]}
            </div>
            <span className="max-w-[130px] truncate hidden sm:inline font-semibold">{currentOrg}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1C2541] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Select Organization</span>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono">4 Active</span>
              </div>
              {orgs.map((org) => (
                <button
                  key={org.name}
                  onClick={() => {
                    onSelectOrg(org.name);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex flex-col transition-all cursor-pointer ${
                    currentOrg === org.name
                      ? 'bg-blue-600/15 border-l-4 border-blue-500 text-slate-100 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{org.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      org.name.includes('GreenCart') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      org.name.includes('MediCore') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      org.name.includes('UrbanBite') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {org.revenue}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">{org.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
};
