import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  Send, 
  FileText, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  LineChart, 
  Cpu, 
  Bot, 
  ShieldAlert, 
  Building2, 
  Users, 
  Globe, 
  Newspaper, 
  CheckCircle2, 
  BarChart3, 
  Bell, 
  Settings, 
  Sparkles,
  MessageSquare,
  Layers,
  Brain,
  BookOpen,
  Building
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  currentOrg?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  isAI?: boolean;
  isFlagship?: boolean;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView, currentOrg = 'NovaTech AI Systems' }) => {
  const menuGroups: MenuGroup[] = [
    {
      group: "Core Dashboard",
      items: [
        { id: "control-tower", label: "Autonomous Control Tower", icon: Cpu, isFlagship: true, badge: "Control 84" },
        { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
        { id: "reconciliation", label: "Finance Controller", icon: Cpu, isFlagship: true, badge: "87% Match" },
        { id: "ingestion", label: "Data Ingestion", icon: Send, badge: "CSV/XLSX" },
        { id: "exceptions", label: "Exception Management", icon: ShieldAlert, badge: "5 Open" },
        { id: "reviews", label: "Review Center", icon: CheckCircle2, badge: "3 Review" },
        { id: "wallet", label: "Digital Wallet", icon: Wallet },
        { id: "transactions", label: "Transactions", icon: ArrowLeftRight, badge: "3 Risk" },
        { id: "accounting-os", label: "Accounting OS (GL)", icon: BookOpen, badge: "GL ✓" },
      ]
    },
    {
      group: "Cash & Tax Controller",
      items: [
        { id: "cashflow", label: "Cash Position & Runway", icon: TrendingUp },
        { id: "tax-matcher", label: "Tax-Line Matcher", icon: FileText, badge: "18% GST" },
        { id: "send-receive", label: "Send / Receive Money", icon: Send },
        { id: "invoices", label: "Invoices & OCR", icon: FileText, badge: "Dup!" },
        { id: "ar", label: "Accounts Receivable", icon: Clock },
        { id: "ap", label: "Accounts Payable", icon: CreditCard },
      ]
    },
    {
      group: "Financial Engine & AI",
      items: [
        { id: "ai-command-center", label: "AI Command Center", icon: Brain, isAI: true, badge: "🧠 10 AI" },
        { id: "chatbot", label: "FinPilot AI CFO Chat", icon: MessageSquare, isAI: true, badge: "ChatGPT AI" },
        { id: "nse-market", label: "NSE Market Terminal", icon: Globe, isAI: true, badge: "🇮🇳 LIVE" },
        { id: "stock-intelligence", label: "Stock Intelligence", icon: TrendingUp, isAI: true, badge: "PRO" },
        { id: "option-chain", label: "Option Chain & F&O", icon: Layers, isAI: true, badge: "⚡ F&O" },
        { id: "budgets", label: "Budgets & Optimizer", icon: PieChart },
        { id: "forecasts", label: "Forecast Models", icon: LineChart },
        { id: "digital-twin", label: "Financial Digital Twin", icon: Cpu, isFlagship: true },
        { id: "ai-cfo", label: "Ask FinPilot AI Modal", icon: Bot },
        { id: "risk", label: "Risk Center (0-100)", icon: ShieldAlert },
      ]
    },
    {
      group: "Business Intelligence & Audit",
      items: [
        { id: "audit-log", label: "Immutable Audit Trail", icon: BarChart3, badge: "Immutable" },
        { id: "vendors", label: "Vendors Intelligence", icon: Building2 },
        { id: "customers", label: "Customers Intelligence", icon: Users },
        { id: "market", label: "Market Intelligence", icon: Globe },
        { id: "news", label: "Financial News & Impact", icon: Newspaper },
        { id: "recommendations", label: "Today's Actions", icon: CheckCircle2 },
        { id: "reports", label: "Executive Reports", icon: BarChart3 },
      ]
    },
    {
      group: "System & Settings",
      items: [
        { id: "alerts", label: "Notifications & Alerts", icon: Bell },
        { id: "settings", label: "Organization & Rules", icon: Settings },
        { id: "landing", label: "Product Landing Page", icon: Sparkles },
      ]
    }
  ];

  // Map organization metadata for bottom sidebar card
  const orgDetailsMap: Record<string, { subtitle: string; badge: string; color: string }> = {
    "NovaTech AI Systems": { subtitle: "Enterprise AI & SaaS", badge: "FY25-26 Active", color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
    "GreenCart E-Commerce": { subtitle: "D2C Retail & Logistics", badge: "Moderate Risk", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
    "MediCore Healthcare": { subtitle: "Pharma & Diagnostics", badge: "Low Risk • 92 Health", color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400" },
    "UrbanBite FoodTech": { subtitle: "QSR & Cloud Kitchens", badge: "High Attention", color: "border-amber-500/40 bg-amber-500/10 text-amber-400" }
  };

  const activeOrgInfo = orgDetailsMap[currentOrg] || orgDetailsMap["NovaTech AI Systems"];

  return (
    <aside className="w-64 bg-[#0B132B] border-r border-slate-800 flex flex-col h-full shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold">
            FP
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
              FinPilot AI
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-600 text-white">OS</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Virtual CFO Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {group.group}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm shadow-blue-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${
                      isActive 
                        ? 'text-blue-400' 
                        : item.isAI 
                        ? 'text-blue-400' 
                        : item.isFlagship 
                        ? 'text-amber-400' 
                        : 'text-slate-400'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                      item.isAI 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : item.isFlagship
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Dynamic Active Organization Footer Summary */}
      <div className="p-3 border-t border-slate-800 bg-[#070D1E]">
        <div className={`p-2.5 rounded-xl border ${activeOrgInfo.color} space-y-1`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 truncate">
              <Building className="h-3 w-3 shrink-0 text-blue-400" />
              {currentOrg}
            </span>
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">{activeOrgInfo.subtitle}</div>
          <div className="text-[9px] font-mono text-slate-300 pt-0.5 border-t border-slate-800/80 flex items-center justify-between">
            <span>Status:</span>
            <span className="font-bold text-slate-200">{activeOrgInfo.badge}</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
