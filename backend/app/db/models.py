import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    industry = Column(String)
    company_size = Column(String)
    annual_revenue = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    current_cash = Column(Float, default=0.0)
    employee_count = Column(Integer, default=1)
    avg_monthly_payroll = Column(Float, default=0.0)
    primary_currency = Column(String, default="INR")
    country = Column(String, default="India")
    financial_year = Column(String, default="FY2025-26")
    min_cash_reserve = Column(Float, default=25000000.0)
    preferred_runway_months = Column(Float, default=6.0)
    approval_threshold = Column(Float, default=500000.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="organization")
    transactions = relationship("Transaction", back_populates="organization")
    invoices = relationship("Invoice", back_populates="organization")
    budgets = relationship("Budget", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="CFO")
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    available_balance = Column(Float, default=0.0)
    pending_balance = Column(Float, default=0.0)
    reserved_cash = Column(Float, default=0.0)
    total_receivables = Column(Float, default=0.0)
    total_payables = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    bank_name = Column(String)
    account_number = Column(String)
    account_type = Column(String)
    balance = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    is_primary = Column(Boolean, default=False)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    txn_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String)
    txn_type = Column(String) # INFLOW, OUTFLOW
    category = Column(String)
    vendor_or_customer = Column(String)
    amount = Column(Float)
    payment_method = Column(String)
    department = Column(String)
    risk_score = Column(Integer, default=10)
    status = Column(String, default="Completed")
    ai_decision = Column(String, nullable=True)
    ai_explanation = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="transactions")

class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    response_json = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    name = Column(String, index=True)
    category = Column(String)
    total_spend = Column(Float, default=0.0)
    txn_count = Column(Integer, default=1)
    avg_invoice = Column(Float, default=0.0)
    risk_score = Column(Integer, default=10)
    renegotiation_candidate = Column(Boolean, default=False)
    duplicate_invoice_count = Column(Integer, default=0)

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    name = Column(String, index=True)
    total_revenue = Column(Float, default=0.0)
    invoice_count = Column(Integer, default=1)
    outstanding_amount = Column(Float, default=0.0)
    avg_payment_delay_days = Column(Integer, default=0)
    risk_score = Column(Integer, default=10)
    late_payment_prob = Column(Float, default=0.0)

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    entity_type = Column(String)
    entity_name = Column(String)
    issue_date = Column(DateTime)
    due_date = Column(DateTime)
    subtotal = Column(Float)
    tax = Column(Float)
    total_amount = Column(Float)
    currency = Column(String, default="INR")
    status = Column(String, default="Pending")
    is_duplicate = Column(Boolean, default=False)
    duplicate_prob = Column(Float, default=0.0)
    duplicate_reason = Column(Text, nullable=True)
    ai_payment_priority = Column(Integer, default=2)
    ai_recommendation = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="invoices")

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    department = Column(String, index=True)
    allocated_amount = Column(Float)
    actual_spent = Column(Float, default=0.0)
    variance = Column(Float, default=0.0)
    utilization_pct = Column(Float, default=0.0)
    status = Column(String, default="ON_BUDGET")
    ai_recommendation = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="budgets")

class RiskAlert(Base):
    __tablename__ = "risk_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    severity = Column(String)
    category = Column(String)
    title = Column(String)
    description = Column(Text)
    impact_amount = Column(Float, default=0.0)
    recommended_action = Column(Text)
    is_resolved = Column(Boolean, default=False)

class MarketAsset(Base):
    __tablename__ = "market_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    asset_type = Column(String)
    price = Column(Float)
    change = Column(Float)
    change_pct = Column(Float)
    volume = Column(String)
    high_52w = Column(Float)
    low_52w = Column(Float)
    sentiment = Column(String)

class FinancialNews(Base):
    __tablename__ = "financial_news"
    
    id = Column(Integer, primary_key=True, index=True)
    headline = Column(String)
    source = Column(String)
    published_at = Column(String)
    sentiment = Column(String)
    impact = Column(String)
    summary = Column(Text)

class AIDecisionLog(Base):
    __tablename__ = "ai_decision_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    module = Column(String)
    decision = Column(String)
    confidence = Column(Integer)
    explanation = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AIToolCallLog(Base):
    __tablename__ = "ai_tool_call_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, index=True)
    tool_name = Column(String)
    parameters = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    user_email = Column(String)
    action = Column(String)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, default="New CFO Conversation")
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, index=True)
    role = Column(String)
    content = Column(Text)
    intent = Column(String, nullable=True)
    confidence = Column(Integer, default=95)
    sources = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    charts = Column(JSON, nullable=True)
    actions = Column(JSON, nullable=True)
    tool_calls = Column(JSON, nullable=True)
    execution_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MessageAttachment(Base):
    __tablename__ = "message_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, index=True)
    filename = Column(String)
    file_type = Column(String)
    file_path = Column(String)

