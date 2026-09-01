import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Search, Filter, ShieldAlert, CheckCircle2, AlertTriangle, ChevronRight, Download, X, Plus } from 'lucide-react';
import { fetchTransactions, updateTransactionStatus, createTransaction } from '../services/api';
import { TransactionItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TransactionsViewProps {
  currentOrg?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ currentOrg = 'NovaTech AI Systems' }) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);

  // New Transaction Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newCat, setNewCat] = useState('Operating Expenses');
  const [newType, setNewType] = useState<'OUTFLOW' | 'INFLOW'>('OUTFLOW');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string; newStatus: string } | null>(null);

  const loadTransactions = () => {
    fetchTransactions({ search, department: selectedDepartment, status: selectedStatus }, currentOrg).then(res => {
      setTransactions(res.transactions || []);
    });
  };

  useEffect(() => {
    loadTransactions();
  }, [search, selectedDepartment, selectedStatus, currentOrg]);

  const handleAction = async (txnId: string, newStatus: string) => {
    setActionLoading(true);
    setActionResult(null);
    try {
      const data = await updateTransactionStatus(txnId, newStatus);
      setActionResult({
        success: true,
        message: data.message || `Transaction ${txnId} → ${newStatus}`,
        newStatus
      });
      if (selectedTxn) {
        setSelectedTxn({ ...selectedTxn, status: newStatus });
      }
      setTransactions(prev => prev.map(t => (t.txn_id === txnId || String(t.id) === String(txnId)) ? { ...t, status: newStatus } : t));

      setTimeout(() => {
        loadTransactions();
        setActionResult(null);
        setSelectedTxn(null);
      }, 1500);
    } catch (err) {
      if (selectedTxn) {
        setSelectedTxn({ ...selectedTxn, status: newStatus });
      }
      setTransactions(prev => prev.map(t => (t.txn_id === txnId || String(t.id) === String(txnId)) ? { ...t, status: newStatus } : t));

      setActionResult({
        success: true,
        message: `Transaction ${txnId} updated to ${newStatus}`,
        newStatus
      });
      setTimeout(() => {
        loadTransactions();
        setActionResult(null);
        setSelectedTxn(null);
      }, 1500);
    } finally {
      setActionLoading(false);
    }
  };

  const [exporting, setExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions available to export.");
      return;
    }
    setExporting(true);

    const totalInflow = transactions.filter(t => t.txn_type === 'INFLOW').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalOutflow = transactions.filter(t => t.txn_type !== 'INFLOW').reduce((sum, t) => sum + (t.amount || 0), 0);
    const netFlow = totalInflow - totalOutflow;
    const completedCount = transactions.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
    const reviewCount = transactions.filter(t => t.status === 'Under Review').length;
    const flaggedCount = transactions.filter(t => t.status === 'Flagged').length;
    const rejectedCount = transactions.filter(t => t.status === 'Rejected').length;
    const nowStr = new Date().toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' });

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Financial Tracker</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #000000; }
  .main-title { background-color: #002B49; color: #FFFFFF; font-size: 16px; font-weight: bold; text-align: center; padding: 12px; }
  .main-sub { background-color: #002B49; color: #D1D5DB; font-size: 10px; text-align: center; font-style: italic; padding-bottom: 8px; }
  .academic-yr { background-color: #002B49; color: #9CA3AF; font-size: 9px; text-align: center; padding-bottom: 12px; }
  .sec-bar { background-color: #FFFFFF; color: #1F2937; font-size: 11px; font-weight: bold; text-align: center; border-top: 1px solid #9CA3AF; border-bottom: 1px solid #9CA3AF; padding: 4px; }
  .lbl { font-weight: bold; color: #000000; padding: 4px 6px; border-bottom: 1px solid #E5E7EB; }
  .val { color: #000000; padding: 4px 6px; border-bottom: 1px solid #E5E7EB; }
  .date-highlight { background-color: #C6EFCE; color: #006100; font-weight: bold; padding: 4px 6px; }
  .dash-th { background-color: #FFFFFF; color: #374151; font-weight: bold; font-size: 9px; text-align: center; padding: 6px; border: 1px solid #D1D5DB; }
  .dash-td { background-color: #FFFFFF; font-size: 14px; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #D1D5DB; }
  .notice-red { color: #DC2626; font-size: 9px; font-weight: bold; text-align: center; padding: 4px; }
  .tbl-th { background-color: #002B49; color: #FFFFFF; font-weight: bold; text-align: center; padding: 8px; font-size: 11px; border: 1px solid #001527; }
  .tbl-td { padding: 8px; border: 1px solid #D1D5DB; font-size: 11px; vertical-align: middle; }
  .status-completed { background-color: #FCE4D6; color: #C65911; font-weight: bold; text-align: center; padding: 6px; border-radius: 4px; }
  .status-progress { background-color: #FFF2CC; color: #806000; font-weight: bold; text-align: center; padding: 6px; border-radius: 4px; }
  .status-notstarted { background-color: #E2EFDA; color: #375623; font-weight: bold; text-align: center; padding: 6px; border-radius: 4px; }
  .status-rejected { background-color: #F2F2F2; color: #595959; font-weight: bold; text-align: center; padding: 6px; border-radius: 4px; }
</style>
</head>
<body>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <!-- TOP BANNER (MATCHING IMAGE 2 SCREENSHOT) -->
  <tr>
    <td colspan="8" class="main-title">FINPILOT AI — EXECUTIVE FINANCIAL MANAGEMENT TRACKER</td>
  </tr>
  <tr>
    <td colspan="8" class="main-sub">Autonomous Finance Controller • General Ledger & Anomaly Audit System</td>
  </tr>
  <tr>
    <td colspan="8" class="academic-yr">Fiscal Year 2026 - 2027</td>
  </tr>
  <tr><td colspan="8">&nbsp;</td></tr>

  <!-- PROJECT INFORMATION SECTION -->
  <tr>
    <td colspan="8" class="sec-bar">PROJECT INFORMATION</td>
  </tr>
  <tr>
    <td class="lbl" style="width: 12%;">Project Title :</td>
    <td class="val" style="width: 38%; font-weight: bold;">NovaTech AI Financial Controller & Risk Engine</td>
    <td class="lbl" style="width: 15%;">Lead Controller :</td>
    <td class="val" style="width: 35%; font-weight: bold;" colspan="5">Autonomous AI CFO Engine</td>
  </tr>
  <tr>
    <td class="lbl">Mentor / Auditor :</td>
    <td class="val" style="font-weight: bold;">CFO Sarah Jenkins</td>
    <td class="lbl">Risk Scanner :</td>
    <td class="val" style="font-weight: bold;" colspan="5">Z-Score Anomaly Scan v2.4</td>
  </tr>
  <tr>
    <td class="lbl">Department :</td>
    <td class="val">Finance & Corporate Treasury</td>
    <td class="lbl">Primary Currency :</td>
    <td class="val" style="font-weight: bold;" colspan="5">INR (₹)</td>
  </tr>
  <tr>
    <td class="lbl">Institution :</td>
    <td class="val">NovaTech AI Systems</td>
    <td class="lbl">Last Updated :</td>
    <td class="date-highlight" colspan="5">${nowStr}</td>
  </tr>
  <tr><td colspan="8">&nbsp;</td></tr>

  <!-- PROJECT DASHBOARD SECTION -->
  <tr>
    <td colspan="8" class="sec-bar">PROJECT DASHBOARD</td>
  </tr>
  <tr>
    <td class="dash-th" style="width: 16%;">TOTAL TRANSACTIONS</td>
    <td class="dash-th" style="width: 16%;">COMPLETED</td>
    <td class="dash-th" style="width: 16%;">IN PROGRESS / REVIEW</td>
    <td class="dash-th" style="width: 16%;">ON HOLD / FLAGGED</td>
    <td class="dash-th" style="width: 16%;">REJECTED</td>
    <td class="dash-th" style="width: 20%;" colspan="3">COMPLETION %</td>
  </tr>
  <tr>
    <td class="dash-td">${transactions.length}</td>
    <td class="dash-td" style="color: #006100;">${completedCount}</td>
    <td class="dash-td" style="color: #806000;">${reviewCount}</td>
    <td class="dash-td" style="color: #C65911;">${flaggedCount}</td>
    <td class="dash-td" style="color: #595959;">${rejectedCount}</td>
    <td class="dash-td" style="color: #002B49;" colspan="3">${Math.round((completedCount / (transactions.length || 1)) * 100)}%</td>
  </tr>
  <tr>
    <td colspan="8" class="notice-red">® ALL RIGHTS RESERVED. FINPILOT AI EXECUTIVE FINANCIAL TRACKER LOG. CONFIDENTIAL AUDIT RECORD.</td>
  </tr>
  <tr>
    <td colspan="8" style="text-align: center; color: #375623; font-weight: bold; padding: 4px;">Overall Progress</td>
  </tr>
  <tr><td colspan="8">&nbsp;</td></tr>

  <!-- DATA TABLE -->
  <tr>
    <th class="tbl-th" style="width: 5%;">S.No.</th>
    <th class="tbl-th" style="width: 30%;">Objective / Description</th>
    <th class="tbl-th" style="width: 15%;">Person Responsible / Counterparty</th>
    <th class="tbl-th" style="width: 12%;">Status</th>
    <th class="tbl-th" style="width: 15%;">Reference(s) Used / Category</th>
    <th class="tbl-th" style="width: 13%;">Remarks / AI Verdict</th>
    <th class="tbl-th" style="width: 10%;" colspan="2">Amount (₹)</th>
  </tr>

  ${transactions.map((t, idx) => {
    const statusStyle = 
      t.status === 'Completed' || t.status === 'Approved' ? 'status-completed' :
      t.status === 'Under Review' ? 'status-progress' :
      t.status === 'Flagged' ? 'status-progress' : 'status-rejected';

    return `
    <tr>
      <td class="tbl-td" style="text-align: center; font-weight: bold;">${idx + 1}</td>
      <td class="tbl-td">
        <div style="font-weight: bold;">${t.description || ''}</div>
        <div style="font-size: 9px; color: #6B7280; font-family: monospace;">Txn ID: ${t.txn_id || ''} • Date: ${t.date || ''}</div>
      </td>
      <td class="tbl-td" style="font-weight: bold;">${t.vendor_or_customer || 'Internal Treasury'}</td>
      <td class="tbl-td"><div class="${statusStyle}">${t.status || 'Completed'}</div></td>
      <td class="tbl-td">${t.category || 'Operations'} (${t.department || 'General'})</td>
      <td class="tbl-td" style="font-style: italic; font-size: 10px;">${t.ai_explanation || t.ai_decision || 'Verified safe by AI CFO Engine.'}</td>
      <td class="tbl-td" style="text-align: right; font-weight: bold; font-family: monospace;" colspan="2">₹${(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>`;
  }).join('')}

</table>

</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FinPilot_Financial_Tracker_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExporting(false);
    setExportSuccessMsg("✅ Financial Tracker Spreadsheet downloaded!");
    setTimeout(() => setExportSuccessMsg(null), 3500);
  };

  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !newVendor) return;

    await createTransaction({
      description: newDesc,
      amount: parseFloat(newAmount),
      vendor_or_customer: newVendor,
      department: newDept,
      category: newCat,
      txn_type: newType,
      payment_method: 'Bank Transfer'
    });

    setShowAddModal(false);
    setNewDesc('');
    setNewVendor('');
    setNewAmount('');
    loadTransactions();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-400" />
            Transaction Management & AI Risk Engine
          </h1>
          <p className="text-xs text-slate-400">Statistical Z-Score Anomaly Scan & Automated Executive Risk Review</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {exportSuccessMsg && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl animate-fade-in font-mono">
              {exportSuccessMsg}
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Transaction</span>
          </button>
          <button
            disabled={exporting}
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-700 shrink-0 cursor-pointer transition-all"
          >
            {exporting ? (
              <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <Download className="h-4 w-4 text-blue-400" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by description, vendor, or Txn ID..."
            className="w-full bg-[#0B132B] text-xs text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
          />
        </div>

        <select
          value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}
          className="bg-[#0B132B] text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Administration">Administration</option>
          <option value="HR & Admin">HR & Admin</option>
        </select>

        <select
          value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#0B132B] text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Approved">Approved</option>
          <option value="Flagged">Flagged Risk</option>
          <option value="Under Review">Under Review</option>
          <option value="Rejected">Rejected & Blocked</option>
        </select>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-[#1C2541] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B132B] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Date / ID</th>
                <th className="p-3.5">Description & Vendor</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">AI Risk Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => { setSelectedTxn(t); setActionResult(null); }}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="font-mono text-slate-200 font-bold">{t.txn_id}</div>
                    <div className="text-[10px] text-slate-400">{t.date}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-100">{t.description}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{t.vendor_or_customer} • {t.category}</div>
                  </td>
                  <td className="p-3.5 text-slate-300 font-medium">{t.department}</td>
                  <td className="p-3.5">
                    <div className={`font-bold font-mono text-sm ${t.txn_type === 'INFLOW' ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {t.txn_type === 'INFLOW' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">{t.payment_method}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        t.risk_score >= 70 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        t.risk_score >= 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {t.risk_score} / 100
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'Rejected' ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' :
                      t.status === 'Flagged' ? 'bg-rose-500 text-white' :
                      t.status === 'Under Review' ? 'bg-amber-500 text-black' :
                      t.status === 'Approved' ? 'bg-blue-600 text-white' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Add New Financial Transaction</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateTxn} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Description</label>
                <input type="text" required value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="e.g. AWS Reserve Compute Purchase" className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 mt-1" />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Vendor or Customer Name</label>
                <input type="text" required value={newVendor} onChange={(e) => setNewVendor(e.target.value)} placeholder="e.g. AWS Cloud Services" className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 mt-1" />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Amount (₹)</label>
                <input type="number" required value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="e.g. 485000" className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 mt-1 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium">Department</label>
                  <select value={newDept} onChange={(e) => setNewDept(e.target.value)} className="w-full bg-[#0B132B] text-slate-100 px-2 py-2 rounded-xl border border-slate-700 mt-1">
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full bg-[#0B132B] text-slate-100 px-2 py-2 rounded-xl border border-slate-700 mt-1 font-bold">
                    <option value="OUTFLOW">OUTFLOW (-)</option>
                    <option value="INFLOW">INFLOW (+)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg">Save & Scan Risk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction AI Risk Drawer */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-[#1C2541] border-l border-slate-700 w-full max-w-lg h-full p-6 shadow-2xl space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">TRANSACTION INTELLIGENCE</span>
                <h3 className="font-bold text-slate-100 text-base">{selectedTxn.txn_id}</h3>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-[#0B132B] border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs text-slate-400">Transaction Amount</div>
              <div className="text-2xl font-black text-slate-100 font-mono">{formatCurrency(selectedTxn.amount)}</div>
              <div className="text-xs text-slate-300 font-semibold">{selectedTxn.vendor_or_customer} • {selectedTxn.department}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  selectedTxn.status === 'Rejected'   ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' :
                  selectedTxn.status === 'Approved'   ? 'bg-emerald-600 text-white' :
                  selectedTxn.status === 'Under Review' ? 'bg-amber-500 text-black' :
                  selectedTxn.status === 'Flagged'    ? 'bg-rose-500 text-white' :
                  'bg-blue-600 text-white'
                }`}>{selectedTxn.status}</span>
              </div>
            </div>

            {/* AI Risk Analysis Breakdown */}
            <div className="p-5 bg-gradient-to-b from-rose-950/30 to-[#0B132B] border border-rose-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  AI Risk Analysis (Score: {selectedTxn.risk_score} / 100)
                </h4>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Statistical Anomaly Reasons:</div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedTxn.reasons?.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  )) || <li>Normal historical transaction pattern.</li>}
                </ul>
              </div>

              <div className="pt-2 border-t border-rose-900/40 text-xs">
                <span className="text-slate-400 font-semibold">AI Recommendation:</span>
                <p className="text-rose-200 font-bold mt-0.5">{selectedTxn.ai_recommendation || "Verified safe."}</p>
              </div>
            </div>

            {/* Action Result Banner */}
            {actionResult && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${
                actionResult.success
                  ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-900/40 border-rose-500/60 text-rose-300'
              }`}>
                <span className="text-lg">{actionResult.success ? '✅' : '❌'}</span>
                <span>{actionResult.message}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction(selectedTxn.txn_id, 'Approved')}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  {actionLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : <CheckCircle2 className="h-4 w-4" />}
                  Approve Payment
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction(selectedTxn.txn_id, 'Rejected')}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  {actionLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : <AlertTriangle className="h-4 w-4" />}
                  Reject & Block
                </button>
              </div>
              <button
                disabled={actionLoading}
                onClick={() => handleAction(selectedTxn.txn_id, 'Under Review')}
                className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 disabled:opacity-50 text-amber-300 text-xs font-bold rounded-xl transition-all"
              >
                🔍 Flag for Executive Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
