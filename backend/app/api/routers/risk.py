from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import RiskAlert

router = APIRouter(prefix="/risk", tags=["Risk Center"])

@router.get("/")
def get_risk_center(db: Session = Depends(get_db)):
    alerts = db.query(RiskAlert).filter(RiskAlert.organization_id == 1).all()
    formatted = [
        {
            "id": a.id,
            "severity": a.severity,
            "category": a.category,
            "title": a.title,
            "description": a.description,
            "impact_amount": a.impact_amount,
            "recommended_action": a.recommended_action,
            "is_resolved": a.is_resolved,
            "created_at": a.created_at.strftime("%Y-%m-%d") if a.created_at else ""
        } for a in alerts
    ]
    
    return {
        "overall_risk_score": 28, # 0-100 (Lower is safer)
        "risk_status": "Low-Medium Risk",
        "risk_categories": [
            {"category": "Transaction & Fraud Risk", "score": 35, "status": "Medium", "alert_count": 1},
            {"category": "Liquidity & Cash Flow Risk", "score": 20, "status": "Low", "alert_count": 0},
            {"category": "Vendor & Payable Risk", "score": 42, "status": "Medium", "alert_count": 1},
            {"category": "Receivable Collection Risk", "score": 68, "status": "High", "alert_count": 1},
            {"category": "Budget Utilization Risk", "score": 50, "status": "Medium", "alert_count": 1}
        ],
        "active_alerts": formatted
    }
