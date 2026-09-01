from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Organization, Wallet, Budget, Transaction, RiskAlert, Vendor, Customer
from app.agents.orchestrator import cfo_orchestrator

router = APIRouter(prefix="/ai", tags=["AI CFO"])

class QueryRequest(BaseModel):
    query: str

@router.post("/ask")
def ask_finpilot_cfo(req: QueryRequest, db: Session = Depends(get_db)):
    # Fetch live financial metrics from database
    org = db.query(Organization).filter(Organization.id == 1).first()
    wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
    
    cash = wallet.available_balance if wallet else (org.current_cash if org else 48200000.0)
    monthly_rev = (org.annual_revenue / 12.0) if org else 15400000.0
    monthly_exp = org.monthly_expenses if org else 11200000.0

    budgets = db.query(Budget).filter(Budget.organization_id == 1).all()
    alerts = db.query(RiskAlert).filter(RiskAlert.organization_id == 1).all()
    txns = db.query(Transaction).filter(Transaction.organization_id == 1).all()
    vendors = db.query(Vendor).filter(Vendor.organization_id == 1).all()
    customers = db.query(Customer).filter(Customer.organization_id == 1).all()

    context_data = {
        "current_cash": cash,
        "monthly_revenue": monthly_rev,
        "monthly_expenses": monthly_exp,
        "budgets_count": len(budgets),
        "alerts_count": len(alerts),
        "txns_count": len(txns),
        "vendors_count": len(vendors),
        "customers_count": len(customers)
    }

    result = cfo_orchestrator.process_query(req.query, context_data=context_data)
    return result

@router.get("/today-actions")
def get_today_finance_actions(db: Session = Depends(get_db)):
    # Fetch alerts & high-risk invoices to build Today's Actions
    alerts = db.query(RiskAlert).filter(RiskAlert.organization_id == 1, RiskAlert.is_resolved == False).all()
    
    actions = []
    for idx, alt in enumerate(alerts):
        actions.append({
            "id": alt.id,
            "priority": alt.severity,
            "badge": "red" if alt.severity == "CRITICAL" else "amber",
            "title": alt.title,
            "reason": alt.description,
            "financial_impact": f"Risk Exposure: ₹{alt.impact_amount:,.2f}",
            "action": alt.recommended_action
        })

    # Default fallback actions if resolved
    if not actions:
        actions = [
            {
                "id": 1,
                "priority": "CRITICAL",
                "badge": "red",
                "title": "Review Suspicious Transaction for Alpha Supplies",
                "reason": "₹4,85,000 payment request is 4.1x higher than historical average and matches previous invoice.",
                "financial_impact": "Prevents ₹4.85L potential duplicate payment.",
                "action": "Review & Hold Payment"
            },
            {
                "id": 2,
                "priority": "HIGH",
                "badge": "amber",
                "title": "Follow up on ₹18L Overdue Receivable from ABC Corp",
                "reason": "72% predicted probability of late payment (11 days expected delay).",
                "financial_impact": "Recovers ₹18.0L working capital buffer.",
                "action": "Send Automated Early-Payment Notice"
            }
        ]

    return {
        "title": "Today's Financial Actions",
        "timestamp": "2026-08-22",
        "actions": actions
    }
