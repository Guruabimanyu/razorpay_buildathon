export interface MetricItem {
  current: number;
  formatted: string;
  change_pct?: number;
  trend?: 'up' | 'down';
  ai_explanation?: string;
  status?: string;
}

export interface FinancialHealth {
  overall_score: number;
  status: string;
  status_color: string;
  ai_summary: string;
  breakdown: {
    liquidity: number;
    profitability: number;
    cash_flow: number;
    risk: number;
    budget_control: number;
    revenue_stability: number;
  };
  explanations: Record<string, string>;
}

export interface ExecutiveBrief {
  salutation: string;
  headline: string;
  bullets: Array<{ type: string; text: string }>;
  cfo_recommendation: string;
}

export interface TransactionItem {
  id: number;
  txn_id: string;
  date: string;
  description: string;
  txn_type: 'INFLOW' | 'OUTFLOW';
  category: string;
  vendor_or_customer: string;
  amount: number;
  payment_method: string;
  department: string;
  risk_score: number;
  status: string;
  ai_decision?: string;
  ai_explanation?: string;
  reasons?: string[];
  ai_recommendation?: string;
}

export interface InvoiceItem {
  id: number;
  invoice_number: string;
  entity_type: 'PAYABLE' | 'RECEIVABLE';
  entity_name: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total_amount: number;
  status: string;
  is_duplicate: boolean;
  duplicate_prob: number;
  duplicate_reason?: string;
  ai_payment_priority: number;
  ai_recommendation?: string;
}

export interface DigitalTwinSimulation {
  scenario_inputs: {
    rev_change_pct: number;
    exp_change_pct: number;
    hiring_count: number;
    marketing_delta: number;
    lump_sum_capex: number;
  };
  baseline: {
    revenue: number;
    expenses: number;
    net_profit: number;
    cash: number;
    runway: number;
    risk_score: number;
  };
  simulation: {
    sim_revenue: number;
    sim_expenses: number;
    sim_net_profit: number;
    sim_cash: number;
    sim_net_burn: number;
    sim_runway: number;
    sim_risk_score: number;
  };
  cfo_verdict: 'APPROVE' | 'REVIEW' | 'DELAY' | 'REJECT';
  verdict_badge: string;
  ai_reasoning: string;
  confidence: number;
}

export interface CFOAgentResponse {
  user_prompt: string;
  answer: string;
  why: string;
  evidence: string[];
  financial_impact: string;
  recommendation: string;
  confidence: number;
  sources: string[];
  agents_involved: string[];
  tools_called: string[];
}
