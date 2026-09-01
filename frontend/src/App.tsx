import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HackathonDemoBar } from './components/HackathonDemoBar';
import { AskFinPilotModal } from './components/AskFinPilotModal';

// Views
import { OverviewView } from './views/OverviewView';
import { ControlTowerView } from './views/ControlTowerView';
import { ReconciliationView } from './views/ReconciliationView';
import { DataIngestionView } from './views/DataIngestionView';
import { ExceptionsView } from './views/ExceptionsView';
import { ReviewCenterView } from './views/ReviewCenterView';
import { TaxMatcherView } from './views/TaxMatcherView';
import { AuditTrailView } from './views/AuditTrailView';

import { WalletView } from './views/WalletView';
import { TransactionsView } from './views/TransactionsView';
import { SendReceiveMoneyView } from './views/SendReceiveMoneyView';
import { InvoicesView } from './views/InvoicesView';
import { AccountsReceivableView } from './views/AccountsReceivableView';
import { AccountsPayableView } from './views/AccountsPayableView';
import { CashFlowView } from './views/CashFlowView';
import { BudgetsView } from './views/BudgetsView';
import { ForecastsView } from './views/ForecastsView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { AICFOView } from './views/AICFOView';
import { ChatbotView } from './views/ChatbotView';
import { StockIntelligenceView } from './views/StockIntelligenceView';
import { NSEMarketView } from './views/NSEMarketView';
import { OptionChainView } from './views/OptionChainView';
import { RiskCenterView } from './views/RiskCenterView';
import { VendorsView } from './views/VendorsView';
import { CustomersView } from './views/CustomersView';
import { MarketView } from './views/MarketView';
import { NewsView } from './views/NewsView';
import { RecommendationsView } from './views/RecommendationsView';
import { ReportsView } from './views/ReportsView';
import { AlertsView } from './views/AlertsView';
import { SettingsView } from './views/SettingsView';
import { LandingPageView } from './views/LandingPageView';
import { AICommandCenterView } from './views/AICommandCenterView';
import { AccountingOSView } from './views/AccountingOSView';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('overview');
  const [currentOrg, setCurrentOrg] = useState<string>('NovaTech AI Systems');
  const [isAskCFOOpen, setIsAskCFOOpen] = useState<boolean>(false);
  const [askCFOQuery, setAskCFOQuery] = useState<string>('');
  const [presetScenario, setPresetScenario] = useState<any>(null);

  const handleOpenAskCFO = (initialQuery?: string) => {
    setAskCFOQuery(initialQuery || '');
    setIsAskCFOOpen(true);
  };

  const handleLaunchDemo = () => {
    setActiveView('overview');
    alert("🚀 Hackathon Demo Mode Active! Preloaded NovaTech AI Systems state with 3 intentional anomalies & Digital Twin ready.");
  };

  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'expansion') {
      setActiveView('digital-twin');
      setPresetScenario({ inputs: { hiring_count: 10, marketing_delta: 500000 } });
    } else if (presetId === 'revenue_crash') {
      setActiveView('digital-twin');
      setPresetScenario({ inputs: { revenue_change_pct: -20 } });
    } else if (presetId === 'fraud_detection') {
      setActiveView('invoices');
    } else if (presetId === 'cost_reduction') {
      setActiveView('budgets');
    }
  };

  return (
    <div className="flex h-screen bg-[#0B132B] text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} onSelectView={setActiveView} currentOrg={currentOrg} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Navbar */}
        <Navbar
          currentOrg={currentOrg}
          onSelectOrg={setCurrentOrg}
          onOpenAskCFO={handleOpenAskCFO}
          onLaunchDemo={handleLaunchDemo}
          activeView={activeView}
        />

        {/* Hackathon Demo Bar */}
        <HackathonDemoBar onSelectPreset={handleSelectPreset} />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeView === 'control-tower' && <ControlTowerView currentOrg={currentOrg} />}
          {activeView === 'overview' && <OverviewView currentOrg={currentOrg} onOpenAskCFO={handleOpenAskCFO} onNavigateView={setActiveView} />}
          {activeView === 'reconciliation' && <ReconciliationView currentOrg={currentOrg} />}
          {activeView === 'ingestion' && <DataIngestionView />}
          {activeView === 'exceptions' && <ExceptionsView currentOrg={currentOrg} />}
          {activeView === 'reviews' && <ReviewCenterView currentOrg={currentOrg} />}
          {activeView === 'tax-matcher' && <TaxMatcherView currentOrg={currentOrg} />}
          {activeView === 'audit-log' && <AuditTrailView />}
          {activeView === 'ai-command-center' && <AICommandCenterView onNavigateView={setActiveView} />}
          {activeView === 'accounting-os' && <AccountingOSView />}
          {activeView === 'wallet' && <WalletView currentOrg={currentOrg} />}
          {activeView === 'transactions' && <TransactionsView currentOrg={currentOrg} />}
          {activeView === 'send-receive' && <SendReceiveMoneyView />}
          {activeView === 'invoices' && <InvoicesView />}
          {activeView === 'ar' && <AccountsReceivableView />}
          {activeView === 'ap' && <AccountsPayableView />}
          {activeView === 'chatbot' && <ChatbotView onNavigateView={setActiveView} />}
          {activeView === 'nse-market' && <NSEMarketView />}
          {activeView === 'stock-intelligence' && <StockIntelligenceView />}
          {activeView === 'option-chain' && <OptionChainView />}
          {activeView === 'cashflow' && <CashFlowView />}
          {activeView === 'budgets' && <BudgetsView />}
          {activeView === 'forecasts' && <ForecastsView />}
          {activeView === 'digital-twin' && <DigitalTwinView onOpenAskCFO={handleOpenAskCFO} presetScenario={presetScenario} />}
          {activeView === 'ai-cfo' && <AICFOView />}
          {activeView === 'risk' && <RiskCenterView />}
          {activeView === 'vendors' && <VendorsView />}
          {activeView === 'customers' && <CustomersView />}
          {activeView === 'market' && <MarketView />}
          {activeView === 'news' && <NewsView />}
          {activeView === 'recommendations' && <RecommendationsView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'alerts' && <AlertsView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'landing' && <LandingPageView onLaunchDemo={handleLaunchDemo} onExploreCFO={() => setActiveView('chatbot')} />}
        </main>

      </div>

      {/* Floating Global Ask AI Modal */}
      <AskFinPilotModal
        isOpen={isAskCFOOpen}
        onClose={() => setIsAskCFOOpen(false)}
        initialQuery={askCFOQuery}
      />

    </div>
  );
};
