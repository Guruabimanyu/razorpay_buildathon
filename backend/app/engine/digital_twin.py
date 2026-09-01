from typing import Dict, Any

def run_financial_digital_twin_simulation(
    base_cash: float = 48200000.0,      # ₹4.82 Cr
    base_monthly_rev: float = 15400000.0, # ₹1.54 Cr
    base_monthly_exp: float = 11200000.0, # ₹1.12 Cr
    rev_change_pct: float = 0.0,
    exp_change_pct: float = 0.0,
    hiring_count: int = 0,
    avg_annual_salary: float = 1200000.0,
    marketing_delta: float = 0.0,
    lump_sum_capex: float = 0.0
) -> Dict[str, Any]:
    """
    Financial Digital Twin Matrix Simulator.
    Simulates cash runway, net profit, burn rate, and financial risk score in real-time.
    """
    # 1. Calculate Simulated Monthly Revenue
    sim_monthly_rev = base_monthly_rev * (1.0 + (rev_change_pct / 100.0))
    
    # 2. Calculate Additional Payroll Expenses
    monthly_payroll_per_hire = avg_annual_salary / 12.0
    added_payroll_monthly = hiring_count * monthly_payroll_per_hire
    
    # 3. Calculate Simulated Monthly Expenses
    sim_base_exp = base_monthly_exp * (1.0 + (exp_change_pct / 100.0))
    sim_monthly_exp = sim_base_exp + added_payroll_monthly + marketing_delta
    
    # 4. Calculate Net Profit / Cash Flow
    sim_monthly_net_profit = sim_monthly_rev - sim_monthly_exp
    sim_net_burn = max(0.0, sim_monthly_exp - sim_monthly_rev)
    
    # 5. Calculate Simulated Cash Balance (after lump sum capex & 3 months operation)
    sim_cash_after_capex = max(0.0, base_cash - lump_sum_capex)
    sim_cash_balance_3m = max(0.0, sim_cash_after_capex + (sim_monthly_net_profit * 3.0))
    
    # 6. Calculate Runway
    if sim_net_burn == 0:
        sim_runway = 99.0
    else:
        sim_runway = round(sim_cash_after_capex / sim_net_burn, 1)
        
    # 7. Calculate Simulated Risk Score
    risk_score = 25 # Low baseline
    if sim_runway < 4.0:
        risk_score += 55
    elif sim_runway < 6.0:
        risk_score += 35
    elif sim_runway < 9.0:
        risk_score += 15
        
    if sim_monthly_net_profit < 0:
        risk_score += 20
        
    if rev_change_pct < -15.0:
        risk_score += 15
        
    risk_score = min(99, max(10, risk_score))
    
    # 8. CFO Verdict Matrix
    if sim_runway < 6.0 or risk_score >= 70:
        cfo_verdict = "REJECT"
        verdict_badge = "red"
        reasoning = (
            f"Expansion is not recommended under this scenario. Cash runway drops sharply from 8.7 months to "
            f"{sim_runway} months, exposing the organization to severe liquidity risk within 180 days."
        )
    elif sim_runway < 8.5 or risk_score >= 45:
        cfo_verdict = "DELAY"
        verdict_badge = "amber"
        reasoning = (
            f"Caution advised. Project reduces cash reserves to ₹{round(sim_cash_balance_3m/100000.0, 1)}L with a "
            f"{sim_runway} month runway buffer. Defer non-critical hiring until pipeline closes."
        )
    elif sim_monthly_net_profit >= 0 and sim_runway >= 12.0:
        cfo_verdict = "APPROVE"
        verdict_badge = "green"
        reasoning = (
            f"Strong financial model! Scenario maintains positive net profit of ₹{round(sim_monthly_net_profit/100000.0, 1)}L/mo "
            f"with robust cash runway of {sim_runway} months."
        )
    else:
        cfo_verdict = "REVIEW"
        verdict_badge = "blue"
        reasoning = (
            f"Scenario is viable with tight budget monitoring. Net burn stands at ₹{round(sim_net_burn/100000.0, 1)}L/mo."
        )
        
    return {
        "scenario_inputs": {
            "rev_change_pct": rev_change_pct,
            "exp_change_pct": exp_change_pct,
            "hiring_count": hiring_count,
            "marketing_delta": marketing_delta,
            "lump_sum_capex": lump_sum_capex
        },
        "baseline": {
            "revenue": base_monthly_rev,
            "expenses": base_monthly_exp,
            "net_profit": base_monthly_rev - base_monthly_exp,
            "cash": base_cash,
            "runway": 8.7,
            "risk_score": 30
        },
        "simulation": {
            "sim_revenue": sim_monthly_rev,
            "sim_expenses": sim_monthly_exp,
            "sim_net_profit": sim_monthly_net_profit,
            "sim_cash": sim_cash_balance_3m,
            "sim_net_burn": sim_net_burn,
            "sim_runway": sim_runway,
            "sim_risk_score": risk_score
        },
        "cfo_verdict": cfo_verdict,
        "verdict_badge": verdict_badge,
        "ai_reasoning": reasoning,
        "confidence": 88
    }
