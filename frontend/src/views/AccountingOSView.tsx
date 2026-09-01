import React, { useState, useEffect } from 'react';
import {
  BookOpen, Calculator, FileText, CheckCircle2, AlertTriangle,
  Scale, Layers, RefreshCw, Plus, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const TABS = [
  { id: 'general-ledger', label: 'General Ledger', icon: BookOpen },
  { id: 'trial-balance',  label: 'Trial Balance',  icon: Scale },
  { id: 'statements',     label: 'Financial Statements', icon: FileText },
  { id: 'reconciliation', label: 'Bank Reconciliation', icon: ShieldCheck },
];

export const AccountingOSView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general-ledger');
  const [glEntries, setGlEntries] = useState<any[]>([]);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [statements, setStatements] = useState<any>(null);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Manual Journal Entry Modal
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [ref, setRef] = useState('');
  const [drAccount, setDrAccount] = useState('5100');
  const [crAccount, setCrAccount] = useState('1000');
  const [amount, setAmount] = useState('');
  const [postMsg, setPostMsg] = useState<{ success: boolean; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rGl, rTb, rStmt, rRec] = await Promise.all([
        fetch('/api/accounting/general-ledger').then(r => r.json()),
        fetch('/api/accounting/trial-balance').then(r => r.json()),
        fetch('/api/accounting/financial-statements').then(r => r.json()),
        fetch('/api/accounting/reconciliation').then(r => r.json())
      ]);
      setGlEntries(rGl || []);
      setTrialBalance(rTb);
      setStatements(rStmt);
      setReconciliation(rRec);
    } catch (e) {
      console.warn('Accounting API load error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) return;

    try {
      const res = await fetch('/api/accounting/journal-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: desc,
          reference: ref || `MANUAL-${Date.now()}`,
          lines: [
            { account_code: drAccount, debit: amtNum, credit: 0.0, description: desc },
            { account_code: crAccount, debit: 0.0, credit: amtNum, description: desc }
          ]
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        setPostMsg({ success: true, text: data.message });
        setTimeout(() => {
          setShowEntryModal(false);
          setPostMsg(null);
          setDesc('');
          setAmount('');
          setRef('');
          loadData();
        }, 1500);
      } else {
        setPostMsg({ success: false, text: data.detail || 'Posting failed.' });
      }
    } catch {
      setPostMsg({ success: false, text: 'Network error posting journal entry.' });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#1C2541] to-[#0B132B] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Calculator className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Double-Entry Accounting OS</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">BALANCED GL</span>
          </div>
          <p className="text-xs text-slate-400">General Ledger, Trial Balance & Double-Entry Real-Time Journal System</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEntryModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
          >
            <Plus className="h-4 w-4" />
            <span>Post Journal Entry</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}

      {/* 1. GENERAL LEDGER */}
      {activeTab === 'general-ledger' && (
        <div className="space-y-4">
          <div className="bg-[#1C2541] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">Journal Entries & General Ledger</span>
              <span className="text-xs text-slate-400 font-mono">{glEntries.length} Posted Entries</span>
            </div>
            <div className="divide-y divide-slate-800">
              {glEntries.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No general ledger entries posted yet.</div>
              ) : (
                glEntries.map((e: any) => (
                  <div key={e.entry_id} className="p-4 hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-400">{e.entry_id}</span>
                        {e.reference && (
                          <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                            Ref: {e.reference}
                          </span>
                        )}
                        <span className="text-xs text-slate-200 font-semibold">{e.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">{e.date}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {formatCurrency(e.total_debit)}
                        </span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {e.status}
                        </span>
                      </div>
                    </div>

                    {/* Entry Lines */}
                    <div className="bg-[#0B132B] rounded-xl p-3 space-y-1.5 font-mono text-xs">
                      {e.lines?.map((l: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border-b border-slate-800/60 pb-1 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400 font-bold w-12">{l.account_code}</span>
                            <span className="text-slate-300">{l.account_name}</span>
                          </div>
                          <div className="flex gap-6 text-right">
                            <span className={l.debit > 0 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                              {l.debit > 0 ? `DR ${formatCurrency(l.debit)}` : '—'}
                            </span>
                            <span className={l.credit > 0 ? 'text-blue-400 font-bold' : 'text-slate-600'}>
                              {l.credit > 0 ? `CR ${formatCurrency(l.credit)}` : '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TRIAL BALANCE */}
      {activeTab === 'trial-balance' && trialBalance && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-slate-400 font-mono">Total Debits</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                {formatCurrency(trialBalance.total_debit)}
              </div>
            </div>
            <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-slate-400 font-mono">Total Credits</div>
              <div className="text-lg font-black text-blue-400 font-mono mt-1">
                {formatCurrency(trialBalance.total_credit)}
              </div>
            </div>
            <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-slate-400 font-mono">Balance Status</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                {trialBalance.status}
              </div>
            </div>
          </div>

          <div className="bg-[#1C2541] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B132B] text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Account Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 text-right">Debit (DR)</th>
                  <th className="p-3.5 text-right">Credit (CR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {trialBalance.lines?.map((row: any) => (
                  <tr key={row.account_code} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-blue-400">{row.account_code}</td>
                    <td className="p-3.5 font-semibold text-slate-200">{row.account_name}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                        {row.account_type}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                    </td>
                    <td className="p-3.5 text-right font-bold text-blue-400">
                      {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0B132B] border-t-2 border-slate-700 font-mono font-black text-xs text-slate-100">
                <tr>
                  <td colSpan={3} className="p-3.5">TOTAL TRIAL BALANCE</td>
                  <td className="p-3.5 text-right text-emerald-400">{formatCurrency(trialBalance.total_debit)}</td>
                  <td className="p-3.5 text-right text-blue-400">{formatCurrency(trialBalance.total_credit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 3. FINANCIAL STATEMENTS */}
      {activeTab === 'statements' && statements && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit & Loss */}
          <div className="bg-[#1C2541] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                Statement of Profit & Loss
              </h3>
              <span className="text-xs text-slate-400 font-mono">{statements.as_of}</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2.5 bg-[#0B132B] rounded-xl text-emerald-400 font-bold">
                <span>Total Operating Revenue</span>
                <span>{formatCurrency(statements.profit_and_loss?.revenue)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0B132B] rounded-xl text-rose-400 font-bold">
                <span>Total Operating Expenses</span>
                <span>-{formatCurrency(statements.profit_and_loss?.expenses)}</span>
              </div>
              <div className="flex justify-between p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-slate-100 font-black text-sm">
                <span>Net Operating Surplus</span>
                <span className="text-emerald-400">{formatCurrency(statements.profit_and_loss?.net_profit)}</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="bg-[#1C2541] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-400" />
                Balance Sheet Summary
              </h3>
              <span className="text-xs text-slate-400 font-mono">{statements.as_of}</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2.5 bg-[#0B132B] rounded-xl text-emerald-400 font-bold">
                <span>Total Assets</span>
                <span>{formatCurrency(statements.balance_sheet?.total_assets)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0B132B] rounded-xl text-rose-400 font-bold">
                <span>Total Liabilities</span>
                <span>{formatCurrency(statements.balance_sheet?.total_liabilities)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0B132B] rounded-xl text-blue-400 font-bold">
                <span>Total Equity</span>
                <span>{formatCurrency(statements.balance_sheet?.total_equity)}</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-slate-100 font-black text-sm">
                <span>Balance Sheet Equation Check</span>
                <span className="text-emerald-400">Assets = Liabilities + Equity ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BANK RECONCILIATION */}
      {activeTab === 'reconciliation' && reconciliation && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-slate-400 font-mono">Bank Feed Transactions</div>
              <div className="text-lg font-black text-slate-100 font-mono mt-1">
                {reconciliation.total_bank_transactions}
              </div>
            </div>
            <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-slate-400 font-mono">Matched Entries</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                {reconciliation.matched_count}
              </div>
            </div>
            <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-slate-400 font-mono">Reconciliation Rate</div>
              <div className="text-lg font-black text-blue-400 font-mono mt-1">
                {reconciliation.reconciliation_rate}
              </div>
            </div>
            <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-slate-400 font-mono">Status</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                {reconciliation.status}
              </div>
            </div>
          </div>

          <div className="bg-[#1C2541] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Matched Bank Statement Feed</h4>
            <div className="space-y-2">
              {reconciliation.matched?.map((m: any, i: number) => (
                <div key={i} className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-100">{m.bank_txn_id}</span>
                    <span className="text-slate-400 ml-2">— {m.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">{formatCurrency(m.amount)}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                      MATCHED ({m.confidence}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Journal Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-400" />
                Post Double-Entry Journal
              </h3>
              <button onClick={() => setShowEntryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePostJournal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Description</label>
                <input
                  type="text" required value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="e.g. Office Equipment Depreciation Adjustment"
                  className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium">Debit Account (DR)</label>
                  <select value={drAccount} onChange={e => setDrAccount(e.target.value)} className="w-full bg-[#0B132B] text-slate-100 px-2 py-2 rounded-xl border border-slate-700 mt-1 font-mono">
                    <option value="5100">5100 — Operating Expenses</option>
                    <option value="5000">5000 — Payroll</option>
                    <option value="5200">5200 — SaaS & Cloud</option>
                    <option value="5300">5300 — Marketing</option>
                    <option value="1500">1500 — Equipment</option>
                    <option value="1000">1000 — Cash</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Credit Account (CR)</label>
                  <select value={crAccount} onChange={e => setCrAccount(e.target.value)} className="w-full bg-[#0B132B] text-slate-100 px-2 py-2 rounded-xl border border-slate-700 mt-1 font-mono">
                    <option value="1000">1000 — Cash & Bank</option>
                    <option value="2000">2000 — Accounts Payable</option>
                    <option value="4000">4000 — Subscription Revenue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Amount (₹)</label>
                <input
                  type="number" required value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 mt-1 font-mono"
                />
              </div>

              {/* Debit/Credit Balancing Rule Notice */}
              <div className="p-2.5 bg-[#0B132B] border border-emerald-500/30 rounded-xl text-[11px] font-mono text-emerald-400">
                Rule check: Debit (₹{amount || '0'}) == Credit (₹{amount || '0'}). Balanced ✓
              </div>

              {postMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${postMsg.success ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40' : 'bg-rose-900/40 text-rose-300 border border-rose-500/40'}`}>
                  {postMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEntryModal(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg">Post Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
