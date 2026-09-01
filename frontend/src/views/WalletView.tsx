import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, Plus, RefreshCw, Send } from 'lucide-react';
import { fetchWalletData, createTransaction } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface WalletViewProps {
  currentOrg?: string;
}

export const WalletView: React.FC<WalletViewProps> = ({ currentOrg = 'NovaTech AI Systems' }) => {
  const [data, setData] = useState<any>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadWallet = () => {
    fetchWalletData(currentOrg).then(setData);
  };

  useEffect(() => {
    loadWallet();
  }, [currentOrg]);

  if (!data) return <div className="p-8 text-center text-slate-400 font-mono">Loading Digital Wallet...</div>;

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendAmount || !sendRecipient) return;

    await createTransaction({
      description: `Direct Transfer to ${sendRecipient}`,
      amount: parseFloat(sendAmount),
      vendor_or_customer: sendRecipient,
      department: 'Operations',
      category: 'Vendor Payments',
      txn_type: 'OUTFLOW',
      payment_method: 'Bank Transfer'
    });

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowSendModal(false);
      setSendAmount('');
      setSendRecipient('');
      loadWallet();
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Wallet Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Digital Business Wallet</h1>
            <p className="text-xs text-slate-400">{currentOrg} • Multi-Currency Working Capital Wallet</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
          >
            <Send className="h-4 w-4" />
            <span>Send Money</span>
          </button>
        </div>
      </div>

      {/* Main Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-900/40 via-[#1C2541] to-slate-900 border border-blue-500/40 rounded-2xl">
          <div className="text-xs text-slate-400">Available Balance</div>
          <div className="text-xl font-black text-slate-100 mt-1 font-mono">{formatCurrency(data.available_balance)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">Liquid Working Capital</div>
        </div>

        <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Pending Balance</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCurrency(data.pending_balance)}</div>
          <div className="text-[11px] text-amber-400 font-semibold mt-1">Clearing in 24-48 hrs</div>
        </div>

        <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Reserved Cash</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCurrency(data.reserved_cash)}</div>
          <div className="text-[11px] text-blue-400 font-semibold mt-1">Min Safety Reserve</div>
        </div>

        <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Receivables</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCurrency(data.total_receivables)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">Incoming Invoices</div>
        </div>

        <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Payables</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{formatCurrency(data.total_payables)}</div>
          <div className="text-[11px] text-rose-400 font-semibold mt-1">Due Suppliers</div>
        </div>
      </div>

      {/* Linked Bank Accounts & Corporate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Linked Accounts */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-100 text-sm">Linked Bank Accounts</h3>
            <span className="text-xs text-blue-400 font-semibold cursor-pointer">+ Link New Account</span>
          </div>
          <div className="space-y-3">
            {data.bank_accounts.map((b: any) => (
              <div key={b.id} className="p-3.5 bg-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-100 text-xs flex items-center gap-2">
                    {b.bank_name}
                    {b.is_primary && <span className="px-2 py-0.5 rounded text-[9px] bg-blue-600 text-white font-bold">PRIMARY</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">A/C: •••• {b.account_number.slice(-4)} • {b.account_type}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-100 text-xs font-mono">{formatCurrency(b.balance)}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Verified</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Cards */}
        <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-100 text-sm">Corporate Cards</h3>
            <span className="text-xs text-blue-400 font-semibold cursor-pointer">+ Issue Virtual Card</span>
          </div>
          <div className="space-y-3">
            {data.corporate_cards.map((c: any) => (
              <div key={c.id} className="p-3.5 bg-gradient-to-r from-slate-900 to-[#0B132B] border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                  <div>
                    <div className="font-semibold text-slate-100 text-xs">{c.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">•••• {c.number_ending} • Limit: {formatCurrency(c.limit)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-200 text-xs font-mono">Used: {formatCurrency(c.used)}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Send Money Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Send Money (Live Gateway Engine)</h3>
            {paymentSuccess ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-emerald-300 font-bold text-sm">
                ✅ Payment Executed & Logged to DB Transactions!
              </div>
            ) : (
              <form onSubmit={handleSendPayment} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Recipient / Vendor Name</label>
                  <input
                    type="text" required value={sendRecipient} onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="e.g. Alpha Supplies Corp"
                    className="w-full bg-[#0B132B] text-xs text-slate-100 px-3 py-2 rounded-lg border border-slate-700 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Amount (₹)</label>
                  <input
                    type="number" required value={sendAmount} onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="e.g. 485000"
                    className="w-full bg-[#0B132B] text-xs text-slate-100 px-3 py-2 rounded-lg border border-slate-700 mt-1 font-mono"
                  />
                </div>
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[11px] text-blue-300">
                  ⚡ Transaction will be logged in DB and run AI risk scan prior to approval.
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowSendModal(false)} className="flex-1 py-2 bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg">Confirm & Send</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