class MessageFeedback(Base):
    __tablename__ = "message_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, index=True)
    rating = Column(String)
    reason = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SecurityMaster(Base):
    __tablename__ = "security_master"
    
    id = Column(Integer, primary_key=True, index=True)
    security_id = Column(String, unique=True, index=True)
    symbol = Column(String, index=True)
    company_name = Column(String, index=True)
    isin = Column(String, nullable=True)
    exchange = Column(String, default="NSE")
    segment = Column(String, default="EQUITY")
    instrument_type = Column(String, default="EQ")
    industry = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    currency = Column(String, default="INR")
    active = Column(Boolean, default=True)
    last_price = Column(Float, default=0.0)
    change_pct = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class StockWatchlist(Base):
    __tablename__ = "stock_watchlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    ticker = Column(String, index=True)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

class Account(Base):
    __tablename__ = "chart_of_accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_code = Column(String, unique=True, index=True)
    account_name = Column(String, index=True)
    account_type = Column(String)  # ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    balance = Column(Float, default=0.0)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1)
    is_active = Column(Boolean, default=True)

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    reference = Column(String, nullable=True) # e.g. TXN-9021, INV-2026-881
    description = Column(String)
    total_debit = Column(Float, default=0.0)
    total_credit = Column(Float, default=0.0)
    status = Column(String, default="POSTED") # POSTED, DRAFT, REVERSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(String, ForeignKey("journal_entries.entry_id"), index=True)
    account_code = Column(String, index=True)
    account_name = Column(String)
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)
    description = Column(String, nullable=True)

class BankStatementTransaction(Base):
    __tablename__ = "bank_statement_transactions"

    id = Column(Integer, primary_key=True, index=True)
    stmt_txn_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String)
    amount = Column(Float) # positive for deposit, negative for withdrawal
    txn_type = Column(String) # DEPOSIT, WITHDRAWAL
    status = Column(String, default="UNMATCHED") # MATCHED, UNMATCHED, REVIEW
    matched_txn_id = Column(String, nullable=True)

class UserProfile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    timezone = Column(String, default="Asia/Kolkata")
    currency = Column(String, default="INR")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # ADMIN, CFO, ACCOUNTANT, AUDITOR, MANAGER, VIEWER, EMPLOYEE
    description = Column(String, nullable=True)

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    module = Column(String)
    action = Column(String)

class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    role = Column(String, default="CFO")
    status = Column(String, default="ACTIVE")
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

class TransactionEvent(Base):
    __tablename__ = "transaction_events"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    event_type = Column(String, index=True) # CREATED, PENDING_APPROVAL, APPROVED, REJECTED, UNDER_REVIEW, COMPLETED
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=True)
    event_metadata = Column(JSON, nullable=True)
    created_by = Column(String, default="System AI")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    horizon_months = Column(Integer, default=12)
    revenue_shock_pct = Column(Float, default=0.0)
    payroll_change_pct = Column(Float, default=0.0)
    opex_change_pct = Column(Float, default=0.0)
    expansion_capex = Column(Float, default=0.0)
    credit_delay_days = Column(Integer, default=0)
    created_by = Column(String, default="AI CFO")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScenarioResult(Base):
    __tablename__ = "scenario_results"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(String, ForeignKey("scenarios.scenario_id"), index=True)
    month = Column(Integer)
    projected_revenue = Column(Float)
    projected_expenses = Column(Float)
    projected_net_income = Column(Float)
    projected_cash_balance = Column(Float)
    projected_runway_months = Column(Float)
    health_score = Column(Integer)
    risk_level = Column(String)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    filename = Column(String)
    file_type = Column(String)
    file_size_bytes = Column(Integer, default=0)
    storage_path = Column(String)
    document_class = Column(String) # INVOICE, CONTRACT, BANK_STATEMENT, ANNUAL_REPORT
    ai_summary = Column(Text, nullable=True)
    extracted_fields = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.document_id"), index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    chunk_index = Column(Integer)
    chunk_text = Column(Text)
    page_number = Column(Integer, default=1)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    report_type = Column(String, index=True) # MONTHLY, QUARTERLY, BOARD, RISK
    title = Column(String)
    period = Column(String)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    sections_json = Column(JSON, nullable=True)
    storage_path = Column(String, nullable=True)

