import datetime
from typing import Dict, Any, List

def forecast_cash_position(
    current_cash: float,
    invoices: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]],
    horizon_days: int = 30
) -> Dict[str, Any]:
    """
    Calculates transparent cash position forecast for 7, 14, or 30 days based on:
    - Opening Liquid Cash Balance
    - Scheduled Accounts Receivable Inflows
    - Scheduled Accounts Payable Outflows
    - Historical Monthly Burn Baseline
    Returns projected cash, confidence bounds, and major financial drivers.
    """
    now = datetime.date.today()
    target_date = now + datetime.timedelta(days=horizon_days)
    
    expected_inflows = 0.0
    expected_outflows = 0.0
    drivers = []
    
    # Process Invoices for Receivables (Inflows) and Payables (Outflows)
    for inv in invoices:
        status = inv.get("status", "Pending")
        if status in ["Completed", "Paid"]:
            continue
            
        due_str = inv.get("due_date")
        amount = float(inv.get("total_amount") or inv.get("amount", 0.0))
        entity = inv.get("entity_name") or inv.get("vendor_or_customer") or "Unknown"
        e_type = inv.get("entity_type", "PAYABLE")
        
        # Check if invoice falls within horizon
        in_horizon = True
        if due_str:
            try:
                due_d = datetime.datetime.strptime(str(due_str).split('T')[0], "%Y-%m-%d").date()
                if due_d > target_date:
                    in_horizon = False
            except Exception:
                pass
                
        if in_horizon:
            if e_type in ["RECEIVABLE", "INFLOW"]:
                expected_inflows += amount
                if amount > 100000:
                    drivers.append(f"+₹{amount/100000:,.1f}L expected receivable from {entity}")
            else:
                expected_outflows += amount
                if amount > 100000:
                    drivers.append(f"-₹{amount/100000:,.1f}L scheduled payable to {entity}")

    # Process Recent Historical Transactions for Average Daily Burn Baseline
    recent_outflows = [float(t.get("amount", 0.0)) for t in transactions if t.get("txn_type") == "OUTFLOW"]
    avg_daily_burn = (sum(recent_outflows) / max(1, len(recent_outflows))) if recent_outflows else 25000.0
    estimated_ops_outflow = avg_daily_burn * (horizon_days / 3.0)
    
    total_outflows = expected_outflows + estimated_ops_outflow
    projected_cash = current_cash + expected_inflows - total_outflows
    
    # Confidence Intervals (±5% for 7d, ±8% for 14d, ±12% for 30d)
    variance_pct = 0.05 if horizon_days <= 7 else (0.08 if horizon_days <= 14 else 0.12)
    confidence_min = round(projected_cash * (1.0 - variance_pct), 2)
    confidence_max = round(projected_cash * (1.0 + variance_pct), 2)

    if not drivers:
        drivers = [
            f"+₹{expected_inflows/100000:,.1f}L total expected customer collections",
            f"-₹{total_outflows/100000:,.1f}L total scheduled operational payables"
        ]

    return {
        "horizon_days": horizon_days,
        "opening_cash": round(current_cash, 2),
        "expected_inflows": round(expected_inflows, 2),
        "expected_outflows": round(total_outflows, 2),
        "net_cash_flow": round(expected_inflows - total_outflows, 2),
        "projected_cash": round(projected_cash, 2),
        "confidence_interval": {
            "min": confidence_min,
            "max": confidence_max,
            "variance_pct": int(variance_pct * 100)
        },
        "major_drivers": drivers[:4],
        "calculated_at": datetime.datetime.utcnow().isoformat()
    }
