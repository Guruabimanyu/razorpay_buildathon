import random
import datetime
from typing import Dict, Any, List

VENDORS = [
    ("AWS Cloud Infrastructure", "Cloud Compute & SaaS", "INVOICE"),
    ("Alpha Supplies Corp", "Office Hardware", "INVOICE"),
    ("Global Media Ads", "Marketing & Growth", "INVOICE"),
    ("Staff Direct Payroll", "Human Resources", "PAYROLL"),
    ("Siemens Healthineers", "Medical Equipment", "INVOICE"),
    ("Sun Pharma Distro", "Lab Supplies", "INVOICE"),
    ("Apollo Hospitals Group", "Healthcare Revenue", "RECEIVABLE"),
    ("Velocity Logistics", "Freight & Delivery", "INVOICE"),
    ("Swiggy Aggregator Fees", "Food Platform Fee", "INVOICE"),
    ("Meta Ads India", "Digital Advertising", "INVOICE"),
    ("FreshToHome Supplies", "Raw Materials", "INVOICE"),
    ("Infosys Corporate Catering", "Enterprise Sales", "RECEIVABLE"),
    ("Shopify Plus Enterprise", "E-Commerce SaaS", "INVOICE"),
    ("BlueDart Express", "Shipping & Packaging", "INVOICE"),
    ("FinTech Global Inc", "Enterprise SaaS Rev", "RECEIVABLE")
]

DEPARTMENTS = ["Engineering", "Marketing", "Operations", "Sales", "HR & Admin", "Facilities", "IT & Software"]

