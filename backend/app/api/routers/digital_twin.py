from fastapi import APIRouter
from pydantic import BaseModel
from app.engine.digital_twin import run_financial_digital_twin_simulation

router = APIRouter(prefix="/digital-twin", tags=["Financial Digital Twin"])

class SimulationRequest(BaseModel):
    revenue_change_pct: float = 0.0
    expense_change_pct: float = 0.0
    hiring_count: int = 0
    avg_annual_salary: float = 1200000.0
    marketing_delta: float = 0.0
    lump_sum_capex: float = 0.0

import random
import datetime
from sqlalchemy.orm import Session
from fastapi import Depends
from app.db.session import get_db
from app.db.models import Scenario, ScenarioResult

@router.post("/simulate")
def simulate_scenario(req: SimulationRequest, db: Session = Depends(get_db)):
    result = run_financial_digital_twin_simulation(
        base_cash=48200000.0,
        base_monthly_rev=15400000.0,
        base_monthly_exp=11200000.0,
        rev_change_pct=req.revenue_change_pct,
        exp_change_pct=req.expense_change_pct,
        hiring_count=req.hiring_count,
        avg_annual_salary=req.avg_annual_salary,
        marketing_delta=req.marketing_delta,
        lump_sum_capex=req.lump_sum_capex
    )

    # Persist simulation scenario run to database without modifying actual transaction data
    try:
        scenario_id = f"SCEN-{random.randint(10000, 99999)}"
        sc = Scenario(
            scenario_id=scenario_id,
            organization_id=1,
            name=f"Simulation Rev:{req.revenue_change_pct}% Exp:{req.expense_change_pct}% Hire:{req.hiring_count}",
            description="Digital Twin deterministic simulation run",
            horizon_months=12,
            revenue_shock_pct=req.revenue_change_pct,
            payroll_change_pct=req.hiring_count * 10.0,
            opex_change_pct=req.expense_change_pct,
            expansion_capex=req.lump_sum_capex,
            created_by="Digital Twin Engine"
        )
        db.add(sc)

        for m_data in result.get("monthly_projections", []):
            sr = ScenarioResult(
                scenario_id=scenario_id,
                month=m_data.get("month", 1),
                projected_revenue=m_data.get("revenue", 0.0),
                projected_expenses=m_data.get("expenses", 0.0),
                projected_net_income=m_data.get("net_burn", 0.0),
                projected_cash_balance=m_data.get("ending_cash", 0.0),
                projected_runway_months=result.get("summary", {}).get("simulated_runway_months", 12.0),
                health_score=result.get("summary", {}).get("simulated_health_score", 85),
                risk_level=result.get("summary", {}).get("risk_category", "LOW")
            )
            db.add(sr)
        
        db.commit()
    except Exception as e:
        db.rollback()

    return result

@router.get("/presets")
def get_scenario_presets():
    return {
        "presets": [
            {
                "id": "revenue_crash",
                "title": "Revenue Crisis (-20%)",
                "inputs": {"revenue_change_pct": -20.0, "expense_change_pct": 0.0, "hiring_count": 0, "marketing_delta": 0.0, "lump_sum_capex": 0.0},
                "description": "Simulates 20% top-line contraction from macro headwind."
            },
            {
                "id": "rapid_hiring",
                "title": "Rapid Hiring (+10 Employees)",
                "inputs": {"revenue_change_pct": 0.0, "expense_change_pct": 0.0, "hiring_count": 10, "marketing_delta": 500000.0, "lump_sum_capex": 0.0},
                "description": "Simulates adding 10 tech leads & ₹5L monthly marketing boost."
            },
            {
                "id": "expansion",
                "title": "New Branch Expansion (₹50L Capex)",
                "inputs": {"revenue_change_pct": 10.0, "expense_change_pct": 5.0, "hiring_count": 5, "marketing_delta": 300000.0, "lump_sum_capex": 5000000.0},
                "description": "Simulates setting up new tier-1 regional office."
            },
            {
                "id": "cost_reduction",
                "title": "Cost Cut (-15% Opex)",
                "inputs": {"revenue_change_pct": 0.0, "expense_change_pct": -15.0, "hiring_count": 0, "marketing_delta": 0.0, "lump_sum_capex": 0.0},
                "description": "Simulates aggressive SaaS & discretionary cost reduction."
            }
        ]
    }
