from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Vendor, Customer

router = APIRouter(prefix="/vendors-customers", tags=["Vendors & Customers"])

@router.get("/")
def get_vendors_and_customers(db: Session = Depends(get_db)):
    vendors = db.query(Vendor).filter(Vendor.organization_id == 1).all()
    customers = db.query(Customer).filter(Customer.organization_id == 1).all()

    return {
        "vendors": [
            {
                "id": v.id,
                "name": v.name,
                "category": v.category,
                "total_spend": v.total_spend,
                "txn_count": v.txn_count,
                "avg_invoice": v.avg_invoice,
                "risk_score": v.risk_score,
                "renegotiation_candidate": v.renegotiation_candidate,
                "duplicate_invoice_count": v.duplicate_invoice_count,
                "payment_terms": v.payment_terms
            } for v in vendors
        ],
        "renegotiation_suggestions": [
            {"vendor": "Alpha Supplies Corp", "potential_savings": "₹2.4L", "reason": "4.1x higher invoice variation; candidate for Net-45 renegotiation."},
            {"vendor": "Global Media Ads", "potential_savings": "₹2.1L", "reason": "Low ROI conversion relative to historical customer acquisition cost."}
        ],
        "customers": [
            {
                "id": c.id,
                "name": c.name,
                "total_revenue": c.total_revenue,
                "invoice_count": c.invoice_count,
                "outstanding_amount": c.outstanding_amount,
                "avg_payment_delay_days": c.avg_payment_delay_days,
                "risk_score": c.risk_score,
                "late_payment_prob": c.late_payment_prob
            } for c in customers
        ]
    }
