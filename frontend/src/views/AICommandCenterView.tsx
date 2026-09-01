import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Zap, FileText, BarChart3, ShieldCheck, Users, AlertTriangle,
  Settings2, MessageSquare, TrendingDown, Sparkles, CheckCircle2,
  Clock, Activity, Upload, RefreshCw, ChevronRight, Target, DollarSign,
  FileSearch, Bot, Play, Send
} from 'lucide-react';

const TABS = [
  { id: 'overview',       label: 'AI Brief',         icon: Brain },
  { id: 'insights',       label: 'Insights',          icon: Sparkles },
  { id: 'documents',      label: 'Documents',         icon: FileSearch },
  { id: 'reports',        label: 'Reports',           icon: BarChart3 },
  { id: 'compliance',     label: 'Compliance',        icon: ShieldCheck },
  { id: 'fraud',          label: 'Fraud',             icon: AlertTriangle },
  { id: 'automation',     label: 'Automation',        icon: Zap },
  { id: 'cost',           label: 'Cost Savings',      icon: DollarSign },
  { id: 'comms',          label: 'Communications',    icon: MessageSquare },
  { id: 'roi',            label: 'AI ROI',            icon: Target },
  { id: 'activity',       label: 'Activity Feed',     icon: Activity },
];

// ── shared helpers ──────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    red: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${map[color] || map.blue}`}>{label}</span>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1C2541] border border-slate-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, sub }: { icon: any; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <h2 className="font-bold text-slate-100 text-base">{title}</h2>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ── Panels ────────────────────────────────────────────────

