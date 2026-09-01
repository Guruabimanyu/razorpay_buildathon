from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Transaction, Invoice, RiskAlert, AuditLog

router = APIRouter(prefix="/exceptions", tags=["Exception Engine"])

MOCK_EXCEPTIONS = [
    {
        "exception_id": "EXC-1001",
        "transaction_id": "TXN-9021",
        "category": "DUPLICATE_TRANSACTION",
        "severity": "CRITICAL",
        "description": "Alpha Supplies Corp ₹4.85L invoice matches previous payment TXN-9020.",
        "expected_value": "₹0.00 (Single Payment)",
        "actual_value": "₹4,85,000.00 (Duplicate Request)",
        "confidence": 91,
        "recommended_action": "Reject duplicate payment request and issue vendor notice.",
        "status": "OPEN"
    },
    {
        "exception_id": "EXC-1002",
        "transaction_id": "TXN-9019",
        "category": "AMOUNT_MISMATCH",
        "severity": "HIGH",
        "description": "Global Media Ads marketing spend ₹8.50L exceeded budget cap of ₹7.14L.",
        "expected_value": "₹7,14,000.00",
        "actual_value": "₹8,50,000.00 (+₹1.36L variance)",
        "confidence": 88,
        "recommended_action": "Require Marketing VP sign-off before approving overrun.",
        "status": "UNDER_REVIEW"
    },
    {
        "exception_id": "EXC-1003",
        "transaction_id": "INV-REC-904",
        "category": "MISSING_PAYMENT",
        "severity": "MEDIUM",
        "description": "ABC Corp Enterprise receivable ₹18.0L overdue by 11 days.",
        "expected_value": "₹18,00,000.00 Inflow",
        "actual_value": "₹0.00 Received",
        "confidence": 72,
        "recommended_action": "Initiate automated payment reminder and collection call.",
        "status": "OPEN"
    },
    {
        "exception_id": "EXC-1004",
        "transaction_id": "TXN-8001",
        "category": "VENDOR_MISMATCH",
        "severity": "HIGH",
        "description": "Velocity Logistics billing rate +18.4% above master service agreement rate.",
        "expected_value": "₹12,00,000.00",
        "actual_value": "₹14,20,000.00",
        "confidence": 82,
        "recommended_action": "Request updated freight rate card from logistics manager.",
        "status": "OPEN"
    },
    {
        "exception_id": "EXC-1005",
        "transaction_id": "TXN-6003",
        "category": "TAX_MISMATCH",
        "severity": "MEDIUM",
        "description": "FreshToHome raw material GST recorded at ₹1.45L vs expected ₹2.01L (18%).",
        "expected_value": "₹2,01,600.00 GST",
        "actual_value": "₹1,45,000.00 GST",
        "confidence": 94,
        "recommended_action": "Validate GST tax invoice before submitting GSTR-2B credit.",
        "status": "OPEN"
    }
]

@router.get("")
@router.get("/")
def get_exceptions(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    org_name: str = Query("NovaTech AI Systems"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns list of categorized financial exceptions with severity and recommended actions.
    """
    results = MOCK_EXCEPTIONS
    
    if status and status != "All":
        results = [e for e in results if e["status"].upper() == status.upper()]
        
    if category and category != "All":
        results = [e for e in results if category.upper() in e["category"].upper()]
        
    open_count = sum(1 for e in MOCK_EXCEPTIONS if e["status"] == "OPEN")
    under_review = sum(1 for e in MOCK_EXCEPTIONS if e["status"] == "UNDER_REVIEW")
    resolved_count = sum(1 for e in MOCK_EXCEPTIONS if e["status"] == "RESOLVED")
    
    return {
        "organization": org_name,
        "total_exceptions": len(MOCK_EXCEPTIONS),
        "open_count": open_count,
        "under_review_count": under_review,
        "resolved_count": resolved_count,
        "exceptions": results
    }

@router.get("/{exception_id}")
def get_exception_detail(
    exception_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    for e in MOCK_EXCEPTIONS:
        if e["exception_id"].upper() == exception_id.upper():
            return e
    raise HTTPException(status_code=404, detail="Exception record not found")

@router.post("/{exception_id}/resolve")
def resolve_exception(
    exception_id: str,
    resolution_note: str = Query("Resolved by Finance Manager"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    for e in MOCK_EXCEPTIONS:
        if e["exception_id"].upper() == exception_id.upper():
            e["status"] = "RESOLVED"
            audit = AuditLog(
                organization_id=1,
                user_email="cfo@finpilot.ai",
                action="RESOLVE_EXCEPTION",
                details=f"Resolved exception {exception_id}: {resolution_note}"
            )
            db.add(audit)
            db.commit()
            return {"status": "SUCCESS", "message": f"Exception {exception_id} marked as RESOLVED.", "exception": e}
            
    raise HTTPException(status_code=404, detail="Exception ID not found")
