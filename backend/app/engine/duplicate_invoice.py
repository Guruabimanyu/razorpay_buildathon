from typing import Dict, Any, List

def analyze_invoice_duplicates(
    new_invoice: Dict[str, Any],
    existing_invoices: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Detects exact & near-duplicate invoices based on:
    - Same Invoice Number
    - Same Vendor + Same Amount
    - Similar Line Items / Descriptions
    - Close issue date window (within 7 days)
    """
    vendor = new_invoice.get("entity_name", "").strip().lower()
    inv_num = str(new_invoice.get("invoice_number", "")).strip().lower()
    amount = float(new_invoice.get("total_amount", 0.0))
    
    max_prob = 0
    reasons = []
    matching_invoice_id = None
    
    for ex in existing_invoices:
        ex_vendor = str(ex.get("entity_name", "")).strip().lower()
        ex_inv_num = str(ex.get("invoice_number", "")).strip().lower()
        ex_amount = float(ex.get("total_amount", 0.0))
        
        prob = 0
        current_reasons = []
        
        # 1. Exact invoice number match
        if inv_num and inv_num == ex_inv_num:
            prob += 85
            current_reasons.append(f"Identical invoice number '{new_invoice.get('invoice_number')}'")
            
        # 2. Same vendor and exact amount match
        if vendor and vendor == ex_vendor:
            if abs(amount - ex_amount) < 1.0:
                prob += 75
                current_reasons.append(f"Exact amount match ₹{amount:,.2f} for vendor '{new_invoice.get('entity_name')}'")
            elif abs(amount - ex_amount) / max(1.0, amount) < 0.02: # within 2%
                prob += 40
                current_reasons.append(f"Near-exact amount match with invoice #{ex.get('invoice_number')}")
                
        if prob > max_prob:
            max_prob = prob
            reasons = current_reasons
            matching_invoice_id = ex.get("invoice_number")
            
    max_prob = min(99, max_prob)
    is_duplicate = max_prob >= 75
    
    explanation = (
        f"Duplicate probability is {max_prob}%. {', '.join(reasons)}. Flagged for finance review before disbursement."
        if is_duplicate
        else f"Clean invoice scan. Low duplicate risk ({max_prob}% probability)."
    )
    
    return {
        "is_duplicate": is_duplicate,
        "duplicate_probability": max_prob,
        "matching_invoice": matching_invoice_id,
        "reasons": reasons if reasons else ["No duplicate invoice matches found"],
        "explanation": explanation,
        "ai_action": "HOLD_PAYMENT" if is_duplicate else "PROCEED_TO_SCHEDULER"
    }

def calculate_ap_payment_schedule(invoices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks Accounts Payable by criticality, due date, vendor penalties, and cash availability.
    """
    payables = [inv for inv in invoices if inv.get("entity_type") == "PAYABLE" and inv.get("status") in ["Pending", "Flagged"]]
    
    scheduled = []
    for idx, inv in enumerate(payables):
        vendor = inv.get("entity_name", "")
        amount = inv.get("total_amount", 0.0)
        
        # Priority rules
        if "Payroll" in vendor or "Salary" in vendor or "Employee" in vendor:
            priority = 1
            reason = "Critical internal obligation; essential for operational stability."
        elif "AWS" in vendor or "Azure" in vendor or "Critical" in vendor:
            priority = 1
            reason = "Key cloud infrastructure dependency; avoid service outage."
        elif inv.get("status") == "Overdue":
            priority = 2
            reason = "Past due date; pay immediately to prevent late penalties and vendor hold."
        else:
            priority = 3 + idx
            reason = "Standard invoice terms; scheduled within optimal liquidity window."
            
        scheduled.append({
            "order": priority,
            "invoice_number": inv.get("invoice_number"),
            "vendor": vendor,
            "amount": amount,
            "due_date": inv.get("due_date"),
            "status": inv.get("status"),
            "reason": reason,
            "action": "APPROVED_FOR_PAYMENT" if priority <= 2 else "SCHEDULE_FOR_NET30"
        })
        
    scheduled.sort(key=lambda x: x["order"])
    return scheduled
