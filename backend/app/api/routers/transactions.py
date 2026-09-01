import datetime
import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.db.models import Transaction, Wallet, Organization, AuditLog, TransactionEvent, IdempotencyKey
from app.engine.anomaly import detect_transaction_anomalies

router = APIRouter(prefix="/transactions", tags=["Transactions"])

class CreateTransactionRequest(BaseModel):
    description: str
    amount: float
    vendor_or_customer: str
    category: str = "Operating Expenses"
    department: str = "Administration"
    payment_method: str = "Bank Transfer"
    txn_type: str = "OUTFLOW"
    idempotency_key: Optional[str] = None

class UpdateActionRequest(BaseModel):
    status: str # Completed, Approved, Rejected, Flagged
    user: str = "CFO Sarah Jenkins"

@router.get("/")
def get_transactions(
    search: Optional[str] = None,
    category: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.organization_id == 1)

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(Transaction.description.ilike(s) | Transaction.vendor_or_customer.ilike(s) | Transaction.txn_id.ilike(s))
    if category and category != "All":
        query = query.filter(Transaction.category == category)
    if department and department != "All":
        query = query.filter(Transaction.department == department)
    if status and status != "All":
        query = query.filter(Transaction.status == status)

    raw_txns = query.order_by(Transaction.date.desc()).all()

    formatted = [
        {
            "id": t.id,
            "txn_id": t.txn_id,
            "date": t.date.strftime("%Y-%m-%d"),
            "description": t.description,
            "txn_type": t.txn_type,
            "category": t.category,
            "vendor_or_customer": t.vendor_or_customer,
            "amount": t.amount,
            "payment_method": t.payment_method,
            "department": t.department,
            "risk_score": t.risk_score,
            "status": t.status,
            "ai_decision": t.ai_decision,
            "ai_explanation": t.ai_explanation
        } for t in raw_txns
    ]

    analyzed_txns = detect_transaction_anomalies(formatted)
    return {
        "total_count": len(analyzed_txns),
        "transactions": analyzed_txns
    }

@router.post("/create")
def create_transaction(req: CreateTransactionRequest, db: Session = Depends(get_db)):
    # Check Idempotency Key
    if req.idempotency_key:
        existing_key = db.query(IdempotencyKey).filter(IdempotencyKey.key == req.idempotency_key).first()
        if existing_key:
            return {"status": "SUCCESS", "message": "Transaction already processed (Idempotent)", "is_duplicate": True}

    rnd_suffix = random.randint(10000, 99999)
    new_txn_id = f"TXN-{rnd_suffix}"
    
    risk_score = 15
    if req.amount > 500000:
        risk_score += 40
    if "Alpha" in req.vendor_or_customer:
        risk_score += 45

    status = "Flagged" if risk_score >= 70 else "Completed"
    ai_decision = "Flagged for Review" if risk_score >= 70 else "Auto-approved"
    ai_explanation = f"New {req.txn_type.lower()} of ₹{req.amount:,.2f} recorded for {req.vendor_or_customer}."

    txn = Transaction(
        txn_id=new_txn_id,
        organization_id=1,
        date=datetime.datetime.utcnow(),
        description=req.description,
        txn_type=req.txn_type,
        category=req.category,
        vendor_or_customer=req.vendor_or_customer,
        amount=req.amount,
        payment_method=req.payment_method,
        department=req.department,
        risk_score=risk_score,
        status=status,
        ai_decision=ai_decision,
        ai_explanation=ai_explanation
    )
    db.add(txn)

    # Add Transaction Event Log
    event = TransactionEvent(
        transaction_id=new_txn_id,
        organization_id=1,
        event_type="CREATED",
        from_status=None,
        to_status=status,
        event_metadata={"amount": req.amount, "vendor": req.vendor_or_customer},
        created_by="System AI Engine"
    )
    db.add(event)

    wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
    org = db.query(Organization).filter(Organization.id == 1).first()
    
    if req.txn_type == "OUTFLOW":
        if wallet:
            wallet.available_balance = max(0.0, wallet.available_balance - req.amount)
        if org:
            org.current_cash = max(0.0, org.current_cash - req.amount)
    else:
        if wallet:
            wallet.available_balance += req.amount
        if org:
            org.current_cash += req.amount

    if req.idempotency_key:
        db.add(IdempotencyKey(key=req.idempotency_key, response_json=f'{{"txn_id": "{new_txn_id}"}}'))

    log = AuditLog(
        organization_id=1,
        user_email="cfo@novatech.ai",
        action="CREATE_TRANSACTION",
        details=f"Created {req.txn_type} transaction {new_txn_id} for ₹{req.amount:,.2f}"
    )
    db.add(log)

    db.commit()
    db.refresh(txn)

    # Auto-post double entry journal to General Ledger if transaction completed or approved
    if txn.status in ("Completed", "Approved"):
        from app.engine.accounting import auto_post_transaction_journal
        auto_post_transaction_journal(db, txn)

    return {
        "status": "SUCCESS",
        "message": f"Transaction {new_txn_id} created successfully!",
        "transaction": {
            "id": txn.id,
            "txn_id": txn.txn_id,
            "date": txn.date.strftime("%Y-%m-%d"),
            "description": txn.description,
            "amount": txn.amount,
            "vendor_or_customer": txn.vendor_or_customer,
            "status": txn.status,
            "risk_score": txn.risk_score
        }
    }

