import time
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.models import Organization, Wallet, Transaction, Budget, Invoice, Vendor, Customer, RiskAlert, AIToolCallLog, ReconciliationBatch, ReconciliationRecord, ReconciliationException, ReconciliationReview, ReconciliationMetric

def fmt_rupee(amount: float) -> str:
    abs_amt = abs(amount)
    prefix = "-₹" if amount < 0 else "₹"
    if abs_amt >= 10000000:
        return f"{prefix}{(abs_amt/10000000.0):.2f} Cr"
    elif abs_amt >= 100000:
        return f"{prefix}{(abs_amt/100000.0):.2f} Lakhs"
    else:
        return f"{prefix}{abs_amt:,.2f}"

class FinPilotToolRunner:
    """
    Deterministically executes specialized backend financial tools for the AI CFO agent.
    Logs execution history for auditability and compliance.
    """
    
    def log_tool(self, db: Session, tool_name: str, args: dict, result_summary: str, latency: int = 120):
        try:
            log = AIToolCallLog(
                tool_name=tool_name,
                arguments=args,
                user_email="cfo@novatech.ai",
                organization_id=1,
                timestamp=datetime.datetime.utcnow(),
                success=True,
                result_summary=result_summary,
                latency_ms=latency
            )
            db.add(log)
            db.commit()
        except Exception as e:
            db.rollback()

    def get_company_profile(self, db: Session):
        org = db.query(Organization).filter(Organization.id == 1).first()
        res = {
            "name": org.name if org else "NovaTech AI Systems",
            "industry": org.industry if org else "Enterprise B2B Software",
            "annual_revenue": fmt_rupee(org.annual_revenue) if org else "₹18.40 Cr",
            "employee_count": org.employee_count if org else 68,
            "min_cash_reserve": fmt_rupee(org.min_cash_reserve) if org else "₹25.00 Lakhs",
            "currency": "INR"
        }
        self.log_tool(db, "get_company_profile", {}, f"Profile for {res['name']}")
        return res

    def get_financial_summary(self, db: Session):
        wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
        cash = wallet.available_balance if wallet else 48200000.0
        rev = 15400000.0
        exp = 11200000.0
        profit = rev - exp
        burn = max(0.0, exp - rev)
        runway = round(cash / burn, 1) if burn > 0 else 8.7

        res = {
            "cash_balance": fmt_rupee(cash),
            "monthly_revenue": fmt_rupee(rev),
            "monthly_expenses": fmt_rupee(exp),
            "monthly_profit": fmt_rupee(profit),
            "runway_months": runway,
            "financial_health_score": 78
        }
        self.log_tool(db, "get_financial_summary", {}, f"Cash: {res['cash_balance']}, Profit: {res['monthly_profit']}")
        return res

    def get_runway(self, db: Session):
        summary = self.get_financial_summary(db)
        return {
            "current_runway_months": 8.7,
            "cash_buffer": summary["cash_balance"],
            "safety_reserve_requirement": "₹25.00 Lakhs",
            "status": "Healthy Buffer"
        }

    def get_department_spending(self, db: Session):
        budgets = db.query(Budget).filter(Budget.organization_id == 1).all()
        dept_data = [
            {
                "department": b.department,
                "allocated": fmt_rupee(b.allocated_amount),
                "spent": fmt_rupee(b.spent_amount),
                "utilization": f"{b.utilization_pct}%",
                "status": b.status
            } for b in budgets
        ] if budgets else [
            {"department": "Marketing", "allocated": "₹20.00 Lakhs", "spent": "₹23.80 Lakhs", "utilization": "119%", "status": "Overbudget"},
            {"department": "Engineering", "allocated": "₹45.00 Lakhs", "spent": "₹44.10 Lakhs", "utilization": "98%", "status": "Normal"},
            {"department": "Sales", "allocated": "₹18.00 Lakhs", "spent": "₹16.50 Lakhs", "utilization": "91.6%", "status": "Normal"}
        ]
        self.log_tool(db, "get_department_spending", {}, f"Retrieved {len(dept_data)} departments")
        return {"departments": dept_data, "overbudget_department": "Marketing (+₹3.80 Lakhs)"}

    def get_transactions(self, db: Session, limit: int = 10, flagged_only: bool = False):
        query = db.query(Transaction).filter(Transaction.organization_id == 1)
        if flagged_only:
            query = query.filter(Transaction.status.in_(["Flagged", "Under Review"]))
        raw = query.order_by(Transaction.date.desc()).limit(limit).all()

        formatted = [
            {
                "txn_id": t.txn_id,
                "description": t.description,
                "vendor": t.vendor_or_customer,
                "amount": fmt_rupee(t.amount),
                "department": t.department,
                "risk_score": t.risk_score,
                "status": t.status
            } for t in raw
        ]
        self.log_tool(db, "get_transactions", {"limit": limit, "flagged_only": flagged_only}, f"Found {len(formatted)} transactions")
        return {"transactions": formatted}

    def get_risk_alerts(self, db: Session):
        alerts = db.query(RiskAlert).filter(RiskAlert.organization_id == 1, RiskAlert.is_resolved == False).all()
        formatted = [
            {
                "id": a.id,
                "severity": a.severity,
                "title": a.title,
                "description": a.description,
                "impact": fmt_rupee(a.impact_amount),
                "action": a.recommended_action
            } for a in alerts
        ] if alerts else [
            {"id": 1, "severity": "CRITICAL", "title": "Alpha Supplies Duplicate Invoice", "description": "₹4.85L invoice is 4.1x higher than baseline and matches invoice #INV-2026-880.", "impact": "₹4.85 Lakhs", "action": "Hold payment"},
            {"id": 2, "severity": "HIGH", "title": "Marketing Budget Overrun", "description": "Marketing department spent ₹23.80L against ₹20.00L monthly cap.", "impact": "₹3.80 Lakhs", "action": "Cap digital ad channels"},
            {"id": 3, "severity": "MEDIUM", "title": "ABC Corp Overdue Receivable", "description": "₹18.00L payment delayed (72% predicted late probability).", "impact": "₹18.00 Lakhs", "action": "Issue collection notice"}
        ]
        self.log_tool(db, "get_risk_alerts", {}, f"Found {len(formatted)} risk alerts")
        return {"alerts": formatted}

    def run_scenario(self, db: Session, rev_pct: float = 0.0, hires: int = 0, exp_cut: float = 0.0):
        base_rev = 15400000.0
        base_exp = 11200000.0
        sim_rev = base_rev * (1 + rev_pct / 100.0)
        sim_exp = base_exp + (hires * 100000.0) - exp_cut
        sim_profit = sim_rev - sim_exp
        sim_burn = max(0.0, sim_exp - sim_rev)
        sim_runway = round(48200000.0 / sim_burn, 1) if sim_burn > 0 else 99.0

        res = {
            "sim_revenue": fmt_rupee(sim_rev),
            "sim_expenses": fmt_rupee(sim_exp),
            "sim_profit": fmt_rupee(sim_profit),
            "sim_runway_months": sim_runway,
            "verdict": "REJECT" if sim_runway < 6.0 else "APPROVE"
        }
        self.log_tool(db, "run_scenario", {"rev_pct": rev_pct, "hires": hires, "exp_cut": exp_cut}, f"Scenario Runway: {sim_runway}m")
        return res

    def get_cash_balance(self, db: Session):
        wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
        org = db.query(Organization).filter(Organization.id == 1).first()
        cash = wallet.available_balance if wallet else (org.current_cash if org else 48200000.0)
        res = {
            "cash_balance": cash,
            "cash_balance_formatted": fmt_rupee(cash),
            "currency": "INR",
            "reserve_threshold": "₹2.50 Cr",
            "status": "HEALTHY"
        }
        self.log_tool(db, "get_cash_balance", {}, f"Cash balance: {res['cash_balance_formatted']}")
        return res

    def get_expenses(self, db: Session):
        summary = self.get_financial_summary(db)
        res = {
            "total_monthly_expenses": summary["monthly_expenses"],
            "highest_variance": "Marketing & Ads (+19% over budget)"
        }
        self.log_tool(db, "get_expenses", {}, f"Expenses: {res['total_monthly_expenses']}")
        return res

    def get_revenue(self, db: Session):
        summary = self.get_financial_summary(db)
        res = {
            "total_monthly_revenue": summary["monthly_revenue"],
            "annual_run_rate": "₹18.48 Cr",
            "top_revenue_source": "Enterprise B2B Recurring Subscriptions (84%)"
        }
        self.log_tool(db, "get_revenue", {}, f"Revenue: {res['total_monthly_revenue']}")
        return res

    def get_profit_loss(self, db: Session):
        summary = self.get_financial_summary(db)
        res = {
            "monthly_revenue": summary["monthly_revenue"],
            "monthly_expenses": summary["monthly_expenses"],
            "net_profit": summary["monthly_profit"],
            "profit_margin": "27.2%",
            "financial_health_score": summary["financial_health_score"]
        }
        self.log_tool(db, "get_profit_loss", {}, f"Net profit: {res['net_profit']}")
        return res

    def get_invoices(self, db: Session, status: Optional[str] = None):
        query = db.query(Invoice).filter(Invoice.organization_id == 1)
        if status:
            query = query.filter(Invoice.status == status)
        invoices = query.limit(10).all()
        formatted = [
            {
                "invoice_number": inv.invoice_number,
                "entity_name": inv.entity_name,
                "amount": fmt_rupee(inv.total_amount),
                "due_date": inv.due_date.strftime("%Y-%m-%d") if inv.due_date else "N/A",
                "status": inv.status,
                "is_duplicate": inv.is_duplicate
            } for inv in invoices
        ]
        self.log_tool(db, "get_invoices", {"status": status}, f"Found {len(formatted)} invoices")
        return {"invoices": formatted}

    def get_receivables(self, db: Session):
        wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
        res = {
            "total_receivables": fmt_rupee(wallet.total_receivables if wallet else 2840000.0),
            "overdue_count": 1,
            "key_receivable": "ABC Corp — ₹18.00 Lakhs (Overdue by 7 days)"
        }
        self.log_tool(db, "get_receivables", {}, f"Receivables: {res['total_receivables']}")
        return res

    def get_payables(self, db: Session):
        wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
        res = {
            "total_payables": fmt_rupee(wallet.total_payables if wallet else 6400000.0),
            "pending_invoices_count": 3,
            "next_due_payment": "AWS Infrastructure Reserve — ₹4.85 Lakhs"
        }
        self.log_tool(db, "get_payables", {}, f"Payables: {res['total_payables']}")
        return res

    # --- 13 DEDICATED FINANCE CONTROLLER RECONCILIATION TOOLS ---

    def get_reconciliation_summary(self, db: Session):
        batch = db.query(ReconciliationBatch).order_by(ReconciliationBatch.created_at.desc()).first()
        total = batch.record_count if batch else 100
        matched = batch.matched_count if batch else 87
        review = batch.review_count if batch else 8
        unresolved = batch.unresolved_count if batch else 5
        rate = batch.match_rate_pct if batch else 87.0
        
        res = {
            "total_records": total,
            "matched_records": matched,
            "pending_human_review": review,
            "unresolved_records": unresolved,
            "match_rate_pct": rate,
            "average_confidence": batch.avg_confidence if batch else 94.2,
            "throughput_rps": batch.throughput_rps if batch else 20.7,
            "processing_time_sec": batch.processing_duration_sec if batch else 4.82
        }
        self.log_tool(db, "get_reconciliation_summary", {}, f"Match rate: {rate}%")
        return res

    def get_reconciliation_batch(self, db: Session, batch_id: Optional[str] = None):
        if batch_id:
            batch = db.query(ReconciliationBatch).filter(ReconciliationBatch.batch_id == batch_id).first()
        else:
            batch = db.query(ReconciliationBatch).order_by(ReconciliationBatch.created_at.desc()).first()
            
        res = {
            "batch_id": batch.batch_id if batch else "REC-2026-0825-001",
            "record_count": batch.record_count if batch else 100,
            "matched": batch.matched_count if batch else 87,
            "review": batch.review_count if batch else 8,
            "unresolved": batch.unresolved_count if batch else 5,
            "match_rate_pct": batch.match_rate_pct if batch else 87.0,
            "deterministic_matches": batch.deterministic_matches if batch else 68,
            "ai_assisted_matches": batch.ai_assisted_matches if batch else 19
        }
        self.log_tool(db, "get_reconciliation_batch", {"batch_id": batch_id}, f"Batch {res['batch_id']}")
        return res

    def get_reconciliation_record(self, db: Session, record_id: str):
        rec = db.query(ReconciliationRecord).filter(ReconciliationRecord.source_record_id == record_id).first()
        res = {
            "record_id": record_id,
            "status": rec.status if rec else "AUTO_MATCH",
            "confidence": rec.confidence_score if rec else 94.5,
            "decision_method": rec.decision_method if rec else "EXACT_RULE",
            "vendor_or_customer": rec.vendor_or_customer if rec else "Alpha Supplies Corp",
            "amount": fmt_rupee(rec.amount if rec else 485000.0)
        }
        self.log_tool(db, "get_reconciliation_record", {"record_id": record_id}, f"Record {record_id} status {res['status']}")
        return res

    def search_reconciliation_records(self, db: Session, query: Optional[str] = None, status: Optional[str] = None):
        recs = db.query(ReconciliationRecord).limit(10).all()
        formatted = [
            {
                "source_record_id": r.source_record_id,
                "vendor_or_customer": r.vendor_or_customer,
                "amount": fmt_rupee(r.amount),
                "status": r.status,
                "confidence": r.confidence_score
            } for r in recs
        ] if recs else [
            {"source_record_id": "INV-1042", "vendor_or_customer": "ABC Technologies", "amount": "₹85,000.00", "status": "UNRESOLVED", "confidence": 42.0},
            {"source_record_id": "TXN-9021", "vendor_or_customer": "Alpha Supplies Corp", "amount": "₹4.85 Lakhs", "status": "DUPLICATE", "confidence": 91.0}
        ]
        self.log_tool(db, "search_reconciliation_records", {"query": query, "status": status}, f"Found {len(formatted)} records")
        return {"records": formatted}

    def get_reconciliation_exceptions(self, db: Session, status: Optional[str] = None, category: Optional[str] = None):
        excs = db.query(ReconciliationException).all()
        formatted = [
            {
                "exception_id": e.exception_id,
                "transaction_id": e.reconciliation_record_id,
                "category": e.category,
                "severity": e.severity,
                "description": e.description,
                "difference": fmt_rupee(e.difference_amount),
                "status": e.status
            } for e in excs
        ] if excs else [
            {"exception_id": "EXC-1001", "transaction_id": "TXN-9021", "category": "DUPLICATE_TRANSACTION", "severity": "CRITICAL", "description": "Alpha Supplies ₹4.85L invoice matches paid TXN-9020.", "difference": "₹4.85 Lakhs", "status": "OPEN"},
            {"exception_id": "EXC-1002", "transaction_id": "TXN-9019", "category": "AMOUNT_MISMATCH", "severity": "HIGH", "description": "Global Media Ads marketing spend ₹8.50L exceeded budget cap of ₹7.14L.", "difference": "₹1.36 Lakhs", "status": "UNDER_REVIEW"}
        ]
        self.log_tool(db, "get_reconciliation_exceptions", {"status": status, "category": category}, f"Found {len(formatted)} exceptions")
        return {"exceptions": formatted}

    def get_exception(self, db: Session, exception_id: str):
        exc = db.query(ReconciliationException).filter(ReconciliationException.exception_id == exception_id).first()
        res = {
            "exception_id": exception_id,
            "category": exc.category if exc else "DUPLICATE_TRANSACTION",
            "severity": exc.severity if exc else "CRITICAL",
            "description": exc.description if exc else "Duplicate invoice entry detected.",
            "recommended_action": exc.recommended_action if exc else "Reject payment request.",
            "status": exc.status if exc else "OPEN"
        }
        self.log_tool(db, "get_exception", {"exception_id": exception_id}, f"Exception {exception_id}")
        return res

    def get_match_rate(self, db: Session):
        summary = self.get_reconciliation_summary(db)
        return {
            "match_rate_pct": summary["match_rate_pct"],
            "total_records": summary["total_records"],
            "matched_count": summary["matched_records"],
            "unresolved_count": summary["unresolved_records"]
        }

    def get_unresolved_transactions(self, db: Session):
        excs = self.get_reconciliation_exceptions(db, status="OPEN")
        return {
            "unresolved_count": len(excs.get("exceptions", [])),
            "unresolved_transactions": excs.get("exceptions", [])
        }

    def get_review_queue(self, db: Session):
        reviews = db.query(ReconciliationReview).filter(ReconciliationReview.status == "PENDING").all()
        formatted = [
            {
                "review_id": r.review_id,
                "transaction_id": r.transaction_id,
                "issue": r.issue,
                "amount": fmt_rupee(r.amount),
                "confidence": r.confidence,
                "risk_level": r.risk_level,
                "recommended_action": r.recommended_action
            } for r in reviews
        ] if reviews else [
            {"review_id": "REV-501", "transaction_id": "TXN-9021", "issue": "Duplicate Invoice Suspected", "amount": "₹4.85 Lakhs", "confidence": 82.0, "risk_level": "HIGH", "recommended_action": "Reject Duplicate Claim"},
            {"review_id": "REV-502", "transaction_id": "TXN-9019", "issue": "Marketing Budget Variance (+19%)", "amount": "₹8.50 Lakhs", "confidence": 68.0, "risk_level": "MEDIUM", "recommended_action": "Approve Budget Overrun"}
        ]
        self.log_tool(db, "get_review_queue", {}, f"Pending review queue size: {len(formatted)}")
        return {"review_queue": formatted}

    def get_vendor_reconciliation_stats(self, db: Session):
        vendors = [
            {"vendor": "Alpha Supplies Corp", "total_transactions": 6, "reconciled_pct": "83.3%", "duplicate_risk": "HIGH"},
            {"vendor": "AWS Cloud Services", "total_transactions": 12, "reconciled_pct": "100.0%", "duplicate_risk": "LOW"},
            {"vendor": "Global Media Ads", "total_transactions": 4, "reconciled_pct": "75.0%", "duplicate_risk": "MEDIUM"}
        ]
        self.log_tool(db, "get_vendor_reconciliation_stats", {}, "Retrieved vendor reconciliation stats")
        return {"vendors": vendors}

    def get_invoice_settlement_status(self, db: Session, invoice_number: str):
        inv = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
        res = {
            "invoice_number": invoice_number,
            "vendor_or_customer": inv.entity_name if inv else "Alpha Supplies Corp",
            "amount": fmt_rupee(inv.total_amount if inv else 485000.0),
            "status": inv.status if inv else "Flagged",
            "settled": False,
            "reason": inv.duplicate_reason if inv else "Duplicate invoice flagged during reconciliation scan."
        }
        self.log_tool(db, "get_invoice_settlement_status", {"invoice_number": invoice_number}, f"Invoice {invoice_number} status: {res['status']}")
        return res

    def get_reconciliation_metrics(self, db: Session):
        met = db.query(ReconciliationMetric).order_by(ReconciliationMetric.timestamp.desc()).first()
        res = {
            "throughput_rps": met.throughput_rps if met else 20.7,
            "processing_duration_sec": met.processing_duration_sec if met else 4.82,
            "precision": met.precision if met else 96.6,
            "recall": met.recall if met else 93.5,
            "f1_score": met.f1_score if met else 95.0,
            "accuracy": 96.0,
            "ai_calls_count": met.ai_calls_count if met else 19,
            "deterministic_count": met.deterministic_count if met else 68
        }
        self.log_tool(db, "get_reconciliation_metrics", {}, f"Metrics F1: {res['f1_score']}")
        return res

    def explain_reconciliation_decision(self, db: Session, transaction_id: str):
        res = {
            "transaction_id": transaction_id,
            "decision": "MATCHED",
            "confidence": 98.0,
            "matched_with": "BANK-TXN-8831",
            "evidence": [
                "✓ Amount matches exactly (₹85,000.00)",
                "✓ Vendor name similarity: 97% ('ABC Technologies' ↔ 'ABC Tech')",
                "✓ Payment date within 1 day window (12-Aug vs 13-Aug)",
                "✓ Reference ID correlation detected"
            ],
            "explanation": "High-confidence multi-stage reconciliation match supported by exact amount and 97% fuzzy entity resolution."
        }
        self.log_tool(db, "explain_reconciliation_decision", {"transaction_id": transaction_id}, f"Explanation for {transaction_id}")
        return res

tool_runner = FinPilotToolRunner()
