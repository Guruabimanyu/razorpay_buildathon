from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Transaction, AuditLog

router = APIRouter(prefix="/reviews", tags=["Human Review Center"])

REVIEW_QUEUE = [
    {
        "review_id": "REV-501",
        "transaction_id": "TXN-9021",
        "issue": "Duplicate Invoice Suspected",
        "amount": 485000.0,
        "vendor": "Alpha Supplies Corp",
        "confidence": 82,
        "risk_level": "HIGH",
        "recommended_action": "Reject Duplicate Claim",
        "source_record": "INV-2026-881",
        "matched_record": "TXN-9020 (Paid 10-Aug)",
        "status": "PENDING"
    },
    {
        "review_id": "REV-502",
        "transaction_id": "TXN-9019",
        "issue": "Marketing Budget Variance (+19%)",
        "amount": 850000.0,
        "vendor": "Global Media Ads",
        "confidence": 68,
        "risk_level": "MEDIUM",
        "recommended_action": "Approve Budget Overrun",
        "source_record": "PO-MARKETING-882",
        "matched_record": "BANK-TXN-9019",
        "status": "PENDING"
    },
    {
        "review_id": "REV-503",
        "transaction_id": "TXN-8001",
        "issue": "Logistics Rate Surge (+18.4%)",
        "amount": 1420000.0,
        "vendor": "Velocity Logistics",
        "confidence": 78,
        "risk_level": "HIGH",
        "recommended_action": "Link to Contract & Approve",
        "source_record": "FREIGHT-INV-8001",
        "matched_record": "BANK-TXN-8001",
        "status": "PENDING"
    }
]

@router.get("")
@router.get("/")
def get_pending_reviews(
    org_name: str = Query("NovaTech AI Systems"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns pending human-in-the-loop review queue items.
    """
    pending = [r for r in REVIEW_QUEUE if r["status"] == "PENDING"]
    return {
        "organization": org_name,
        "pending_count": len(pending),
        "reviews": pending
    }

@router.post("/action")
def execute_human_review_action(
    review_id: str = Body(..., embed=True),
    action: str = Body(..., embed=True), # APPROVE_MATCH, REJECT_MATCH, MARK_EXCEPTION, LINK_RECORDS, EDIT_MATCH, ESCALATE
    notes: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes a human review decision: APPROVE_MATCH, REJECT_MATCH, MARK_EXCEPTION, LINK_RECORDS, EDIT_MATCH, ESCALATE.
    Logs every action into immutable audit trail.
    """
    found = None
    for r in REVIEW_QUEUE:
        if r["review_id"].upper() == review_id.upper():
            found = r
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Review item not found")
        
    found["status"] = "COMPLETED"
    found["action_taken"] = action
    
    # Audit log entry
    audit = AuditLog(
        organization_id=1,
        user_email="cfo@finpilot.ai",
        action=f"HUMAN_REVIEW_{action}",
        details=f"Human Reviewer executed '{action}' on {review_id} (Txn: {found['transaction_id']}, Vendor: {found['vendor']}, Amount: ₹{found['amount']:,.2f}). Notes: {notes or 'N/A'}"
    )
    db.add(audit)
    
    # Update transaction status in DB if exists
    txn = db.query(Transaction).filter(Transaction.txn_id == found['transaction_id']).first()
    if txn:
        if action in ["APPROVE_MATCH", "LINK_RECORDS"]:
            txn.status = "Completed"
        elif action in ["REJECT_MATCH", "MARK_EXCEPTION"]:
            txn.status = "Rejected"
            
    db.commit()

    return {
        "status": "SUCCESS",
        "review_id": review_id,
        "action": action,
        "message": f"Review {review_id} action '{action}' executed successfully and recorded in audit log."
    }
