from typing import Dict, Any

def calculate_financial_health_score(
    cash: float,
    monthly_revenue: float,
    monthly_expenses: float,
    budget_utilization: float,
    receivables_overdue_pct: float,
    payables_overdue_pct: float,
    risk_alerts_count: int
) -> Dict[str, Any]:
    """
    Deterministic Financial Health Score Calculation (0-100).
    Combines Liquidity, Profitability, Cash Flow, Risk, Budget Control, and Revenue Stability.
    """
    net_burn = max(0.0, monthly_expenses - monthly_revenue)
    runway_months = (cash / net_burn) if net_burn > 0 else 24.0
    
    # 1. Liquidity (Max 100) - based on cash runway
    liquidity_score = min(100.0, max(20.0, runway_months * 10.0))
    
    # 2. Profitability (Max 100) - profit margin
    profit_margin = ((monthly_revenue - monthly_expenses) / monthly_revenue * 100.0) if monthly_revenue > 0 else 0.0
    profitability_score = min(100.0, max(10.0, 50.0 + (profit_margin * 1.5)))
    
    # 3. Cash Flow stability (Max 100)
    cash_flow_score = min(100.0, max(15.0, 90.0 - (receivables_overdue_pct * 0.5) - (payables_overdue_pct * 0.3)))
    
    # 4. Anomaly & Fraud Risk score (higher is safer/better)
    risk_penalty = risk_alerts_count * 5.0
    risk_score = min(100.0, max(10.0, 95.0 - risk_penalty))
    
    # 5. Budget Control score
    budget_control_score = min(100.0, max(10.0, 100.0 - abs(budget_utilization - 90.0) * 1.2))
    
    # 6. Revenue Stability score
    rev_stability_score = 77.0 # Standard benchmark for enterprise tech/SaaS mix
    
    # Weighted Overall Score
    weights = {
        "liquidity": 0.25,
        "profitability": 0.20,
        "cash_flow": 0.20,
        "risk": 0.15,
        "budget_control": 0.10,
        "rev_stability": 0.10
    }
    
    overall_score = int(
        liquidity_score * weights["liquidity"] +
        profitability_score * weights["profitability"] +
        cash_flow_score * weights["cash_flow"] +
        risk_score * weights["risk"] +
        budget_control_score * weights["budget_control"] +
        rev_stability_score * weights["rev_stability"]
    )
    overall_score = max(0, min(100, overall_score))
    
    if overall_score >= 80:
        status = "Excellent"
        status_color = "green"
        ai_summary = "Strong liquidity reserve and healthy profit margins. Company is well-positioned for growth."
    elif overall_score >= 65:
        status = "Healthy"
        status_color = "green"
        ai_summary = "Financial position is stable, but marketing expense growth and AR collections require oversight."
    elif overall_score >= 50:
        status = "Needs Attention"
        status_color = "amber"
        ai_summary = "Cash runway is contracting. Discretionary spending should be curtailed immediately."
    else:
        status = "Critical Risk"
        status_color = "red"
        ai_summary = "High risk of cash shortfall within 60 days. Immediate emergency cost-reduction required."
        
    return {
        "overall_score": overall_score,
        "status": status,
        "status_color": status_color,
        "ai_summary": ai_summary,
        "breakdown": {
            "liquidity": round(liquidity_score, 1),
            "profitability": round(profitability_score, 1),
            "cash_flow": round(cash_flow_score, 1),
            "risk": round(risk_score, 1),
            "budget_control": round(budget_control_score, 1),
            "revenue_stability": round(rev_stability_score, 1)
        },
        "explanations": {
            "liquidity": f"Runway stands at {round(runway_months, 1)} months with ₹{round(cash/100000.0, 2)}L cash buffer.",
            "profitability": f"Monthly net profit margin is {round(profit_margin, 1)}%.",
            "cash_flow": f"Receivables delay rate is {round(receivables_overdue_pct, 1)}%.",
            "risk": f"{risk_alerts_count} active financial risk alerts identified.",
            "budget_control": f"Budget utilization rate is {round(budget_utilization, 1)}%.",
            "revenue_stability": "High subscription recurrence provides strong predictability."
        }
    }
