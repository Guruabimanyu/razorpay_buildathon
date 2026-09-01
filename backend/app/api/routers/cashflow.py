from fastapi import APIRouter, Query
from app.engine.runway import calculate_cash_runway, generate_cash_flow_forecast

router = APIRouter(prefix="/cashflow", tags=["Cash Flow"])

@router.get("/forecast")
def get_cash_flow_forecast(days: int = Query(180, ge=7, le=365)):
    cash = 48200000.0
    monthly_rev = 15400000.0
    monthly_exp = 11200000.0
    
    runway_data = calculate_cash_runway(cash, monthly_rev, monthly_exp)
    points = generate_cash_flow_forecast(cash, monthly_rev, monthly_exp, days=days)
    
    return {
        "days": days,
        "runway_summary": runway_data,
        "chart_points": points
    }
