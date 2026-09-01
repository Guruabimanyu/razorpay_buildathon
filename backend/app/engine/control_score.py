import datetime
from typing import Dict, Any

def calculate_finance_control_score(
    reconciliation_rate: float = 87.0,
    accounting_integrity_pct: float = 96.0,
    exception_load_count: int = 5,
    cash_visibility_pct: float = 81.0,
    tax_consistency_pct: float = 89.0,
    vendor_risk_score: float = 74.0,
    control_compliance_pct: float = 88.0
) -> Dict[str, Any]:
    """
    Calculates the enterprise-grade Finance Control Score (0-100) independently from Financial Health Score.
    """
    rec_score = min(100.0, max(0.0, reconciliation_rate))
    acct_score = min(100.0, max(0.0, accounting_integrity_pct))
    exc_score = max(0.0, 100.0 - (exception_load_count * 5.0))
    cash_score = min(100.0, max(0.0, cash_visibility_pct))
    tax_score = min(100.0, max(0.0, tax_consistency_pct))
    vnd_score = min(100.0, max(0.0, vendor_risk_score))
    comp_score = min(100.0, max(0.0, control_compliance_pct))

    overall_score = round(
        (rec_score * 0.25) +
        (acct_score * 0.20) +
        (cash_score * 0.15) +
        (tax_score * 0.15) +
        (comp_score * 0.10) +
        (vnd_score * 0.10) +
        (exc_score * 0.05),
        1
    )

    verdict = "STRONG_CONTROL" if overall_score >= 85.0 else ("MODERATE_CONTROL" if overall_score >= 70.0 else "WEAK_CONTROL")

    return {
        "finance_control_score": overall_score,
        "verdict": verdict,
        "sub_scores": {
            "reconciliation_health": rec_score,
            "accounting_integrity": acct_score,
            "cash_visibility": cash_score,
            "tax_consistency": tax_score,
            "control_compliance": comp_score,
            "vendor_risk_health": vnd_score,
            "exception_load_health": exc_score
        },
        "score_delta_reasons": [
            "Alpha Supplies duplicate invoice flagged (+4 points control gain)",
            "Marketing department budget overrun (-3 points exception load)",
            "1 unverified tax line discrepancy (-2 points tax consistency)"
        ],
        "calculated_at": datetime.datetime.utcnow().isoformat()
    }
