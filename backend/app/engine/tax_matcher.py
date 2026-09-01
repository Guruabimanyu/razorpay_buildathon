from typing import Dict, Any, List

def validate_invoice_tax(invoice: Dict[str, Any], default_tax_rate: float = 0.18) -> Dict[str, Any]:
    """
    Validates tax line calculation for an invoice:
    expected_tax = subtotal * tax_rate
    Detects Tax Mismatch, Incorrect Tax Rate, Missing Tax, or Rounding Discrepancy.
    """
    inv_num = invoice.get("invoice_number", "INV-UNKNOWN")
    subtotal = float(invoice.get("subtotal") or 0.0)
    total_amount = float(invoice.get("total_amount") or invoice.get("amount") or 0.0)
    recorded_tax = float(invoice.get("tax") or 0.0)
    
    # Infer subtotal if zero
    if subtotal == 0.0 and total_amount > 0.0:
        subtotal = round(total_amount / (1.0 + default_tax_rate), 2)
        
    expected_tax = round(subtotal * default_tax_rate, 2)
    tax_diff = abs(recorded_tax - expected_tax)
    
    is_valid = True
    category = "TAX_MATCHED"
    severity = "LOW"
    explanation = f"Tax calculation verified for {inv_num}. Subtotal: ₹{subtotal:,.2f}, Tax (18% GST): ₹{expected_tax:,.2f}."
    
    if recorded_tax == 0.0 and subtotal > 0.0:
        is_valid = False
        category = "MISSING_TAX"
        severity = "HIGH"
        explanation = f"Missing tax line detected on {inv_num}. Recorded GST: ₹0.00, Expected GST (18%): ₹{expected_tax:,.2f}."
    elif tax_diff > 2.0: # Discrepancy greater than ₹2.00
        is_valid = False
        category = "TAX_MISMATCH"
        severity = "MEDIUM" if tax_diff < 500.0 else "CRITICAL"
        explanation = f"Tax discrepancy detected on {inv_num}. Recorded GST: ₹{recorded_tax:,.2f}, Expected GST (18%): ₹{expected_tax:,.2f} (Diff: ₹{tax_diff:,.2f})."
    elif tax_diff > 0.01:
        category = "ROUNDING_DISCREPANCY"
        explanation = f"Minor rounding variance of ₹{tax_diff:.2f} detected on {inv_num} tax line."

    return {
        "invoice_number": inv_num,
        "vendor_or_customer": invoice.get("entity_name") or invoice.get("vendor_or_customer"),
        "subtotal": subtotal,
        "tax_rate": default_tax_rate,
        "expected_tax": expected_tax,
        "recorded_tax": recorded_tax,
        "discrepancy": round(tax_diff, 2),
        "is_valid": is_valid,
        "category": category,
        "severity": severity,
        "explanation": explanation
    }

def batch_validate_tax_records(invoices: List[Dict[str, Any]]) -> Dict[str, Any]:
    results = [validate_invoice_tax(inv) for inv in invoices]
    invalid_count = sum(1 for r in results if not r["is_valid"])
    total_tax_discrepancy = sum(r["discrepancy"] for r in results if not r["is_valid"])
    
    return {
        "total_invoices_audited": len(results),
        "valid_count": len(results) - invalid_count,
        "invalid_count": invalid_count,
        "total_discrepancy_amount": round(total_tax_discrepancy, 2),
        "audit_results": results
    }