function OverviewPanel({ data }: { data: any }) {
  if (!data) return <div className="text-slate-400 text-sm">Loading AI Brief…</div>;
  const { brief, summary } = data;
  const colorMap: Record<string, string> = {
    positive: 'text-emerald-400', warning: 'text-amber-400',
    critical: 'text-rose-400', info: 'text-blue-400'
  };
  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-[#1C2541] to-[#0B132B]">
        <SectionTitle icon={Brain} title="FinPilot AI Daily Brief" sub="Generated from live financial data" />
        <p className="text-slate-100 font-semibold text-sm mb-3">{brief?.headline}</p>
        <div className="space-y-1.5 mb-4">
          {brief?.bullets?.map((b: any, i: number) => (
            <p key={i} className={`text-sm font-medium ${colorMap[b.type] || 'text-slate-300'}`}>{b.text}</p>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Priorities</p>
          <ol className="space-y-1">
            {brief?.priorities?.map((p: string, i: number) => (
              <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {summary && Object.entries(summary).map(([k, v]) => (
          <div key={k} className="p-3.5 bg-[#1C2541] border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{k.replace(/_/g, ' ')}</div>
            <div className="text-sm font-black text-slate-100 mt-0.5">{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsPanel({ data, onNavigateView }: { data: any; onNavigateView?: (view: string) => void }) {
  const priorityColor: Record<string, string> = {
    positive: 'border-l-emerald-500 bg-emerald-950/20',
    warning: 'border-l-amber-500 bg-amber-950/20',
    critical: 'border-l-rose-500 bg-rose-950/20',
    neutral: 'border-l-slate-500 bg-slate-800/20',
  };
  const insights = data?.insights || [];
  return (
    <div className="space-y-3">
      <SectionTitle icon={Sparkles} title="AI Business Insights" sub="Continuously generated from financial data" />
      {insights.map((ins: any, i: number) => (
        <div key={i} className={`p-4 border-l-4 rounded-xl ${priorityColor[ins.priority] || 'border-l-slate-500'} bg-[#1C2541] border border-slate-800`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{ins.icon}</span>
                <span className="font-bold text-sm text-slate-100">{ins.title}</span>
              </div>
              <p className="text-xs text-slate-300">{ins.body}</p>
            </div>
            <button
              onClick={() => onNavigateView && ins.module && onNavigateView(ins.module)}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg border border-blue-500/30 transition-all"
            >
              {ins.action} <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentsPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await fetch('/api/ai-command/documents/analyze', { method: 'POST', body: fd });
      const d = await r.json();
      setResult(d);
    } catch { }
    setLoading(false);
  };

  const askDoc = async () => {
    if (!question || !result) return;
    const r = await fetch('/api/ai-command/documents/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, document_context: JSON.stringify(result?.extracted_fields) })
    });
    const d = await r.json();
    setAnswer(d.answer || '');
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={FileSearch} title="AI Document Intelligence" sub="Upload invoices, contracts, reports, statements" />
      <Card>
        <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-8 text-center transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
          <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-300 text-sm font-medium">{file ? file.name : 'Click to upload — PDF, Excel, CSV, Image, Word'}</p>
          <p className="text-slate-500 text-xs mt-1">Supports invoices, contracts, annual reports, bank statements</p>
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.xlsx,.csv,.docx,.jpg,.png" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
        {file && (
          <button onClick={upload} disabled={loading} className="mt-3 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            <Brain className="h-4 w-4" /> {loading ? 'Analyzing…' : 'Analyze Document with AI'}
          </button>
        )}
      </Card>

      {result && (
        <div className="space-y-3">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-100 text-sm">{result.document_name}</span>
              <Badge label={result.document_class} color="blue" />
            </div>
            <p className="text-xs text-slate-300 mb-3 italic">{result.ai_summary}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(result.extracted_fields || {}).map(([k, v]) => (
                <div key={k} className="p-2 bg-[#0B132B] rounded-lg">
                  <div className="text-slate-400 text-[10px] font-mono uppercase">{k.replace(/_/g, ' ')}</div>
                  <div className="text-slate-100 font-bold">{String(v)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Compliance Flags</p>
            <div className="space-y-1.5">
              {result.compliance_flags?.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#0B132B] rounded-lg">
                  <span className="text-slate-300">{f.field}</span>
                  <Badge label={f.status} color={f.status === 'PRESENT' ? 'green' : 'amber'} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ask About This Document</p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="What is the invoice amount? What are the payment terms?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askDoc()}
              />
              <button onClick={askDoc} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                <Send className="h-4 w-4" />
              </button>
            </div>
            {answer && (
              <div className="mt-3 p-3 bg-[#0B132B] border border-blue-500/20 rounded-xl text-xs text-slate-200 leading-relaxed">
                <span className="text-[10px] font-bold text-blue-400 block mb-1">📖 Document AI Answer</span>
                {answer}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function ReportsPanel() {
  const [type, setType] = useState('monthly');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/ai-command/reports/generate?report_type=${type}`);
      setReport(await r.json());
    } catch { }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={BarChart3} title="AI Report Studio" sub="One-click AI-generated CFO reports" />
      <Card>
        <div className="flex flex-wrap gap-2 mb-4">
          {['monthly', 'quarterly', 'board', 'risk'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${type === t ? 'bg-blue-600 text-white' : 'bg-[#0B132B] text-slate-300 border border-slate-700'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} Report
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? 'Generating AI Report…' : 'Generate CFO Report'}
        </button>
      </Card>

      {report && (
        <div className="space-y-3">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-100">{report.title}</span>
              <Badge label={report.period} color="blue" />
            </div>
            <p className="text-xs text-slate-400 mb-3">Generated: {report.generated_at} • ID: {report.report_id}</p>
            <p className="text-sm text-slate-200 font-medium italic">{report.sections?.executive_summary?.headline}</p>
          </Card>

          <Card>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Financial Metrics</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(report.sections?.executive_summary?.key_metrics || {}).map(([k, v]) => (
                <div key={k} className="p-2 bg-[#0B132B] rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">{k.replace(/_/g, ' ')}</div>
                  <div className="text-sm font-bold text-slate-100">{String(v)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommendations</p>
            <ol className="space-y-1.5">
              {report.sections?.recommendations?.map((r: string, i: number) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ol>
          </Card>

          <p className="text-[10px] text-slate-500 italic">{report.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

function CompliancePanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <SectionTitle icon={ShieldCheck} title="Compliance Center" sub="Rule-based + AI compliance monitoring" />
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl text-center">
          <div className="text-2xl font-black text-emerald-400">{data.compliance_score}</div>
          <div className="text-[10px] text-slate-400 font-mono">Compliance Score</div>
          <div className="text-[11px] text-emerald-300">{data.score_label}</div>
        </div>
        <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl text-center">
          <div className="text-2xl font-black text-rose-400">{data.open_exceptions}</div>
          <div className="text-[10px] text-slate-400 font-mono">Open Exceptions</div>
          <div className="text-[11px] text-rose-300">{data.critical} Critical</div>
        </div>
        <div className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl text-center">
          <div className="text-2xl font-black text-blue-400">{data.audit_completeness}</div>
          <div className="text-[10px] text-slate-400 font-mono">Audit Completeness</div>
          <div className="text-[11px] text-blue-300">Threshold: {data.approval_threshold}</div>
        </div>
      </div>

      <div className="space-y-2">
        {data.exceptions?.map((ex: any, i: number) => (
          <div key={i} className={`p-4 bg-[#1C2541] border rounded-xl ${ex.severity === 'HIGH' ? 'border-rose-500/40' : 'border-amber-500/30'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-slate-100">{ex.type}</span>
              <Badge label={ex.severity} color={ex.severity === 'HIGH' ? 'red' : 'amber'} />
            </div>
            <p className="text-xs text-slate-300 mb-1">{ex.description}</p>
            <p className="text-[11px] text-slate-400 italic">Rule: {ex.rule}</p>
            <p className="text-[11px] text-blue-400 mt-1">→ {ex.recommended_action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FraudPanel({ data }: { data: any }) {
  if (!data) return null;
  const { fraud_stats: stats, suspicious_transactions: txns } = data;
  return (
    <div className="space-y-4">
      <SectionTitle icon={AlertTriangle} title="Fraud & Anomaly Center" sub="Rule engine + Statistical + AI behavioral analysis" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Analyzed', value: stats?.total_analyzed, color: 'text-slate-100' },
          { label: 'Suspicious', value: stats?.suspicious_count, color: 'text-amber-400' },
          { label: 'Critical', value: stats?.critical_count, color: 'text-rose-400' },
          { label: 'Amount at Risk', value: stats?.total_at_risk, color: 'text-rose-400' },
        ].map((m, i) => (
          <div key={i} className="p-3 bg-[#1C2541] border border-slate-800 rounded-xl text-center">
            <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-slate-400 font-mono">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {txns?.map((t: any, i: number) => (
          <div key={i} className="p-4 bg-[#1C2541] border border-rose-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-sm text-slate-100">{t.txn_id}</span>
                <span className="text-xs text-slate-400 ml-2">— {t.vendor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-100">{t.amount}</span>
                <Badge label={`${t.risk_score}/100`} color={t.risk_score >= 80 ? 'red' : 'amber'} />
              </div>
            </div>
            <ul className="space-y-0.5 mb-2">
              {t.reasons?.map((r: string, j: number) => (
                <li key={j} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <span className="text-rose-400">•</span> {r}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-blue-400 font-medium">→ {t.recommended_action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutomationPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <SectionTitle icon={Zap} title="Finance Automation Center" sub="Active workflows • No-code automation engine" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Active Automations', value: data.summary?.active_automations },
          { label: 'Runs Today', value: data.summary?.runs_today },
          { label: 'Success Rate', value: data.summary?.success_rate },
          { label: 'Hours Saved (Month)', value: data.summary?.hours_saved_this_month },
          { label: 'Tasks Automated', value: data.summary?.tasks_automated_this_month },
        ].map((m, i) => (
          <div key={i} className="p-3 bg-[#1C2541] border border-slate-800 rounded-xl">
            <div className="text-lg font-black text-emerald-400">{m.value}</div>
            <div className="text-[10px] text-slate-400 font-mono">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {data.automations?.map((a: any, i: number) => (
          <div key={i} className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-100">{a.name}</span>
              <Badge label={a.status} color="green" />
            </div>
            <p className="text-[11px] text-slate-400 mb-1"><span className="text-amber-400 font-bold">WHEN</span> {a.trigger}</p>
            <p className="text-[11px] text-slate-400 mb-2"><span className="text-blue-400 font-bold">THEN</span> {a.action}</p>
            <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
              <span>Runs: {a.runs_today}</span>
              <span>✓ {a.successful}</span>
              <span>Last: {a.last_run}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <SectionTitle icon={DollarSign} title="Cost Optimization Center" sub="AI-identified savings opportunities from actual spending data" />
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-br from-emerald-900/30 to-emerald-950/10 border border-emerald-500/30 rounded-xl">
          <div className="text-2xl font-black text-emerald-400">{data.total_monthly_savings_potential}</div>
          <div className="text-xs text-slate-300">Monthly Savings Potential</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-950/10 border border-blue-500/30 rounded-xl">
          <div className="text-2xl font-black text-blue-400">{data.total_annual_savings_potential}</div>
          <div className="text-xs text-slate-300">Annual Savings Potential</div>
        </div>
      </div>

      <div className="space-y-3">
        {data.opportunities?.map((o: any, i: number) => (
          <div key={i} className="p-4 bg-[#1C2541] border border-slate-800 rounded-xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-100">{o.category}</span>
                  <Badge label={`Effort: ${o.effort}`} color="blue" />
                </div>
                <p className="text-xs text-slate-300">{o.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-black text-emerald-400 text-sm">₹{(o.monthly_saving / 100000).toFixed(1)}L</div>
                <div className="text-[10px] text-slate-400">/month</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-blue-400">→ {o.action}</p>
              <span className="text-[10px] text-slate-400 font-mono">Confidence: {o.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 italic">{data.disclaimer}</p>
    </div>
  );
}

function CommsPanel() {
  const [type, setType] = useState('invoice_reminder');
  const [recipient, setRecipient] = useState('ABC Corp Finance Team');
  const [tone, setTone] = useState('professional');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/ai-command/communications/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comm_type: type, recipient, tone,
          context: { invoice_number: 'INV-REC-904', amount: '₹18,00,000', due_date: '2026-09-06', days_overdue: 7 }
        })
      });
      setResult(await r.json());
    } catch { }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={MessageSquare} title="AI Communication Center" sub="AI-personalized finance communications" />
      <Card>
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div>
            <label className="text-slate-400 mb-1 block font-mono">Message Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full bg-[#0B132B] border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500">
              <option value="invoice_reminder">Invoice Reminder</option>
              <option value="collection">Collection Follow-Up</option>
              <option value="budget_alert">Budget Alert</option>
              <option value="executive_brief">Executive Brief</option>
              <option value="vendor_notice">Vendor Notice</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 mb-1 block font-mono">Tone</label>
            <select value={tone} onChange={e => setTone(e.target.value)}
              className="w-full bg-[#0B132B] border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500">
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="urgent">Urgent</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
        <input value={recipient} onChange={e => setRecipient(e.target.value)}
          placeholder="Recipient name / company"
          className="w-full bg-[#0B132B] border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs mb-3 focus:outline-none focus:border-blue-500" />
        <button onClick={generate} disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {loading ? 'Generating…' : 'Generate AI Communication'}
        </button>
      </Card>

      {result && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-100">Subject:</span>
            <Badge label="Requires Approval" color="amber" />
          </div>
          <p className="text-xs text-blue-300 mb-3 font-medium">{result.subject}</p>
          <div className="bg-[#0B132B] rounded-xl p-4 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {result.body}
          </div>
          <p className="text-[10px] text-slate-500 italic mt-2">{result.disclaimer}</p>
        </Card>
      )}
    </div>
  );
}

function ROIPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <SectionTitle icon={Target} title="AI ROI Dashboard" sub="System-derived impact metrics" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(data.metrics || {}).map(([k, v]) => (
          <div key={k} className="p-3.5 bg-[#1C2541] border border-slate-800 rounded-xl">
            <div className="text-lg font-black text-emerald-400">{String(v)}</div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">{k.replace(/_/g, ' ')}</div>
          </div>
        ))}
      </div>
      <Card>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Agent Activity (Month-to-Date)</p>
        <div className="space-y-2">
          {data.agent_activity?.map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#0B132B] rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-slate-300">{a.agent}</span>
              </div>
              <div className="flex gap-3 text-slate-400 font-mono">
                <span>{a.runs} runs</span>
                <span className="text-emerald-400">{a.success_rate}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 italic mt-3">{data.disclaimer}</p>
      </Card>
    </div>
  );
}

function ActivityPanel({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <SectionTitle icon={Activity} title="AI Activity Feed" sub="Real-time system events from all agents" />
      {data?.activities?.map((a: any, i: number) => (
        <div key={i} className="flex items-start gap-3 p-3.5 bg-[#1C2541] border border-slate-800 rounded-xl">
          <span className="text-lg mt-0.5">{a.icon}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">{a.event}</span>
              <span className="text-[10px] text-slate-500 font-mono">{a.time}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{a.detail}</p>
            <span className="text-[10px] text-blue-400 font-mono">{a.agent}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


// ── MAIN VIEW ────────────────────────────────────────────────
export const AICommandCenterView: React.FC<{ onNavigateView?: (view: string) => void }> = ({ onNavigateView }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allData, setAllData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async (tab: string) => {
    const endpoints: Record<string, string> = {
      overview: '/api/ai-command/insights',
      insights:  '/api/ai-command/insights',
      compliance: '/api/ai-command/compliance',
      fraud:      '/api/ai-command/fraud',
      automation: '/api/ai-command/automation',
      cost:       '/api/ai-command/cost-optimization',
      roi:        '/api/ai-command/roi-dashboard',
      activity:   '/api/ai-command/activity',
    };
    const url = endpoints[tab];
    if (!url || allData[tab]) return;
    setLoading(true);
    try {
      const r = await fetch(url);
      const d = await r.json();
      setAllData(prev => ({ ...prev, [tab]: d }));
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadData('overview'); }, []);
  useEffect(() => { loadData(activeTab); setLoading(false); }, [activeTab]);

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-[#1C2541] to-[#0B132B] border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">AI Finance Command Center</h1>
            <p className="text-xs text-slate-400">Generative AI Finance & Accounting Operating System — 10 Intelligence Modules Active</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {['Insights', 'Documents', 'Reports', 'Compliance', 'Fraud Detection', 'Automation', 'Cost Optimization', 'Communications', 'AI ROI'].map(m => (
            <span key={m} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">{m}</span>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex overflow-x-auto gap-1 bg-[#0B132B] p-1.5 rounded-2xl border border-slate-800 scrollbar-none">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div>
        {activeTab === 'overview'    && <OverviewPanel data={allData.overview} />}
        {activeTab === 'insights'    && <InsightsPanel data={allData.insights} onNavigateView={onNavigateView} />}
        {activeTab === 'documents'   && <DocumentsPanel />}
        {activeTab === 'reports'     && <ReportsPanel />}
        {activeTab === 'compliance'  && <CompliancePanel data={allData.compliance} />}
        {activeTab === 'fraud'       && <FraudPanel data={allData.fraud} />}
        {activeTab === 'automation'  && <AutomationPanel data={allData.automation} />}
        {activeTab === 'cost'        && <CostPanel data={allData.cost} />}
        {activeTab === 'comms'       && <CommsPanel />}
        {activeTab === 'roi'         && <ROIPanel data={allData.roi} />}
        {activeTab === 'activity'    && <ActivityPanel data={allData.activity} />}
      </div>
    </div>
  );
};
