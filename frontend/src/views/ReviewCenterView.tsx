import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Link, ShieldAlert, AlertTriangle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { fetchPendingReviews, executeReviewAction } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface ReviewCenterViewProps {
  currentOrg?: string;
}

export const ReviewCenterView: React.FC<ReviewCenterViewProps> = ({ currentOrg = 'NovaTech AI Systems' }) => {
  const [data, setData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReviews = () => {
    fetchPendingReviews(currentOrg).then(setData);
  };

  useEffect(() => {
    loadReviews();
  }, [currentOrg]);

  const handleExecuteAction = async (reviewId: string, action: string) => {
    setActionLoading(reviewId);
    try {
      await executeReviewAction(reviewId, action, `Human CFO action '${action}' confirmed.`);
      loadReviews();
    } catch (e) {
      alert("Error executing review action.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!data) return <div className="p-8 text-center text-slate-400 font-mono">Loading Review Center...</div>;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#1C2541] via-slate-900 to-[#1C2541] border border-blue-500/40 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-blue-500 text-white tracking-widest">HUMAN IN THE LOOP</span>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-blue-400" />
              Human Review & Escalation Center
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Review uncertain or ambiguous matches (confidence 75-89%). Every human decision is recorded in the immutable audit log.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs rounded-xl shrink-0">
          {data.pending_count} Pending Review Items
        </span>
      </div>

      {/* Review Table / Cards */}
      <div className="space-y-4">
        {data.reviews?.map((rev: any) => (
          <div key={rev.review_id} className="p-5 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-bold text-xs text-blue-400">{rev.review_id}</span>
                <span className="text-xs font-bold text-slate-100">{rev.vendor}</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">{formatCurrency(rev.amount)}</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Confidence:</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                  {rev.confidence}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Document Record</div>
                <div className="font-semibold text-slate-200">{rev.source_record}</div>
              </div>
              <div className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matched Bank / Ledger Record</div>
                <div className="font-semibold text-blue-300">{rev.matched_record}</div>
              </div>
            </div>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Issue: {rev.issue}
              </div>
              <div className="text-slate-300 text-[11px]">
                Recommended Action: <strong>{rev.recommended_action}</strong>
              </div>
            </div>

            {/* Human Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => handleExecuteAction(rev.review_id, "APPROVE_MATCH")}
                disabled={actionLoading === rev.review_id}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve Match</span>
              </button>

              <button
                onClick={() => handleExecuteAction(rev.review_id, "LINK_RECORDS")}
                disabled={actionLoading === rev.review_id}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Link className="h-3.5 w-3.5" />
                <span>Link Records</span>
              </button>

              <button
                onClick={() => handleExecuteAction(rev.review_id, "MARK_EXCEPTION")}
                disabled={actionLoading === rev.review_id}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Mark Exception</span>
              </button>

              <button
                onClick={() => handleExecuteAction(rev.review_id, "REJECT_MATCH")}
                disabled={actionLoading === rev.review_id}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
