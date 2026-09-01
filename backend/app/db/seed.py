import datetime
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.db.models import (
    Organization, User, Wallet, BankAccount, Transaction, Vendor, Customer,
    Invoice, Budget, RiskAlert, MarketAsset, FinancialNews, AIDecisionLog, AuditLog
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(Organization).first():
        db.close()
        return

    # 1. Create Organization: NovaTech AI Systems (Flagship Demo Company)
    org_nova = Organization(
        name="NovaTech AI Systems",
        industry="Technology / AI SaaS",
        company_size="50-200 employees",
        annual_revenue=184000000.0, # ₹18.4 Cr
        monthly_expenses=11200000.0, # ₹1.12 Cr
        current_cash=48200000.0,     # ₹4.82 Cr
        employee_count=68,
        avg_monthly_payroll=6400000.0, # ₹64L
        primary_currency="INR",
        country="India",
        financial_year="FY2025-26",
        min_cash_reserve=25000000.0, # ₹2.5 Cr
        preferred_runway_months=6.0,
        approval_threshold=500000.0  # ₹5 Lakhs
    )
    
    # Seed Secondary Demo Companies
    org_greencart = Organization(name="GreenCart E-Commerce", industry="E-Commerce", annual_revenue=95000000.0, current_cash=21000000.0)
    org_medicore = Organization(name="MediCore Healthcare", industry="Healthcare", annual_revenue=310000000.0, current_cash=75000000.0)
    org_urbanbite = Organization(name="UrbanBite FoodTech", industry="Food-Tech", annual_revenue=42000000.0, current_cash=8400000.0)
    
    db.add_all([org_nova, org_greencart, org_medicore, org_urbanbite])
    db.commit()
    db.refresh(org_nova)
    
    # 2. Seed Admin / CFO User
    cfo_user = User(
        email="cfo@novatech.ai",
        hashed_password="pbkdf2:sha256:fakehashedpasswordforhackathon",
        full_name="Sarah Jenkins",
        role="CFO",
        organization_id=org_nova.id
    )
    admin_user = User(
        email="admin@novatech.ai",
        hashed_password="pbkdf2:sha256:fakehashedpasswordforhackathon",
        full_name="Alex Rivera",
        role="ADMIN",
        organization_id=org_nova.id
    )
    db.add_all([cfo_user, admin_user])
    
    # 3. Seed Wallet & Bank Accounts
    wallet = Wallet(
        organization_id=org_nova.id,
        available_balance=48254300.0, # ₹4.82 Cr
        pending_balance=6421000.0,    # ₹64.2L
        reserved_cash=8000000.0,      # ₹80L
        total_receivables=12400000.0, # ₹1.24 Cr
        total_payables=7800000.0      # ₹78L
    )
    db.add(wallet)
    
    bank1 = BankAccount(organization_id=org_nova.id, bank_name="HDFC Bank Commercial", account_number="50200018892341", account_type="Checking", balance=35250000.0, is_primary=True)
    bank2 = BankAccount(organization_id=org_nova.id, bank_name="ICICI Corporate Reserve", account_number="00040501198234", account_type="Reserve", balance=13004300.0, is_primary=False)
    db.add_all([bank1, bank2])
    
    # 4. Seed Department Budgets
    budgets = [
        Budget(organization_id=org_nova.id, department="Engineering", allocated_amount=4500000.0, actual_spent=4420000.0, variance=-80000.0, utilization_pct=98.2, status="ON_BUDGET"),
        Budget(organization_id=org_nova.id, department="Marketing", allocated_amount=2000000.0, actual_spent=2380000.0, variance=380000.0, utilization_pct=119.0, status="OVER_BUDGET", ai_recommendation="Marketing exceeded monthly budget by 19% due to ad campaign spikes. Reduce discretionary advertising by 8% or reallocate ₹2L from unused events."),
        Budget(organization_id=org_nova.id, department="Sales", allocated_amount=1800000.0, actual_spent=1650000.0, variance=-150000.0, utilization_pct=91.6, status="ON_BUDGET"),
        Budget(organization_id=org_nova.id, department="Operations", allocated_amount=1500000.0, actual_spent=1480000.0, variance=-20000.0, utilization_pct=98.6, status="ON_BUDGET"),
        Budget(organization_id=org_nova.id, department="HR & Admin", allocated_amount=1400000.0, actual_spent=1270000.0, variance=-130000.0, utilization_pct=90.7, status="ON_BUDGET")
    ]
    db.add_all(budgets)
    
    # 5. Seed Vendors & Customers
    v1 = Vendor(organization_id=org_nova.id, name="Alpha Supplies Corp", category="Hardware & Office", total_spend=1850000.0, txn_count=6, avg_invoice=308333.0, risk_score=82, renegotiation_candidate=True, duplicate_invoice_count=1)
    v2 = Vendor(organization_id=org_nova.id, name="AWS Cloud Services", category="SaaS & Cloud", total_spend=3420000.0, txn_count=12, avg_invoice=285000.0, risk_score=25)
    v3 = Vendor(organization_id=org_nova.id, name="Global Media Ads", category="Marketing", total_spend=2380000.0, txn_count=4, avg_invoice=595000.0, risk_score=65, renegotiation_candidate=True)
    v4 = Vendor(organization_id=org_nova.id, name="Apex Legal Advisory", category="Legal", total_spend=850000.0, txn_count=3, avg_invoice=283333.0, risk_score=15)
    db.add_all([v1, v2, v3, v4])
    
    c1 = Customer(organization_id=org_nova.id, name="ABC Corp Enterprise", total_revenue=24000000.0, invoice_count=8, outstanding_amount=1800000.0, avg_payment_delay_days=11, risk_score=72, late_payment_prob=0.72)
    c2 = Customer(organization_id=org_nova.id, name="FinTech Global Inc", total_revenue=48000000.0, invoice_count=12, outstanding_amount=0.0, avg_payment_delay_days=2, risk_score=10, late_payment_prob=0.05)
    c3 = Customer(organization_id=org_nova.id, name="Nexus Cloud Systems", total_revenue=16500000.0, invoice_count=5, outstanding_amount=4200000.0, avg_payment_delay_days=4, risk_score=20, late_payment_prob=0.15)
    db.add_all([c1, c2, c3])
    
    # 6. Seed Invoices (with Intentional Duplicate & Overdue Anomaly)
    today = datetime.datetime.utcnow()
    invoices = [
        Invoice(
            invoice_number="INV-2026-881", organization_id=org_nova.id, entity_type="PAYABLE", entity_name="Alpha Supplies Corp",
            issue_date=today - datetime.timedelta(days=10), due_date=today + datetime.timedelta(days=5),
            subtotal=411016.0, tax=73984.0, total_amount=485000.0, status="Flagged",
            is_duplicate=True, duplicate_prob=0.91, duplicate_reason="4.1x higher than normal vendor baseline; duplicate invoice number detected in system.",
            ai_payment_priority=1, ai_recommendation="Send for executive finance review before approval."
        ),
        Invoice(
            invoice_number="INV-2026-880", organization_id=org_nova.id, entity_type="PAYABLE", entity_name="Alpha Supplies Corp",
            issue_date=today - datetime.timedelta(days=12), due_date=today - datetime.timedelta(days=2),
            subtotal=411016.0, tax=73984.0, total_amount=485000.0, status="Pending",
            is_duplicate=False, duplicate_prob=0.0, ai_payment_priority=2
        ),
        Invoice(
            invoice_number="INV-REC-904", organization_id=org_nova.id, entity_type="RECEIVABLE", entity_name="ABC Corp Enterprise",
            issue_date=today - datetime.timedelta(days=25), due_date=today + datetime.timedelta(days=14),
            subtotal=1525423.0, tax=274577.0, total_amount=1800000.0, status="Pending",
            ai_payment_priority=1, ai_recommendation="72% probability of late payment. Expected delay: 11 days. Initiate immediate collection follow-up."
        )
    ]
    db.add_all(invoices)
    
    # 7. Seed Key Transactions (including Anomalies)
    txns = [
        Transaction(txn_id="TXN-9021", organization_id=org_nova.id, date=today - datetime.timedelta(days=1), description="Alpha Supplies Payment Request", txn_type="OUTFLOW", category="Office Hardware", vendor_or_customer="Alpha Supplies Corp", amount=485000.0, payment_method="Corporate Card", department="Administration", risk_score=82, status="Flagged", ai_decision="Flagged for Review", ai_explanation="4.1x higher than normal vendor amount. Vendor recently added, unusual transaction timing."),
        Transaction(txn_id="TXN-9020", organization_id=org_nova.id, date=today - datetime.timedelta(days=2), description="AWS Cloud Infrastructure Monthly", txn_type="OUTFLOW", category="SaaS & Cloud", vendor_or_customer="AWS Cloud Services", amount=284000.0, payment_method="Bank Transfer", department="Engineering", risk_score=45, status="Completed", ai_decision="Auto-approved", ai_explanation="Engineering cloud spending increased 38% this month due to model training."),
        Transaction(txn_id="TXN-9019", organization_id=org_nova.id, date=today - datetime.timedelta(days=3), description="Global Media Ad Campaign Peak", txn_type="OUTFLOW", category="Marketing", vendor_or_customer="Global Media Ads", amount=850000.0, payment_method="Bank Transfer", department="Marketing", risk_score=68, status="Completed", ai_decision="Under Review", ai_explanation="Marketing exceeded monthly budget allocation by 19%."),
        Transaction(txn_id="TXN-9018", organization_id=org_nova.id, date=today - datetime.timedelta(days=4), description="Monthly Enterprise SaaS Revenue", txn_type="INFLOW", category="Revenue", vendor_or_customer="FinTech Global Inc", amount=2840000.0, payment_method="ACH", department="Sales", risk_score=5, status="Completed", ai_decision="Verified Inflow", ai_explanation="Revenue increased primarily due to enterprise tier renewals."),
        Transaction(txn_id="TXN-9017", organization_id=org_nova.id, date=today - datetime.timedelta(days=5), description="Engineering Monthly Payroll", txn_type="OUTFLOW", category="Payroll", vendor_or_customer="Staff Direct", amount=6400000.0, payment_method="Bank Transfer", department="HR & Admin", risk_score=10, status="Completed", ai_decision="Auto-approved", ai_explanation="Standard scheduled monthly payroll execution.")
    ]
    db.add_all(txns)
    
    # 8. Seed Risk Alerts
    alerts = [
        RiskAlert(organization_id=org_nova.id, severity="CRITICAL", category="Duplicate Invoice", title="Duplicate Invoice Flagged", description="Invoice #INV-2026-881 for ₹4,85,000 matches previous invoice #INV-2026-880.", impact_amount=485000.0, recommended_action="Hold payment and verify PO contract with Alpha Supplies Corp."),
        RiskAlert(organization_id=org_nova.id, severity="WARNING", category="Budget Overrun", title="Marketing Department Over Budget", description="Marketing spent ₹23.8L against allocated budget of ₹20.0L (119% utilization).", impact_amount=380000.0, recommended_action="Reallocate ₹2L from unused events or pause low-converting social ad campaigns."),
        RiskAlert(organization_id=org_nova.id, severity="WARNING", category="Receivable Delay Risk", title="High Delayed Payment Risk for ABC Corp", description="₹18.0L receivable from ABC Corp has a 72% predicted probability of late payment.", impact_amount=1800000.0, recommended_action="Initiate automated collection reminder and offer early payment discount.")
    ]
    db.add_all(alerts)
    
    # 9. Seed Market Assets & Financial News
    assets = [
        MarketAsset(symbol="NIFTY50", name="NIFTY 50 Index", asset_type="INDEX", price=24850.40, change=145.20, change_pct=0.59, volume="2.4M", high_52w=25078.0, low_52w=19200.0, sentiment="BULLISH"),
        MarketAsset(symbol="USDT/INR", name="USD / INR Exchange Rate", asset_type="CURRENCY", price=83.92, change=-0.08, change_pct=-0.10, volume="18.5B", high_52w=84.20, low_52w=82.10, sentiment="NEUTRAL"),
        MarketAsset(symbol="BRENT", name="Brent Crude Oil", asset_type="COMMODITY", price=78.45, change=1.85, change_pct=2.41, volume="450K", high_52w=95.0, low_52w=70.2, sentiment="BEARISH")
    ]
    db.add_all(assets)
    
    news = [
        FinancialNews(
            headline="Global SaaS & Tech Server Infrastructure Costs Surge 18% Amid AI Demand",
            publisher="Financial Times", timestamp="2 hours ago", category="Technology",
            impact_level="HIGH", sentiment="NEGATIVE",
            ai_summary="Surging GPU demand has led major cloud providers to adjust tiered compute pricing globally.",
            potential_impact="Engineering cloud opex expected to increase by 8-12% over next quarter.",
            finpilot_action="Review cloud compute commitments and run cloud cost optimization scan."
        ),
        FinancialNews(
            headline="RBI Maintains Policy Repo Rate at 6.5%; Forecasts Steady 7% GDP Growth",
            publisher="Economic Times", timestamp="5 hours ago", category="Economy",
            impact_level="MEDIUM", sentiment="POSITIVE",
            ai_summary="Central bank maintains monetary policy stability, supporting corporate credit access.",
            potential_impact="Working capital borrowing costs remain stable.",
            finpilot_action="No immediate debt restructuring required."
        )
    ]
    db.add_all(news)
    
    db.commit()
    db.close()
    print("Successfully seeded FinPilot AI database with NovaTech AI Systems demo state!")

if __name__ == "__main__":
    seed_database()
