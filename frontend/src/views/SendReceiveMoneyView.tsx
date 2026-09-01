import React, { useState } from 'react';
import { Send, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { executeSendMoney } from '../services/api';

export const SendReceiveMoneyView: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Vendor Payments');
  const [department, setDepartment] = useState('Operations');
  const [transferType, setTransferType] = useState<'OUTFLOW' | 'INFLOW'>('OUTFLOW');
  const [loading, setLoading] = useState(false);
  const [lastTxn, setLastTxn] = useState<any>(null);

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;

    setLoading(true);
    const amtNum = parseFloat(amount);

    try {
      const res = await executeSendMoney({
        recipient,
        amount: amtNum,
        category,
        department,
        txn_type: transferType
      });

      if (res && res.status === 'SUCCESS') {
        setLastTxn(res);
        setRecipient('');
        setAmount('');
      } else {
        alert("Transfer failed to process.");
      }
    } catch (err) {
      alert("Error executing transfer request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      
      {/* Title & Description */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-2">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-400" />
          Send & Receive Corporate Payments Gateway
        </h1>
        <p className="text-xs text-slate-400">
          Execute live corporate money transfers, vendor payouts, or receive client funds. Every transfer writes directly to your SQLite database `transactions` log and updates cash reserves.
        </p>
      </div>

      {/* Success Banner */}
      {lastTxn && (
        <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2 text-emerald-200 text-xs shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>Transaction Executed & Logged Successfully!</span>
          </div>
          <div className="font-mono">
            Transaction ID: <strong className="text-white">{lastTxn.txn_id}</strong> | Recipient: <strong className="text-white">{lastTxn.recipient}</strong> | Amount: <strong className="text-emerald-400 font-bold">{formatCurrency(lastTxn.amount)}</strong>
          </div>
          <p className="text-slate-400 text-[11px]">This payment has been saved to your corporate transaction log and audit records.</p>
        </div>
      )}

      {/* Transfer Form */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-5 shadow-xl">
        
        <div className="flex gap-2 p-1 bg-[#0B132B] rounded-xl border border-slate-800 max-w-xs">
          <button
            type="button"
            onClick={() => setTransferType('OUTFLOW')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              transferType === 'OUTFLOW' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Send Money (Outflow)</span>
          </button>
          <button
            type="button"
            onClick={() => setTransferType('INFLOW')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              transferType === 'INFLOW' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span>Receive Funds (Inflow)</span>
          </button>
        </div>

        <form onSubmit={handleExecuteTransfer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div>
              <label className="text-slate-400 font-medium block mb-1">
                {transferType === 'OUTFLOW' ? 'Recipient / Vendor Name' : 'Sender / Client Name'}
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. AWS Cloud Services or Enterprise Corp"
                className="w-full bg-[#0B132B] text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Transfer Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 284000"
                className="w-full bg-[#0B132B] text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0B132B] text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none"
              >
                <option value="Vendor Payments">Vendor Payments</option>
                <option value="SaaS & Cloud Services">SaaS & Cloud Services</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Payroll & HR">Payroll & HR</option>
                <option value="Customer Revenue">Customer Revenue</option>
                <option value="Operating Expenses">Operating Expenses</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#0B132B] text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>FinPilot Automated Risk Threshold & Audit Active</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              {loading ? "Executing Transfer..." : transferType === 'OUTFLOW' ? "Execute Payment Outflow" : "Log Funds Received"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
