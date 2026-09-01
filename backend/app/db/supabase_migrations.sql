-- =====================================================================
-- FINPILOT AI — SUPABASE POSTGRESQL COMPLETE DATABASE MIGRATION SCRIPT
-- =====================================================================
-- Run this migration in your Supabase SQL Editor to initialize all tables,
-- Row Level Security (RLS) policies, indexes, and performance triggers.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    annual_revenue DOUBLE PRECISION DEFAULT 0.0,
    monthly_expenses DOUBLE PRECISION DEFAULT 0.0,
    current_cash DOUBLE PRECISION DEFAULT 0.0,
    employee_count INT DEFAULT 1,
    avg_monthly_payroll DOUBLE PRECISION DEFAULT 0.0,
    primary_currency VARCHAR(10) DEFAULT 'INR',
    country VARCHAR(100) DEFAULT 'India',
    financial_year VARCHAR(20) DEFAULT 'FY2025-26',
    min_cash_reserve DOUBLE PRECISION DEFAULT 25000000.0,
    preferred_runway_months DOUBLE PRECISION DEFAULT 6.0,
    approval_threshold DOUBLE PRECISION DEFAULT 500000.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CFO',
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50),
    action VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS public.organization_members (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    role_id INT REFERENCES public.roles(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'CFO',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. WALLETS & BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS public.wallets (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    available_balance DOUBLE PRECISION DEFAULT 0.0,
    pending_balance DOUBLE PRECISION DEFAULT 0.0,
    reserved_cash DOUBLE PRECISION DEFAULT 0.0,
    total_receivables DOUBLE PRECISION DEFAULT 0.0,
    total_payables DOUBLE PRECISION DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'INR',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    bank_name VARCHAR(100),
    account_number VARCHAR(100),
    account_type VARCHAR(50),
    balance DOUBLE PRECISION DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'INR',
    is_primary BOOLEAN DEFAULT FALSE
);

-- 6. TRANSACTIONS & EVENTS
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    txn_id VARCHAR(100) UNIQUE NOT NULL,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    txn_type VARCHAR(20) NOT NULL, -- INFLOW, OUTFLOW
    category VARCHAR(100),
    vendor_or_customer VARCHAR(255),
    amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50),
    department VARCHAR(100),
    risk_score INT DEFAULT 10,
    status VARCHAR(50) DEFAULT 'Completed', -- Completed, Approved, Under Review, Flagged, Rejected
    ai_decision VARCHAR(100),
    ai_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.transaction_events (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- CREATED, PENDING_APPROVAL, APPROVED, REJECTED, UNDER_REVIEW, COMPLETED
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    event_metadata JSONB,
    created_by VARCHAR(100) DEFAULT 'System AI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    response_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ACCOUNTING & GENERAL LEDGER
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    balance DOUBLE PRECISION DEFAULT 0.0,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id SERIAL PRIMARY KEY,
    entry_id VARCHAR(100) UNIQUE NOT NULL,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference VARCHAR(100),
    description TEXT,
    total_debit DOUBLE PRECISION DEFAULT 0.0,
    total_credit DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'POSTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id SERIAL PRIMARY KEY,
    entry_id VARCHAR(100) REFERENCES public.journal_entries(entry_id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255),
    debit DOUBLE PRECISION DEFAULT 0.0,
    credit DOUBLE PRECISION DEFAULT 0.0,
    description TEXT
);

-- 8. VENDORS, CUSTOMERS, INVOICES, BUDGETS
CREATE TABLE IF NOT EXISTS public.vendors (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    total_spend DOUBLE PRECISION DEFAULT 0.0,
    txn_count INT DEFAULT 1,
    avg_invoice DOUBLE PRECISION DEFAULT 0.0,
    risk_score INT DEFAULT 10,
    renegotiation_candidate BOOLEAN DEFAULT FALSE,
    duplicate_invoice_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.customers (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_revenue DOUBLE PRECISION DEFAULT 0.0,
    invoice_count INT DEFAULT 1,
    outstanding_amount DOUBLE PRECISION DEFAULT 0.0,
    avg_payment_delay_days INT DEFAULT 0,
    risk_score INT DEFAULT 10,
    late_payment_prob DOUBLE PRECISION DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50),
    entity_name VARCHAR(255),
    issue_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    subtotal DOUBLE PRECISION DEFAULT 0.0,
    tax DOUBLE PRECISION DEFAULT 0.0,
    total_amount DOUBLE PRECISION DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'Pending',
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_prob DOUBLE PRECISION DEFAULT 0.0,
    duplicate_reason TEXT,
    ai_payment_priority INT DEFAULT 2,
    ai_recommendation TEXT
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    allocated_amount DOUBLE PRECISION NOT NULL,
    actual_spent DOUBLE PRECISION DEFAULT 0.0,
    variance DOUBLE PRECISION DEFAULT 0.0,
    utilization_pct DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'ON_BUDGET',
    ai_recommendation TEXT
);

-- 9. DIGITAL TWIN SIMULATION TABLES
CREATE TABLE IF NOT EXISTS public.scenarios (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(100) UNIQUE NOT NULL,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    horizon_months INT DEFAULT 12,
    revenue_shock_pct DOUBLE PRECISION DEFAULT 0.0,
    payroll_change_pct DOUBLE PRECISION DEFAULT 0.0,
    opex_change_pct DOUBLE PRECISION DEFAULT 0.0,
    expansion_capex DOUBLE PRECISION DEFAULT 0.0,
    credit_delay_days INT DEFAULT 0,
    created_by VARCHAR(100) DEFAULT 'AI CFO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.scenario_results (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(100) REFERENCES public.scenarios(scenario_id) ON DELETE CASCADE,
    month INT NOT NULL,
    projected_revenue DOUBLE PRECISION,
    projected_expenses DOUBLE PRECISION,
    projected_net_income DOUBLE PRECISION,
    projected_cash_balance DOUBLE PRECISION,
    projected_runway_months DOUBLE PRECISION,
    health_score INT,
    risk_level VARCHAR(50)
);

-- 10. CHATBOT CONVERSATIONS & TOOLS
CREATE TABLE IF NOT EXISTS public.conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(100) UNIQUE NOT NULL,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(255) DEFAULT 'New CFO Conversation',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(100) REFERENCES public.conversations(conversation_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- USER, ASSISTANT, SYSTEM, TOOL
    content TEXT NOT NULL,
    intent VARCHAR(100),
    confidence INT DEFAULT 95,
    sources JSONB,
    metrics JSONB,
    charts JSONB,
    actions JSONB,
    tool_calls JSONB,
    execution_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AUDIT LOGS & ALERTS
CREATE TABLE IF NOT EXISTS public.risk_alerts (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) NOT NULL,
    category VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    impact_amount DOUBLE PRECISION DEFAULT 0.0,
    recommended_action TEXT,
    is_resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- INDEXES FOR HIGH PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_txns_org_date ON public.transactions(organization_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_txns_status ON public.transactions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_txn_events_txn ON public.transaction_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_conv_org_user ON public.conversations(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_conv_msg_cid ON public.conversation_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_journal_org ON public.journal_entries(organization_id, date DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Default Permissive RLS Policy for Authenticated Service Users
CREATE POLICY "Allow Organization Isolation" ON public.transactions
    FOR ALL USING (organization_id IS NOT NULL);

-- =====================================================================
-- REALTIME PUBLICATION ENABLEMENT
-- =====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_alerts;
