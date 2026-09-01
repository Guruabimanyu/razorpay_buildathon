import re
import datetime
from typing import Dict, Any

def validate_gstin_format(gstin: str) -> bool:
    """Standard Indian GSTIN Regex Validation (15 Alphanumeric Characters)."""
    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    return bool(re.match(pattern, gstin.upper())) if gstin else False

def validate_indian_gst_line(
    subtotal: float,
    recorded_cgst: float,
    recorded_sgst: float,
    recorded_igst: float,
    gstin: str = "27AAACN9012K1Z5",
    is_interstate: bool = False
) -> Dict[str, Any]:
    """
    Validates GST line calculations (18% GST baseline: CGST 9% + SGST 9% or IGST 18%).
    """
    valid_gstin = validate_gstin_format(gstin)
    
    if is_interstate:
        expected_igst = round(subtotal * 0.18, 2)
        expected_cgst = 0.0
        expected_sgst = 0.0
        diff = abs(recorded_igst - expected_igst)
    else:
        expected_cgst = round(subtotal * 0.09, 2)
        expected_sgst = round(subtotal * 0.09, 2)
        expected_igst = 0.0
        diff = abs(recorded_cgst - expected_cgst) + abs(recorded_sgst - expected_sgst)

    is_valid = (diff < 2.0) and valid_gstin

    return {
        "subtotal": subtotal,
        "gstin": gstin,
        "gstin_valid": valid_gstin,
        "is_interstate": is_interstate,
        "recorded_tax": recorded_igst if is_interstate else (recorded_cgst + recorded_sgst),
        "expected_tax": expected_igst if is_interstate else (expected_cgst + expected_sgst),
        "discrepancy": round(diff, 2),
        "is_valid": is_valid,
        "status": "PASS" if is_valid else "REVIEW",
        "evidence": f"GSTIN {'valid' if valid_gstin else 'invalid'}. Calculated GST: ₹{expected_cgst + expected_sgst + expected_igst:,.2f} vs Recorded: ₹{recorded_cgst + recorded_sgst + recorded_igst:,.2f}."
    }

def validate_tds_deduction(
    payment_amount: float,
    recorded_tds: float,
    section: str = "194C",
    payee_type: str = "COMPANY"
) -> Dict[str, Any]:
    """
    Validates Indian TDS compliance (Section 194C / 194J under Income Tax Act rules).
    - 194C (Contractor): 1% Individual, 2% Company
    - 194J (Professional): 10%
    """
    rate = 0.02 if (section == "194C" and payee_type == "COMPANY") else (0.10 if section == "194J" else 0.01)
    expected_tds = round(payment_amount * rate, 2)
    diff = abs(recorded_tds - expected_tds)
    is_valid = diff < 2.0

    return {
        "section": section,
        "payment_amount": payment_amount,
        "recorded_tds": recorded_tds,
        "expected_tds": expected_tds,
        "applicable_rate_pct": rate * 100.0,
        "discrepancy": round(diff, 2),
        "is_valid": is_valid,
        "status": "PASS" if is_valid else "REVIEW",
        "evidence": f"TDS Sec {section} ({rate*100}%). Expected TDS: ₹{expected_tds:,.2f}, Recorded: ₹{recorded_tds:,.2f}."
    }
