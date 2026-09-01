from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Organization, Transaction, Budget, RiskAlert
from app.engine.health_score import calculate_financial_health_score

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == 1).first()
    if not org:
        cash = 48200000.0
        monthly_rev = 15400000.0
        monthly_exp = 11200000.0
        org_name = "NovaTech AI Systems"
    else:
        cash = org.current_cash
        monthly_rev = org.annual_revenue / 12.0
        monthly_exp = org.monthly_expenses
        org_name = org.name

    net_profit = monthly_rev - monthly_exp
    burn_rate = max(0.0, monthly_exp - monthly_rev)
    runway = round(cash / burn_rate, 1) if burn_rate > 0 else 99.0

    health = calculate_financial_health_score(cash, monthly_rev, monthly_exp, 98.0, 14.5, 5.2, 3)

    return {
        "organization": {
            "name": org_name,
            "currency": "INR",
            "currency_symbol": "₹"
        },
        "metrics": {
            "revenue": {
                "current": monthly_rev,
                "formatted": "₹1.54 Cr",
                "change_pct": 12.4,
                "trend": "up",
                "ai_explanation": "Revenue increased primarily because of higher enterprise subscriptions."
            },
            "expenses": {
                "current": monthly_exp,
                "formatted": "₹1.12 Cr",
                "change_pct": 8.2,
                "trend": "up",
                "ai_explanation": "Cloud compute training costs and marketing campaigns drove temporary opex increase."
            },
            "net_profit": {
                "current": net_profit,
                "formatted": "₹42.0 Lakhs",
                "change_pct": 18.5,
                "trend": "up",
                "ai_explanation": "Gross profit margins expanded by 2.4 percentage points."
            },
            "cash_balance": {
                "current": cash,
                "formatted": "₹4.82 Cr",
                "change_pct": 4.1,
                "trend": "up",
                "ai_explanation": "Cash reserves remain well above the ₹2.5 Cr minimum safety threshold."
            },
            "burn_rate": {
                "current": burn_rate,
                "formatted": "₹34.0 Lakhs/mo",
                "change_pct": -3.2,
                "trend": "down",
                "ai_explanation": "Net monthly burn rate improved due to deferred non-essential hardware purchases."
            },
            "runway": {
                "current": runway,
                "formatted": f"{runway} Months",
                "change_pct": -0.5,
                "trend": "down",
                "ai_explanation": "Runway is projected at 8.7 months under base growth trajectory."
            },
            "budget_utilization": {
                "current": 98.2,
                "formatted": "98.2%",
                "change_pct": 4.5,
                "trend": "up",
                "ai_explanation": "Marketing utilization (119%) offset underspending in Engineering (98%)."
            },
            "financial_risk_score": {
                "current": 28,
                "status": "Low-Medium Risk",
                "ai_explanation": "3 flagged alerts require executive attention: duplicate invoice, marketing overspend, and ABC Corp late payment."
            }
        },
        "financial_health": health,
        "executive_brief": {
            "salutation": "Good morning. Here's your financial brief.",
            "headline": "Your company remains financially healthy, but three items require attention today.",
            "bullets": [
                {"type": "positive", "text": "🟢 Monthly revenue increased +12.4% to ₹1.54 Cr."},
                {"type": "warning", "text": "🟠 Marketing spending is 19% over budget (+₹3.8L)."},
                {"type": "critical", "text": "🔴 ₹18L receivable from ABC Corp has a 72% probability of delay."},
                {"type": "info", "text": "🔵 Cash runway stands at 8.7 months with ₹4.82 Cr liquid reserve."}
            ],
            "cfo_recommendation": "Prioritize receivables collection for ABC Corp, enforce marketing budget caps, and review the ₹4.85L duplicate invoice for Alpha Supplies."
        }
    }