@router.post("/{txn_id}/action")
def update_transaction_status(txn_id: str, req: UpdateActionRequest, db: Session = Depends(get_db)):
    # Accept both txn_id string ("TXN-XXXX") and numeric id
    txn = db.query(Transaction).filter(Transaction.txn_id == txn_id).first()
    if not txn and txn_id.isdigit():
        txn = db.query(Transaction).filter(Transaction.id == int(txn_id)).first()

    if not txn:
        return {"status": "NOT_FOUND", "message": f"Transaction {txn_id} not found in database."}

    old_status = txn.status
    new_status = req.status

    # Validate allowed transitions
    ALLOWED = {"Approved", "Rejected", "Flagged", "Under Review", "Completed"}
    if new_status not in ALLOWED:
        return {"status": "ERROR", "message": f"Invalid status '{new_status}'. Allowed: {', '.join(ALLOWED)}"}

    txn.status = new_status
    txn.ai_decision = (
        f"Approved by {req.user}" if new_status == "Approved" else
        f"Blocked & Rejected by {req.user}" if new_status == "Rejected" else
        f"Flagged for Review by {req.user}" if new_status == "Under Review" else
        f"Status {new_status} by {req.user}"
    )
    txn.ai_explanation = (
        f"Transaction manually approved by {req.user} after executive review."
        if new_status == "Approved" else
        f"Transaction rejected and blocked by {req.user} — payment will not be processed."
        if new_status == "Rejected" else
        f"Transaction status updated to {new_status} by {req.user}."
    )

    # Record Event Log
    event = TransactionEvent(
        transaction_id=txn.txn_id,
        organization_id=txn.organization_id,
        event_type=f"STATUS_{new_status.replace(' ', '_').upper()}",
        from_status=old_status,
        to_status=new_status,
        event_metadata={"updated_by": req.user},
        created_by=req.user
    )
    db.add(event)

    # Rebalance Wallet / Org Cash on Status Change
    wallet = db.query(Wallet).filter(Wallet.organization_id == txn.organization_id).first()
    org = db.query(Organization).filter(Organization.id == txn.organization_id).first()

    if txn.txn_type == "OUTFLOW":
        if new_status == "Rejected" and old_status != "Rejected":
            # Refund blocked outflow money back to wallet & cash
            if wallet:
                wallet.available_balance += txn.amount
            if org:
                org.current_cash += txn.amount
        elif old_status == "Rejected" and new_status in ("Approved", "Completed", "Flagged"):
            # Re-deduct if unblocked
            if wallet:
                wallet.available_balance = max(0.0, wallet.available_balance - txn.amount)
            if org:
                org.current_cash = max(0.0, org.current_cash - txn.amount)

    # If approved, post journal entry to General Ledger
    if new_status in ("Completed", "Approved"):
        from app.engine.accounting import auto_post_transaction_journal
        auto_post_transaction_journal(db, txn)

    log = AuditLog(
        organization_id=1,
        user_email=req.user,
        action=f"TXN_{new_status.replace(' ', '_').upper()}",
        details=(
            f"Transaction {txn.txn_id} ({txn.vendor_or_customer}, ₹{txn.amount:,.0f}) "
            f"status changed from '{old_status}' → '{new_status}' by {req.user}"
        )
    )
    db.add(log)
    db.commit()
    db.refresh(txn)

    return {
        "status": "SUCCESS",
        "message": (
            f"✅ Transaction {txn.txn_id} has been Approved." if new_status == "Approved"
            else f"🚫 Transaction {txn.txn_id} has been Rejected & Blocked."
            if new_status == "Rejected"
            else f"Transaction {txn.txn_id} updated to {new_status}."
        ),
        "txn_id": txn.txn_id,
        "new_status": txn.status,
        "old_status": old_status,
        "updated_by": req.user,
        "amount": txn.amount,
        "vendor": txn.vendor_or_customer,
    }
