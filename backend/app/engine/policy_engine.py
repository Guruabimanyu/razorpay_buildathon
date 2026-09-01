import datetime
from typing import Dict, Any, List, Optional

DEFAULT_POLICIES = [
    {
        "policy_id": "POL-APPROVAL-001",
        "name": "High-Value Transaction Executive Approval",
        "category": "APPROVAL_THRESHOLD",
        "threshold": 500000.0, # ₹5 Lakhs
        "severity": "CRITICAL",
        "action": "ESCALATE_CFO",
        "required_role": "CFO",
        "description": "Any disbursement exceeding ₹5,000,000 requires explicit CFO confirmation.",
        "active": True,
        "version": "v2.1"
    },
    {
        "policy_id": "POL-DUP-002",
        "name": "Strict Duplicate Invoice Block",
        "category": "DUPLICATE_PREVENTION",
        "threshold": 0.85, # 85% duplicate probability
        "severity": "CRITICAL",
        "action": "REJECT",
        "required_role": "FINANCE_MANAGER",
        "description": "Invoices with >85% duplicate match against previous records are blocked from payment.",
        "active": True,
        "version": "v1.4"
    },
    {
        "policy_id": "POL-TAX-003",
        "name": "GST Line Integrity & IRN Verification",
        "category": "TAX_COMPLIANCE",
        "threshold": 500.0, # ₹500 discrepancy cap
        "severity": "HIGH",
        "action": "HUMAN_REVIEW",
        "required_role": "FINANCE_REVIEWER",
        "description": "GST calculation variances greater than ₹500 must be audited prior to tax filing.",
        "active": True,
        "version": "v3.0"
    },
    {
        "policy_id": "POL-VND-004",
        "name": "New Vendor First-Payment Hold",
        "category": "VENDOR_VERIFICATION",
        "threshold": 100000.0, # ₹1 Lakh
        "severity": "MEDIUM",
        "action": "HUMAN_REVIEW",
        "required_role": "FINANCE_REVIEWER",
        "description": "Initial invoice from unverified vendor exceeding ₹1 Lakh requires banking detail verification.",
        "active": True,
        "version": "v1.0"
    }
]

def evaluate_transaction_against_policies(
    transaction: Dict[str, Any],
    policies: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Evaluates a financial transaction against Policy-as-Data control rules.
    Returns list of violations, risk level, required role, and recommended action.
    """
    policy_list = policies or DEFAULT_POLICIES
    violations = []
    highest_severity = "LOW"
    required_role = "AUTO"
    recommended_action = "AUTO_APPROVE"
    
    amount = float(transaction.get("amount") or transaction.get("total_amount", 0.0))
    is_dup = transaction.get("is_duplicate") or (transaction.get("duplicate_prob", 0.0) >= 0.85)
    tax_diff = float(transaction.get("tax_discrepancy", 0.0))
    vendor_new = transaction.get("vendor_is_new", False)

    for pol in policy_list:
        if not pol.get("active", True):
            continue

        cat = pol.get("category")
        thresh = pol.get("threshold", 0.0)
        sev = pol.get("severity", "MEDIUM")
        act = pol.get("action", "HUMAN_REVIEW")
        role = pol.get("required_role", "FINANCE_REVIEWER")

        if cat == "APPROVAL_THRESHOLD" and amount >= thresh:
            violations.append({
                "policy_id": pol["policy_id"],
                "policy_name": pol["name"],
                "severity": sev,
                "action": act,
                "evidence": f"Transaction amount ₹{amount:,.2f} exceeds threshold ₹{thresh:,.2f}."
            })
            highest_severity = "CRITICAL"
            required_role = role
            recommended_action = act

        elif cat == "DUPLICATE_PREVENTION" and is_dup:
            violations.append({
                "policy_id": pol["policy_id"],
                "policy_name": pol["name"],
                "severity": sev,
                "action": act,
                "evidence": f"Duplicate invoice probability detected for reference {transaction.get('reference') or transaction.get('invoice_number')}."
            })
            if highest_severity != "CRITICAL":
                highest_severity = sev
            required_role = role
            recommended_action = act

        elif cat == "TAX_COMPLIANCE" and tax_diff > thresh:
            violations.append({
                "policy_id": pol["policy_id"],
                "policy_name": pol["name"],
                "severity": sev,
                "action": act,
                "evidence": f"GST line discrepancy ₹{tax_diff:,.2f} exceeds cap of ₹{thresh:,.2f}."
            })
            if highest_severity not in ["CRITICAL"]:
                highest_severity = sev
            required_role = role
            recommended_action = act

    return {
        "transaction_id": transaction.get("txn_id") or transaction.get("invoice_number") or "TXN-UNKNOWN",
        "has_violations": len(violations) > 0,
        "violation_count": len(violations),
        "violations": violations,
        "highest_severity": highest_severity if violations else "NONE",
        "required_role": required_role if violations else "AUTO",
        "recommended_action": recommended_action if violations else "AUTO_APPROVE",
        "evaluated_at": datetime.datetime.utcnow().isoformat()
    }
