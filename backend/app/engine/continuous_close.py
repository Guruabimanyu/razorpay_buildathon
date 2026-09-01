import datetime
from typing import Dict, Any, List

def calculate_continuous_close_readiness(
    total_records: int = 100,
    reconciled_count: int = 98,
    open_exceptions_count: int = 7,
    high_risk_exceptions_count: int = 2,
    unverified_cash_amount: float = 180000.0,
    tax_inconsistencies_count: int = 1,
    missing_documents_count: int = 3
) -> Dict[str, Any]:
    """
    Calculates Continuous Month-End Close Readiness Score (0-100%) and details critical close blockers.
    """
    reconciliation_pct = (reconciled_count / max(1, total_records)) * 100.0
    
    # Deductions
    exception_penalty = open_exceptions_count * 1.5 + high_risk_exceptions_count * 4.0
    tax_penalty = tax_inconsistencies_count * 5.0
    doc_penalty = missing_documents_count * 2.0
    
    readiness_score = max(0.0, min(100.0, 100.0 - (exception_penalty + tax_penalty + doc_penalty)))
    readiness_score = round(readiness_score, 1)

    blockers = []
    if high_risk_exceptions_count > 0:
        blockers.append({
            "severity": "CRITICAL",
            "title": f"{high_risk_exceptions_count} Critical High-Risk Exceptions Open",
            "impact": f"₹{unverified_cash_amount:,.2f} unverified cash",
            "action": "Resolve duplicate invoice & marketing variance exceptions before period close."
        })
    if tax_inconsistencies_count > 0:
        blockers.append({
            "severity": "HIGH",
            "title": f"{tax_inconsistencies_count} GST Line Discrepancy Flagged",
            "impact": "Tax audit risk",
            "action": "Verify FreshToHome GST invoice tax calculation."
        })
    if missing_documents_count > 0:
        blockers.append({
            "severity": "MEDIUM",
            "title": f"{missing_documents_count} Supporting Documents Missing",
            "impact": "Audit compliance gap",
            "action": "Upload missing purchase orders and payment receipts."
        })

    status = "READY" if readiness_score >= 95.0 else ("IN_PROGRESS" if readiness_score >= 80.0 else "BLOCKED")

    return {
        "period": datetime.datetime.utcnow().strftime("%B %Y"),
        "close_readiness_score": readiness_score,
        "reconciled_pct": round(reconciliation_pct, 1),
        "status": status,
        "metrics": {
            "total_records": total_records,
            "reconciled_records": reconciled_count,
            "open_exceptions": open_exceptions_count,
            "high_risk_exceptions": high_risk_exceptions_count,
            "unverified_cash": unverified_cash_amount,
            "missing_documents": missing_documents_count,
            "tax_inconsistencies": tax_inconsistencies_count
        },
        "close_blockers": blockers,
        "non_blockers_count": 7,
        "recommendation": f"Resolve the {len(blockers)} active close blockers to reach 100% close readiness." if blockers else "All requirements met. Ready to close financial period."
    }
