import datetime
import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Wallet, BankAccount, Transaction, AuditLog, Organization

router = APIRouter(prefix="/wallet", tags=["Wallet"])

@router.get("/")
def get_wallet_overview(db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
    banks = db.query(BankAccount).filter(BankAccount.organization_id == 1).all()
    txns = db.query(Transaction).filter(Transaction.organization_id == 1).order_by(Transaction.date.desc()).limit(10).all()

    return {
        "available_balance": wallet.available_balance if wallet else 48254300.0,
        "pending_balance": wallet.pending_balance if wallet else 6421000.0,
        "reserved_cash": wallet.reserved_cash if wallet else 8000000.0,
        "total_receivables": wallet.total_receivables if wallet else 12400000.0,
        "total_payables": wallet.total_payables if wallet else 7800000.0,
        "currency": "INR",
        "bank_accounts": [
            {
                "id": b.id,
                "bank_name": b.bank_name,
                "account_number": b.account_number,
                "account_type": b.account_type,
                "balance": b.balance,
                "is_primary": b.is_primary
            } for b in banks
        ] if banks else [],
        "corporate_cards": [
            {"id": "CARD-01", "name": "FinPilot Executive Platinum", "number_ending": "8821", "limit": 2500000.0, "used": 485000.0, "status": "Active"},
            {"id": "CARD-02", "name": "Engineering Operations Card", "number_ending": "4109", "limit": 1000000.0, "used": 284000.0, "status": "Active"}
        ],
        "recent_activity": [
            {
                "id": t.txn_id,
                "description": t.description,
                "vendor_or_customer": t.vendor_or_customer,
                "amount": t.amount,
                "txn_type": t.txn_type,
                "date": t.date.strftime("%Y-%m-%d"),
                "status": t.status
            } for t in txns
        ] if txns else []
    }

@router.post("/send-money")
def send_money(payload: dict, db: Session = Depends(get_db)):
    amount = float(payload.get("amount", 0.0))
    recipient = payload.get("recipient", "Vendor")
    category = payload.get("category", "Vendor Payments")
    department = payload.get("department", "Operations")
    txn_type = payload.get("txn_type", "OUTFLOW").upper()

    rnd_suffix = random.randint(10000, 99999)
    new_txn_id = f"TXN-{rnd_suffix}"

    risk_score = 15
    if amount > 500000:
        risk_score += 40
    if "Alpha" in recipient:
        risk_score += 45

    status = "Flagged" if risk_score >= 70 else "Completed"
    ai_decision = "Flagged for Review" if risk_score >= 70 else "Auto-approved"
    desc = f"Direct Transfer to {recipient}" if txn_type == "OUTFLOW" else f"Funds Received from {recipient}"

    txn = Transaction(
        txn_id=new_txn_id,
        organization_id=1,
        date=datetime.datetime.utcnow(),
        description=desc,
        txn_type=txn_type,
        category=category,
        vendor_or_customer=recipient,
        amount=amount,
        payment_method="Bank Transfer",
        department=department,
        risk_score=risk_score,
        status=status,
        ai_decision=ai_decision,
        ai_explanation=f"{txn_type.title()} payment of ₹{amount:,.2f} executed via corporate banking gateway."
    )
    db.add(txn)

    wallet = db.query(Wallet).filter(Wallet.organization_id == 1).first()
    org = db.query(Organization).filter(Organization.id == 1).first()
    
    if txn_type == "OUTFLOW":
        if wallet:
            wallet.available_balance = max(0.0, wallet.available_balance - amount)
        if org:
            org.current_cash = max(0.0, org.current_cash - amount)
    else:
        if wallet:
            wallet.available_balance += amount
        if org:
            org.current_cash += amount

    log = AuditLog(
        organization_id=1,
        user_email="cfo@novatech.ai",
        action="SEND_MONEY",
        details=f"Executed {txn_type} ₹{amount:,.2f} for {recipient} (Txn: {new_txn_id})"
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
        "txn_id": new_txn_id,
        "amount": amount,
        "recipient": recipient,
        "txn_type": txn_type,
        "message": f"Payment of ₹{amount:,.2f} to {recipient} executed and logged in database!",
        "transaction": {
            "id": txn.id,
            "txn_id": txn.txn_id,
            "date": txn.date.strftime("%Y-%m-%d"),
            "description": txn.description,
            "txn_type": txn.txn_type,
            "category": txn.category,
            "vendor_or_customer": txn.vendor_or_customer,
            "amount": txn.amount,
            "payment_method": txn.payment_method,
            "department": txn.department,
            "risk_score": txn.risk_score,
            "status": txn.status,
            "ai_decision": txn.ai_decision,
            "ai_explanation": txn.ai_explanation
        }
    }
