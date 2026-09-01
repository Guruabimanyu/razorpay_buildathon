from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Invoice
from app.engine.tax_matcher import validate_invoice_tax, batch_validate_tax_records

router = APIRouter(prefix="/tax", tags=["Tax-Line Matcher"])

@router.post("/validate")
def validate_single_tax_record(
    subtotal: float = Body(..., embed=True),
    recorded_tax: float = Body(..., embed=True),
    tax_rate: float = Body(0.18, embed=True),
    invoice_number: str = Body("INV-AUDIT-101", embed=True),
    vendor_name: str = Body("Vendor Supplies", embed=True)
) -> Dict[str, Any]:
    """
    Validates tax line calculation for a single invoice input.
    """
    invoice_dict = {
        "invoice_number": invoice_number,
        "entity_name": vendor_name,
        "subtotal": subtotal,
        "tax": recorded_tax
    }
    return validate_invoice_tax(invoice_dict, tax_rate)

@router.get("/summary")
def get_tax_validation_summary(
    org_name: str = Query("NovaTech AI Systems"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Performs tax validation audit over database invoices and returns discrepancy metrics.
    """
    invs = db.query(Invoice).all()
    invoices_data = [
        {
            "invoice_number": i.invoice_number,
            "entity_name": i.entity_name,
            "subtotal": i.subtotal,
            "tax": i.tax,
            "total_amount": i.total_amount
        }
        for i in invs
    ]
    
    if not invoices_data:
        invoices_data = [
            {"invoice_number": "INV-2026-881", "entity_name": "Alpha Supplies Corp", "subtotal": 411016.0, "tax": 73984.0, "total_amount": 485000.0},
            {"invoice_number": "INV-2026-880", "entity_name": "Alpha Supplies Corp", "subtotal": 411016.0, "tax": 73984.0, "total_amount": 485000.0},
            {"invoice_number": "INV-REC-904", "entity_name": "ABC Corp Enterprise", "subtotal": 1525423.0, "tax": 274577.0, "total_amount": 1800000.0},
            {"invoice_number": "INV-6003", "entity_name": "FreshToHome Supplies", "subtotal": 949152.0, "tax": 145000.0, "total_amount": 1120000.0} # Intentionally wrong GST
        ]
        
    summary = batch_validate_tax_records(invoices_data)
    summary["organization"] = org_name
    return summary
