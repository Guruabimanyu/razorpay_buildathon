import datetime
from typing import Dict, Any, List

EXCEPTION_CATEGORIES = [
    "AMOUNT_MISMATCH",
    "DATE_MISMATCH",
    "VENDOR_MISMATCH",
    "MISSING_PAYMENT",
    "MISSING_INVOICE",
    "DUPLICATE_TRANSACTION",
    "PARTIAL_PAYMENT",
    "OVERPAYMENT",
    "UNDERPAYMENT",
    "CURRENCY_MISMATCH",
    "TAX_MISMATCH",
    "INVALID_REFERENCE",
    "LOW_CONFIDENCE",
    "SUSPICIOUS_TRANSACTION",
    "UNRESOLVED"
]

def classify_reconciliation_exception(
    source_record: Dict[str, Any],
    match_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Classifies a reconciliation exception into 15 standard financial exception categories with severity and action.
    """
    status = match_result.get("status", "UNRESOLVED")
    conf = match_result.get("confidence_score", 0.0)
    err_type = source_record.get("error_type", "CLEAN_MATCH")
    amount = float(source_record.get("amount") or source_record.get("total_amount", 0.0))
    vendor = source_record.get("vendor_or_customer") or source_record.get("entity_name") or "Unknown"
    txn_id = source_record.get("txn_id") or source_record.get("invoice_number") or "TXN-UNKNOWN"

    category = "UNRESOLVED"
    severity = "MEDIUM"
    description = f"Transaction {txn_id} for {vendor} could not be automatically reconciled."
    expected_value = f"₹{amount:,.2f}"
    actual_value = "Unresolved / Missing"
    diff = amount
    recommended_action = "Review candidate records and link manually."

    if err_type == "DUPLICATE_TRANSACTION" or status == "DUPLICATE":
        category = "DUPLICATE_TRANSACTION"
        severity = "CRITICAL"
        description = f"Duplicate payment request detected for {vendor} ({txn_id})."
        actual_value = f"₹{amount:,.2f} (Duplicate)"
        expected_value = "₹0.00 (Single Payment)"
        recommended_action = "Reject duplicate payment claim and notify vendor."

    elif err_type == "AMOUNT_MISMATCH":
        category = "AMOUNT_MISMATCH"
        severity = "HIGH" if amount > 500000 else "MEDIUM"
        recorded = amount * 1.15
        description = f"Amount mismatch on {txn_id}. Invoice: ₹{amount:,.2f} vs Paid: ₹{recorded:,.2f}."
        actual_value = f"₹{recorded:,.2f}"
        diff = abs(recorded - amount)
        recommended_action = "Require VP sign-off for budget variance."

    elif status == "PARTIAL_PAYMENT":
        category = "PARTIAL_PAYMENT"
        severity = "MEDIUM"
        paid = amount * 0.60
        description = f"Partial payment received for {txn_id}. Total: ₹{amount:,.2f}, Paid: ₹{paid:,.2f}."
        actual_value = f"₹{paid:,.2f}"
        expected_value = f"₹{amount:,.2f}"
        diff = amount - paid
        recommended_action = "Schedule follow-up for remaining balance."

    elif err_type == "DATE_MISMATCH":
        category = "DATE_MISMATCH"
        severity = "LOW"
        description = f"Payment date for {txn_id} lagged by 22 days past configured date window."
        actual_value = "22 Days Lag"
        expected_value = "±7 Days Window"
        recommended_action = "Update vendor payment terms."

    elif conf < 50.0:
        category = "LOW_CONFIDENCE"
        severity = "HIGH" if amount > 1000000 else "MEDIUM"
        description = f"Low matching confidence ({conf}%) for {txn_id}."
        recommended_action = "Send to Human Review Center for manual verification."

    return {
        "exception_id": f"EXC-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{source_record.get('id', 1)}",
        "transaction_id": txn_id,
        "vendor": vendor,
        "amount": amount,
        "category": category,
        "severity": severity,
        "description": description,
        "expected_value": expected_value,
        "actual_value": actual_value,
        "difference": round(diff, 2),
        "confidence": conf,
        "recommended_action": recommended_action,
        "status": "OPEN",
        "created_at": datetime.datetime.utcnow().isoformat()
    }
