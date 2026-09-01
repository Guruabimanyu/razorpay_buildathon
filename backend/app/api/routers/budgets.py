from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Budget
from app.engine.budget_optimizer import optimize_budget_savings

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("/")
def get_budgets(db: Session = Depends(get_db)):
    budgets = db.query(Budget).filter(Budget.organization_id == 1).all()
    formatted = [
        {
            "id": b.id,
            "department": b.department,
            "allocated_amount": b.allocated_amount,
            "actual_spent": b.actual_spent,
            "variance": b.variance,
            "utilization_pct": b.utilization_pct,
            "period": b.period,
            "status": b.status,
            "ai_recommendation": b.ai_recommendation
        } for b in budgets
    ]
    
    total_allocated = sum(b.allocated_amount for b in budgets) if budgets else 11200000.0
    total_spent = sum(b.actual_spent for b in budgets) if budgets else 11200000.0
    
    return {
        "summary": {
            "total_allocated": total_allocated,
            "total_spent": total_spent,
            "overall_utilization": round((total_spent / total_allocated * 100.0), 1) if total_allocated > 0 else 100.0
        },
        "departments": formatted
    }

@router.get("/optimize")
def optimize_budgets(target: float = 1000000.0):
    res = optimize_budget_savings(target_reduction=target)
    return res
