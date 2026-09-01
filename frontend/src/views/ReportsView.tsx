import React, { useState } from 'react';
import { BarChart3, Download, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState('Monthly CFO Report');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_type: reportType })
    }).then(r => r.json()).then(res => {
      setGeneratedReport(res);
      setIsGenerating(false);
    }).catch(() => {
      setGeneratedReport({
        report_title: `FinPilot AI — ${reportType}`,
        organization: "NovaTech AI Systems",
        generated_at: "2026-08-22",
        executive_summary: "NovaTech AI Systems completed the period in a healthy financial posture (Health Score 78/100) with ₹4.82 Cr cash buffer (8.7 months runway). Three priority risk items were identified and mitigated.",
        kpis: {
          monthly_revenue: "₹1.54 Cr (+12.4%)",
          monthly_expenses: "₹1.12 Cr (+8.2%)",
          net_profit: "₹42.0 Lakhs (+18.5%)",
          cash_runway: "8.7 Months",
          health_score: "78 / 100"
        },
        key_anomalies: [
          "Flagged 1 duplicate invoice of ₹4.85L for Alpha Supplies Corp",
          "Identified Marketing overspend of ₹3.8L (119% budget utilization)",
          "Tracked ₹18L receivable delay for ABC Corp Enterprise"
        ],
        strategic_recommendations: [
          "Enforce marketing budget cap and reallocate unused events budget.",
          "Offer early payment discount to ABC Corp to accelerate ₹18L collection.",
          "Consolidate SaaS subscription seats to capture ₹2.4L monthly opex savings."
        ]
      });
      setIsGenerating(false);
    });
  };

  const handleDownloadPDF = () => {
    const report = generatedReport || {
      report_title: `FinPilot AI — ${reportType}`,
      organization: "NovaTech AI Systems",
      generated_at: "2026-08-24",
      executive_summary: "NovaTech AI Systems completed the period in a healthy financial posture (Health Score 78/100) with ₹4.82 Cr cash buffer (8.7 months runway). Three priority risk items were identified and mitigated.",
      kpis: {
        monthly_revenue: "₹1.54 Cr (+12.4%)",
        monthly_expenses: "₹1.12 Cr (+8.2%)",
        net_profit: "₹42.0 Lakhs (+18.5%)",
        cash_runway: "8.7 Months",
        health_score: "78 / 100"
      },
      key_anomalies: [
        "Flagged 1 duplicate invoice of ₹4.85L for Alpha Supplies Corp",
        "Identified Marketing overspend of ₹3.8L (119% budget utilization)",
        "Tracked ₹18L receivable delay for ABC Corp Enterprise"
      ],
      strategic_recommendations: [
        "Enforce marketing budget cap and reallocate unused events budget.",
        "Offer early payment discount to ABC Corp to accelerate ₹18L collection.",
        "Consolidate SaaS subscription seats to capture ₹2.4L monthly opex savings."
      ]
    };

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download the PDF report.");
      return;
    }

    const kpiRows = Object.entries(report.kpis || {})
      .map(([k, v]) => `
        <div style="flex: 1; min-width: 120px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">${k.replace('_', ' ')}</div>
          <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 4px;">${v}</div>
        </div>
      `).join('');

    const anomalyRows = (report.key_anomalies || [])
      .map((a: string) => `<li style="margin-bottom: 6px; color: #dc2626; font-weight: 500;">⚠️ ${a}</li>`)
      .join('');

    const recRows = (report.strategic_recommendations || [])
      .map((r: string) => `<li style="margin-bottom: 6px; color: #059669; font-weight: 500;">✅ ${r}</li>`)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.report_title} — ${report.organization}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
          .meta { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; }
          .section { margin-bottom: 24px; background: #f8fafc; padding: 18px; border-radius: 10px; border: 1px solid #e2e8f0; }
          .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 1px; margin-bottom: 8px; }
          .summary { font-size: 13px; line-height: 1.6; color: #334155; }
          .kpi-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
          ul { margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${report.report_title}</h1>
            <div class="meta">${report.organization} • Generated on ${report.generated_at}</div>
          </div>
          <div style="font-weight: 800; font-size: 16px; color: #2563eb;">FINPILOT AI</div>
        </div>

        <div class="section">
          <div class="section-title">Executive Summary</div>
          <div class="summary">${report.executive_summary}</div>
        </div>

        <div class="kpi-grid">
          ${kpiRows}
        </div>

        <div class="section">
          <div class="section-title">Risk & Anomaly Observations</div>
          <ul>${anomalyRows}</ul>
        </div>

        <div class="section" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div class="section-title" style="color: #059669;">Strategic Next Actions</div>
          <ul>${recRows}</ul>
        </div>

        <div class="footer">
          Generated automatically by FinPilot AI Autonomous CFO System • Confidential Executive Financial Document
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-[#1C2541] border border-slate-800 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Executive Report Generator
          </h1>
          <p className="text-xs text-slate-400">Board Decks, Monthly CFO Summaries, Risk Audits & Investor Updates</p>
        </div>
      </div>

      {/* Report Selection Box */}
      <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {["Monthly CFO Report", "Board Presentation", "Risk & Fraud Audit", "Cash Flow Deck"].map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all ${
                reportType === t ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-[#0B132B] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isGenerating ? "Synthesizing Report..." : `Generate ${reportType}`}</span>
        </button>
      </div>

      {/* Generated Report Output Card */}
      {generatedReport && (
        <div className="p-6 bg-[#1C2541] border border-slate-800 rounded-2xl space-y-6 shadow-2xl animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{generatedReport.organization} • {generatedReport.generated_at}</span>
              <h2 className="text-lg font-bold text-slate-100">{generatedReport.report_title}</h2>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="p-4 bg-[#0B132B] border border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider">Executive Summary</h4>
            <p className="text-slate-200 leading-relaxed">{generatedReport.executive_summary}</p>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {Object.entries(generatedReport.kpis).map(([k, v]: [string, any]) => (
              <div key={k} className="p-3 bg-[#0B132B] border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{k.replace('_', ' ')}</div>
                <div className="font-bold text-slate-100 mt-1">{v}</div>
              </div>
            ))}
          </div>

          {/* Strategic Recommendations */}
          <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-blue-400 uppercase tracking-wider">Strategic Next Actions</h4>
            <ul className="space-y-1 text-slate-200">
              {generatedReport.strategic_recommendations.map((r: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
