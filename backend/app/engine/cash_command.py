import datetime
from typing import Dict, Any, List

def calculate_cash_command_center(
    current_cash: float = 48200000.0,
    monthly_rev: float = 15400000.0,
    monthly_exp: float = 11200000.0,
    unreconciled_cash: float = 706000.0
) -> Dict[str, Any]:
    """
    Cash Command Center Engine:
    Categorizes cash flows into Confirmed vs Expected vs Uncertain,
    and runs 30-Day Liquidity Stress Test scenarios (Base Case, Stress Case, Severe Case).
    """
    confirmed_inflows = 15400000.0 # B2B Subscriptions
    expected_inflows = 1800000.0   # ABC Corp AR (Pending)
    uncertain_inflows = 420000.0   # Disputed Collections
    
    confirmed_outflows = 8800000.0  # Payroll + Fixed SaaS
    expected_outflows = 2400000.0   # AWS + Hardware Invoices
    uncertain_outflows = 706000.0   # Unreconciled Exceptions

    net_confirmed = confirmed_inflows - confirmed_outflows
    projected_30d_cash = current_cash + net_confirmed + expected_inflows - expected_outflows

    # 30-Day Liquidity Stress Tests
    base_case = projected_30d_cash
    stress_case = current_cash + (confirmed_inflows * 0.90) - (confirmed_outflows + expected_outflows * 1.10) # 10% rev drop, +10% exp
    severe_case = current_cash + (confirmed_inflows * 0.80) - (confirmed_outflows + expected_outflows * 1.20 + 500000.0) # 20% rev drop, +20% exp

    return {
        "current_cash": current_cash,
        "unreconciled_cash_impact": unreconciled_cash,
        "cash_flow_breakdown": {
            "inflows": {
                "confirmed": confirmed_inflows,
                "expected": expected_inflows,
                "uncertain": uncertain_inflows
            },
            "outflows": {
                "confirmed": confirmed_outflows,
                "expected": expected_outflows,
                "uncertain": uncertain_outflows
            }
        },
        "projected_30d_cash": projected_30d_cash,
        "liquidity_stress_test": {
            "base_case": base_case,
            "stress_case": stress_case,
            "severe_case": severe_case,
            "reserve_threshold": 25000000.0, # ₹2.5 Cr safety line
            "is_safety_line_crossed": severe_case < 25000000.0
        },
        "early_warning": {
            "has_warning": severe_case < 25000000.0 or unreconciled_cash > 500000.0,
            "title": "Unreconciled Cash Exposure Warning",
            "message": f"₹{unreconciled_cash:,.2f} in unresolved transactions creates potential liquidity pressure over next 30 days.",
            "recommended_action": "Review 5 high-impact exceptions in Review Center to confirm cash clearance."
        }
    }