class ReportVersion(Base):
    __tablename__ = "report_versions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.report_id"), index=True)
    version = Column(Integer, default=1)
    changes_summary = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    name = Column(String)
    trigger_event = Column(String)
    action_type = Column(String)
    rule_condition = Column(Text)
    status = Column(String, default="ACTIVE")
    runs_count = Column(Integer, default=0)
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AutomationRun(Base):
    __tablename__ = "automation_runs"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String, ForeignKey("automation_rules.rule_id"), index=True)
    status = Column(String, default="SUCCESS") # SUCCESS, FAILED
    execution_time_ms = Column(Integer, default=0)
    logs = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReconciliationBatch(Base):
    __tablename__ = "reconciliation_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    source_name = Column(String, default="Multi-Source Batch")
    source_type = Column(String, default="ALL")
    record_count = Column(Integer, default=0)
    matched_count = Column(Integer, default=0)
    review_count = Column(Integer, default=0)
    unresolved_count = Column(Integer, default=0)
    exception_count = Column(Integer, default=0)
    match_rate_pct = Column(Float, default=0.0)
    avg_confidence = Column(Float, default=0.0)
    processing_duration_sec = Column(Float, default=0.0)
    throughput_rps = Column(Float, default=0.0)
    deterministic_matches = Column(Integer, default=0)
    ai_assisted_matches = Column(Integer, default=0)
    status = Column(String, default="COMPLETED") # COMPLETED, PROCESSING, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ReconciliationRecord(Base):
    __tablename__ = "reconciliation_records"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, ForeignKey("reconciliation_batches.batch_id"), index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    source_type = Column(String) # BANK, INVOICE, PAYMENT, LEDGER, AR, AP
    source_record_id = Column(String, index=True)
    invoice_id = Column(String, nullable=True, index=True)
    transaction_id = Column(String, nullable=True, index=True)
    vendor_or_customer = Column(String, nullable=True)
    amount = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    transaction_date = Column(DateTime, default=datetime.datetime.utcnow)
    normalized_data = Column(JSON, nullable=True)
    status = Column(String, default="UNRESOLVED") # AUTO_MATCH, HUMAN_REVIEW, LOW_CONFIDENCE, UNRESOLVED, EXCEPTION
    confidence_score = Column(Float, default=0.0)
    decision_method = Column(String, default="EXACT_RULE") # EXACT_RULE, FUZZY_RULE, SEMANTIC_MATCH, AI_ASSISTED, HUMAN_APPROVED, UNRESOLVED
    exception_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ReconciliationCandidate(Base):
    __tablename__ = "reconciliation_candidates"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("reconciliation_records.id"), index=True)
    candidate_record_id = Column(String, index=True)
    score = Column(Float, default=0.0)
    stage = Column(String)
    evidence = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReconciliationMatch(Base):
    __tablename__ = "reconciliation_matches"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String, unique=True, index=True)
    batch_id = Column(String, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    source_record_id = Column(String, index=True)
    target_record_id = Column(String, index=True)
    match_stage = Column(String)
    confidence_score = Column(Float, default=0.0)
    decision_method = Column(String, default="DETERMINISTIC")
    reasoning = Column(Text, nullable=True)
    evidence = Column(JSON, nullable=True)
    status = Column(String, default="MATCHED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReconciliationException(Base):
    __tablename__ = "reconciliation_exceptions"

    id = Column(Integer, primary_key=True, index=True)
    exception_id = Column(String, unique=True, index=True)
    batch_id = Column(String, index=True, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    reconciliation_record_id = Column(String, nullable=True, index=True)
    category = Column(String, index=True) # AMOUNT_MISMATCH, DATE_MISMATCH, VENDOR_MISMATCH, DUPLICATE_TRANSACTION, TAX_MISMATCH, etc.
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text)
    expected_value = Column(String)
    actual_value = Column(String)
    difference_amount = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    recommended_action = Column(Text)
    status = Column(String, default="OPEN") # OPEN, UNDER_REVIEW, RESOLVED, DISMISSED
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReconciliationReview(Base):
    __tablename__ = "reconciliation_reviews"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(String, unique=True, index=True)
    batch_id = Column(String, index=True, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    transaction_id = Column(String, index=True)
    issue = Column(String)
    amount = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    risk_level = Column(String, default="MEDIUM")
    recommended_action = Column(String)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, LINKED, ESCALATED
    action_taken = Column(String, nullable=True)
    reviewer = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReconciliationMetric(Base):
    __tablename__ = "reconciliation_metrics"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    batch_id = Column(String, index=True)
    total_records = Column(Integer, default=0)
    matched_count = Column(Integer, default=0)
    review_count = Column(Integer, default=0)
    unresolved_count = Column(Integer, default=0)
    exception_count = Column(Integer, default=0)
    match_rate = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    processing_duration_sec = Column(Float, default=0.0)
    throughput_rps = Column(Float, default=0.0)
    ai_calls_count = Column(Integer, default=0)
    deterministic_count = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class FinancePolicy(Base):
    __tablename__ = "finance_policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True) # APPROVAL_THRESHOLD, DUPLICATE_PREVENTION, TAX_COMPLIANCE, VENDOR_VERIFICATION, RISK_CAP
    condition_json = Column(JSON, nullable=True)
    threshold = Column(Float, default=0.0)
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    action = Column(String, default="HUMAN_REVIEW") # AUTO_APPROVE, HUMAN_REVIEW, REJECT, ESCALATE_CFO
    required_role = Column(String, default="FINANCE_REVIEWER") # FINANCE_REVIEWER, FINANCE_MANAGER, CFO, ADMIN
    active = Column(Boolean, default=True)
    version = Column(String, default="v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ControlViolation(Base):
    __tablename__ = "control_violations"

    id = Column(Integer, primary_key=True, index=True)
    violation_id = Column(String, unique=True, index=True)
    policy_id = Column(String, ForeignKey("finance_policies.policy_id"), index=True)
    transaction_id = Column(String, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    severity = Column(String, default="MEDIUM")
    evidence_json = Column(JSON, nullable=True)
    recommended_action = Column(Text, nullable=True)
    status = Column(String, default="OPEN") # OPEN, UNDER_REVIEW, RESOLVED, WAIVED
    resolved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FinancialGraphNode(Base):
    __tablename__ = "financial_graph_nodes"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    entity_type = Column(String, index=True) # COMPANY, VENDOR, INVOICE, PAYMENT, BANK_TXN, LEDGER_ENTRY, TAX_RECORD
    label = Column(String)
    properties_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FinancialGraphEdge(Base):
    __tablename__ = "financial_graph_edges"

    id = Column(Integer, primary_key=True, index=True)
    edge_id = Column(String, unique=True, index=True)
    source_node_id = Column(String, ForeignKey("financial_graph_nodes.node_id"), index=True)
    target_node_id = Column(String, ForeignKey("financial_graph_nodes.node_id"), index=True)
    relation_type = Column(String, index=True) # ISSUED_BY, PAID_VIA, SETTLED_WITH, POSTED_TO, TAXED_AS
    confidence = Column(Float, default=1.0)
    properties_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ContinuousCloseRun(Base):
    __tablename__ = "continuous_close_runs"

    id = Column(Integer, primary_key=True, index=True)
    close_id = Column(String, unique=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    period_name = Column(String, default="August 2026")
    readiness_score = Column(Float, default=92.0)
    reconciled_pct = Column(Float, default=98.0)
    open_exceptions_count = Column(Integer, default=7)
    high_risk_count = Column(Integer, default=2)
    unverified_cash = Column(Float, default=180000.0)
    blockers_json = Column(JSON, nullable=True)
    status = Column(String, default="IN_PROGRESS") # READY, IN_PROGRESS, BLOCKED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ControlTowerMetric(Base):
    __tablename__ = "control_tower_metrics"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), default=1, index=True)
    finance_control_score = Column(Float, default=84.0)
    reconciliation_health = Column(Float, default=92.0)
    accounting_integrity = Column(Float, default=96.0)
    cash_visibility = Column(Float, default=81.0)
    tax_consistency = Column(Float, default=89.0)
    vendor_risk = Column(Float, default=74.0)
    exception_load = Column(Float, default=68.0)
    control_compliance = Column(Float, default=88.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AgentActivityLog(Base):
    __tablename__ = "agent_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(String, unique=True, index=True)
    agent_name = Column(String, index=True) # CFO_COORDINATOR, RECONCILIATION_AGENT, CONTROL_AGENT, RISK_AGENT, TAX_AGENT, CASH_AGENT, INVESTIGATION_AGENT
    task_description = Column(Text)
    status = Column(String, default="COMPLETED") # RUNNING, COMPLETED, ESCALATED, FAILED
    tool_calls_count = Column(Integer, default=1)
    latency_ms = Column(Integer, default=120)
    confidence = Column(Float, default=95.0)
    evidence_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)