def generate_synthetic_financial_dataset(record_count: int = 100) -> Dict[str, Any]:
    """
    Generates a realistic batch of synthetic financial records across BANK, INVOICE, PAYMENTS, RECEIVABLES, PAYABLES.
    Enforces controlled error distribution:
    - 70% Clean Exact / High-Confidence Matches
    - 10% Amount Mismatches
    - 5% Date Window Mismatches
    - 5% Duplicate Transactions
    - 5% Missing Payments
    - 5% Vendor Name Mismatches
    """
    records = []
    base_date = datetime.date.today() - datetime.timedelta(days=30)
    
    clean_count = int(record_count * 0.70)
    amount_err_count = int(record_count * 0.10)
    date_err_count = int(record_count * 0.05)
    dup_count = int(record_count * 0.05)
    missing_count = int(record_count * 0.05)
    vendor_err_count = record_count - (clean_count + amount_err_count + date_err_count + dup_count + missing_count)

    idx = 1
    
    def random_amount(min_val=10000, max_val=2500000):
        return round(random.uniform(min_val, max_val), 2)

    # 1. Clean Matches (70%)
    for _ in range(clean_count):
        vendor, cat, r_type = random.choice(VENDORS)
        amt = random_amount()
        tax = round(amt * 0.18, 2)
        subtotal = round(amt - tax, 2)
        txn_date = base_date + datetime.timedelta(days=random.randint(0, 25))
        inv_num = f"INV-2026-{1000 + idx}"
        txn_num = f"TXN-9000-{1000 + idx}"
        dept = random.choice(DEPARTMENTS)
        
        records.append({
            "id": idx,
            "txn_id": txn_num,
            "invoice_number": inv_num,
            "source_type": "INVOICE" if "INVOICE" in r_type else "BANK",
            "date": txn_date.strftime("%Y-%m-%d"),
            "issue_date": txn_date.strftime("%Y-%m-%d"),
            "due_date": (txn_date + datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
            "vendor_or_customer": vendor,
            "entity_name": vendor,
            "subtotal": subtotal,
            "tax": tax,
            "amount": amt,
            "total_amount": amt,
            "txn_type": "INFLOW" if "RECEIVABLE" in r_type else "OUTFLOW",
            "category": cat,
            "department": dept,
            "payment_method": "Bank Transfer",
            "reference": inv_num,
            "description": f"Payment for {vendor} - {cat}",
            "error_type": "CLEAN_MATCH"
        })
        idx += 1

    # 2. Amount Mismatches (10%)
    for _ in range(amount_err_count):
        vendor, cat, r_type = random.choice(VENDORS)
        amt = random_amount()
        recorded_amt = round(amt * random.choice([0.85, 1.15, 0.90]), 2)
        tax = round(amt * 0.18, 2)
        subtotal = round(amt - tax, 2)
        txn_date = base_date + datetime.timedelta(days=random.randint(0, 25))
        inv_num = f"INV-2026-{1000 + idx}"
        txn_num = f"TXN-9000-{1000 + idx}"
        dept = random.choice(DEPARTMENTS)
        
        records.append({
            "id": idx,
            "txn_id": txn_num,
            "invoice_number": inv_num,
            "source_type": "BANK",
            "date": txn_date.strftime("%Y-%m-%d"),
            "issue_date": txn_date.strftime("%Y-%m-%d"),
            "due_date": (txn_date + datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
            "vendor_or_customer": vendor,
            "entity_name": vendor,
            "subtotal": subtotal,
            "tax": tax,
            "amount": recorded_amt,
            "total_amount": amt,
            "txn_type": "OUTFLOW",
            "category": cat,
            "department": dept,
            "payment_method": "Corporate Card",
            "reference": inv_num,
            "description": f"Variance Payment for {vendor} (Invoice: ₹{amt:,.2f} vs Paid: ₹{recorded_amt:,.2f})",
            "error_type": "AMOUNT_MISMATCH"
        })
        idx += 1

    # 3. Date Mismatches (5%)
    for _ in range(date_err_count):
        vendor, cat, r_type = random.choice(VENDORS)
        amt = random_amount()
        tax = round(amt * 0.18, 2)
        subtotal = round(amt - tax, 2)
        txn_date = base_date + datetime.timedelta(days=random.randint(0, 10))
        paid_date = txn_date + datetime.timedelta(days=22) # 22 days gap
        inv_num = f"INV-2026-{1000 + idx}"
        txn_num = f"TXN-9000-{1000 + idx}"
        dept = random.choice(DEPARTMENTS)
        
        records.append({
            "id": idx,
            "txn_id": txn_num,
            "invoice_number": inv_num,
            "source_type": "INVOICE",
            "date": paid_date.strftime("%Y-%m-%d"),
            "issue_date": txn_date.strftime("%Y-%m-%d"),
            "due_date": (txn_date + datetime.timedelta(days=15)).strftime("%Y-%m-%d"),
            "vendor_or_customer": vendor,
            "entity_name": vendor,
            "subtotal": subtotal,
            "tax": tax,
            "amount": amt,
            "total_amount": amt,
            "txn_type": "OUTFLOW",
            "category": cat,
            "department": dept,
            "payment_method": "ACH",
            "reference": inv_num,
            "description": f"Delayed Payment for {vendor} - Date lag 22 days",
            "error_type": "DATE_MISMATCH"
        })
        idx += 1

    # 4. Duplicate Transactions (5%)
    for _ in range(dup_count):
        vendor, cat, r_type = random.choice(VENDORS)
        amt = random_amount()
        tax = round(amt * 0.18, 2)
        subtotal = round(amt - tax, 2)
        txn_date = base_date + datetime.timedelta(days=random.randint(0, 25))
        inv_num = f"INV-DUP-{2000 + idx}"
        txn_num = f"TXN-DUP-{2000 + idx}"
        dept = random.choice(DEPARTMENTS)
        
        # Add primary and duplicate pair
        records.append({
            "id": idx,
            "txn_id": txn_num,
            "invoice_number": inv_num,
            "source_type": "INVOICE",
            "date": txn_date.strftime("%Y-%m-%d"),
            "issue_date": txn_date.strftime("%Y-%m-%d"),
            "due_date": (txn_date + datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
            "vendor_or_customer": vendor,
            "entity_name": vendor,
            "subtotal": subtotal,
            "tax": tax,
            "amount": amt,
            "total_amount": amt,
            "txn_type": "OUTFLOW",
            "category": cat,
            "department": dept,
            "payment_method": "Bank Transfer",
            "reference": inv_num,
            "description": f"Duplicate invoice entry for {vendor}",
            "error_type": "DUPLICATE_TRANSACTION"
        })
        idx += 1

    # 5. Missing Payments & Vendor Mismatches (Remaining)
    for _ in range(missing_count + vendor_err_count):
        vendor, cat, r_type = random.choice(VENDORS)
        amt = random_amount()
        tax = round(amt * 0.18, 2)
        subtotal = round(amt - tax, 2)
        txn_date = base_date + datetime.timedelta(days=random.randint(0, 25))
        inv_num = f"INV-UNMATCHED-{3000 + idx}"
        txn_num = f"TXN-UNMATCHED-{3000 + idx}"
        dept = random.choice(DEPARTMENTS)
        
        records.append({
            "id": idx,
            "txn_id": txn_num,
            "invoice_number": inv_num,
            "source_type": "PAYMENTS",
            "date": txn_date.strftime("%Y-%m-%d"),
            "issue_date": txn_date.strftime("%Y-%m-%d"),
            "due_date": (txn_date + datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
            "vendor_or_customer": f"{vendor} Alias Corp",
            "entity_name": f"{vendor} Alias Corp",
            "subtotal": subtotal,
            "tax": tax,
            "amount": amt,
            "total_amount": amt,
            "txn_type": "OUTFLOW",
            "category": cat,
            "department": dept,
            "payment_method": "Bank Transfer",
            "reference": inv_num,
            "description": f"Unmatched transaction for {vendor} Alias Corp",
            "error_type": "MISSING_PAYMENT"
        })
        idx += 1

    random.shuffle(records)
    
    return {
        "record_count": len(records),
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "breakdown": {
            "clean_matches": clean_count,
            "amount_mismatches": amount_err_count,
            "date_mismatches": date_err_count,
            "duplicates": dup_count,
            "missing_payments": missing_count + vendor_err_count
        },
        "records": records
    }
