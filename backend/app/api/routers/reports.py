from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/reports", tags=["Reports"])

class ReportRequest(BaseModel):
    report_type: str = "Monthly CFO Report" # Monthly CFO Report, Board Deck, Risk Summary, Audit Log

@router.post("/generate")
def generate_report(req: ReportRequest):
    return {
        "report_title": f"FinPilot AI — {req.report_type}",
        "organization": "NovaTech AI Systems",
        "generated_at": "2026-08-22",
        "executive_summary": "NovaTech AI Systems completed the period in a healthy financial posture (Health Score 78/100) with ₹4.82 Cr cash buffer (8.7 months runway). Three priority risk items were identified and mitigated.",
        "kpis": {
            "monthly_revenue": "₹1.54 Cr (+12.4%)",
            "monthly_expenses": "₹1.12 Cr (+8.2%)",
            "net_profit": "₹42.0 Lakhs (+18.5%)",
            "cash_runway": "8.7 Months",
            "health_score": "78 / 100"
        },
        "key_anomalies": [
            "Flagged 1 duplicate invoice of ₹4.85L for Alpha Supplies Corp",
            "Identified Marketing overspend of ₹3.8L (119% budget utilization)",
            "Tracked ₹18L receivable delay for ABC Corp Enterprise"
        ],
        "strategic_recommendations": [
            "Enforce marketing budget cap and reallocate unused events budget.",
            "Offer early payment discount to ABC Corp to accelerate ₹18L collection.",
            "Consolidate SaaS subscription seats to capture ₹2.4L monthly opex savings."
        ],
        "pdf_download_url": "#simulated_report_pdf"
    }
