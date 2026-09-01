import datetime
from typing import Dict, Any, List

def calculate_cash_runway(
    current_cash: float,
    monthly_revenue: float,
    monthly_expenses: float
) -> Dict[str, Any]:
    """
    Runway = Available Cash / Average Monthly Net Burn
    """
    net_burn = monthly_expenses - monthly_revenue
    
    if net_burn <= 0:
        runway_months = 99.0
        explanation = "Company is net cash-flow positive! Monthly cash reserves are expanding."
    else:
        runway_months = round(current_cash / net_burn, 1)
        explanation = f"You currently have approximately {runway_months} months of runway under the base scenario."
        
    scenarios = {
        "Base": {
            "rev_factor": 1.0,
            "exp_factor": 1.0,
            "runway": runway_months if net_burn > 0 else 99.0,
            "description": "Current trajectory with expected pipeline conversions."
        },
        "Optimistic": {
            "rev_factor": 1.15,
            "exp_factor": 0.95,
            "runway": round(current_cash / max(1.0, (monthly_expenses * 0.95 - monthly_revenue * 1.15)), 1) if (monthly_expenses * 0.95 > monthly_revenue * 1.15) else 99.0,
            "description": "+15% revenue growth, 5% opex optimization."
        },
        "Conservative": {
            "rev_factor": 0.90,
            "exp_factor": 1.05,
            "runway": round(current_cash / max(1.0, (monthly_expenses * 1.05 - monthly_revenue * 0.90)), 1),
            "description": "10% pipeline delay with minor inflation cost increase."
        },
        "Crisis": {
            "rev_factor": 0.80,
            "exp_factor": 1.10,
            "runway": round(current_cash / max(1.0, (monthly_expenses * 1.10 - monthly_revenue * 0.80)), 1),
            "description": "-20% revenue drop with unexpected expense spikes."
        }
    }
    
    return {
        "current_cash": current_cash,
        "monthly_net_burn": round(net_burn, 2),
        "runway_months": runway_months,
        "explanation": explanation,
        "scenarios": scenarios
    }

def generate_cash_flow_forecast(
    current_cash: float,
    monthly_revenue: float,
    monthly_expenses: float,
    days: int = 180
) -> List[Dict[str, Any]]:
    """
    Generates daily/monthly projected cash balance for 7, 30, 60, 90, 180, 365 days.
    Supports Base, Best Case, and Worst Case scenarios.
    """
    forecast_points = []
    daily_revenue = monthly_revenue / 30.0
    daily_expenses = monthly_expenses / 30.0
    
    start_date = datetime.date.today()
    
    base_cash = current_cash
    best_cash = current_cash
    worst_cash = current_cash
    
    # Step intervals based on forecast range
    step_days = 1 if days <= 30 else (5 if days <= 90 else 15)
    
    for day in range(0, days + 1, step_days):
        point_date = start_date + datetime.timedelta(days=day)
        
        # Calculate cumulative cash balance
        base_cash = current_cash + (daily_revenue * day) - (daily_expenses * day)
        best_cash = current_cash + (daily_revenue * 1.12 * day) - (daily_expenses * 0.95 * day)
        worst_cash = current_cash + (daily_revenue * 0.80 * day) - (daily_expenses * 1.10 * day)
        
        forecast_points.append({
            "day": day,
            "date": point_date.strftime("%b %d, %Y"),
            "base_case": round(max(0, base_cash), 2),
            "best_case": round(max(0, best_cash), 2),
            "worst_case": round(max(0, worst_cash), 2),
            "safety_reserve": 2500000.0 # Safety threshold ₹25 Lakhs
        })
        
    return forecast_points
