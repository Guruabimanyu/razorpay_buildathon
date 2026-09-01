import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ShieldAlert, RefreshCw, Calculator } from 'lucide-react';
import { fetchTaxSummary, validateTaxRecord } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface TaxMatcherViewProps {
  currentOrg?: string;
}

export const TaxMatcherView: React.FC<TaxMatcherViewProps> = ({ currentOrg = 'NovaTech AI Systems' }) => {
  const [data, setData] = useState<any>(null);
  const [testSubtotal, setTestSubtotal] = useState<string>('100000');
  const [testRecordedTax, setTestRecordedTax] = useState<string>('18000');
  const [testResult, setTestResult] = useState<any>(null);

  const loadTax = () => {
    fetchTaxSummary(currentOrg).then(setData);
  };

  useEffect(() => {
    loadTax();
  }, [currentOrg]);

  const handleTestValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await validateTaxRecord(parseFloat(testSubtotal), parseFloat(testRecordedTax), 0.18);
    setTestResult(res);
  };

  if (!data) return <div className="p-8 text-center text-slate-400 font-mono">Loading Tax Matcher...</div>;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#1C2541] via-slate-900 to-[#1C2541] border border-blue-500/40 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-blue-500 text-white tracking-widest">GST AUDIT</span>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-400" />
              Tax-Line Validation & GST Matcher Engine
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Validates invoice tax line calculations (`expected_tax = subtotal * tax_rate`). Detects missing GST, tax rate mismatches, and rounding variances.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
            <span className="text-slate-400">Total Invoices Audited:</span>
            <div className="font-bold text-slate-100">{data.total_invoices_audited}</div>
          </div>
          <div className="p-3 bg-[#0B132B] border border-rose-500/40 rounded-xl">
            <span className="text-slate-400">Total Tax Variance:</span>
            <div className="font-bold text-rose-400">{formatCurrency(data.total_discrepancy_amount)}</div>
          </div>
        </div>
      </div>

      {/* Interactive Tax Line Calculator Form */}
      <div className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-3 shadow-xl">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-blue-400" />
          Live Tax Line Validation Test
        </h2>

        <form onSubmit={handleTestValidate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Invoice Subtotal (₹):</label>
            <input
              type="number"
              value={testSubtotal}
              onChange={(e) => setTestSubtotal(e.target.value)}
              className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Recorded Tax Line (₹):</label>
            <input
              type="number"
              value={testRecordedTax}
              onChange={(e) => setTestRecordedTax(e.target.value)}
              className="w-full bg-[#0B132B] text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Validate GST Calculation
            </button>
          </div>
        </form>

        {testResult && (
          <div className={`p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
            testResult.is_valid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="font-bold">{testResult.explanation}</div>
            <div>Expected GST (18%): {formatCurrency(testResult.expected_tax)} | Recorded: {formatCurrency(testResult.recorded_tax)}</div>
          </div>
        )}
      </div>

      {/* Tax Validation Table */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-slate-100">Audit Results Matrix</h2>

        <div className="space-y-3">
          {data.audit_results?.map((res: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                res.is_valid ? 'bg-[#0B132B] border-slate-800' : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
              }`}
            >
              <div>
                <div className="font-bold text-slate-200">{res.invoice_number} • {res.vendor_or_customer}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{res.explanation}</div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Expected 18% GST</div>
                  <div className="font-bold text-blue-400">{formatCurrency(res.expected_tax)}</div>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Recorded GST</div>
                  <div className={`font-bold ${res.is_valid ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(res.recorded_tax)}</div>
                </div>

                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  res.is_valid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {res.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
