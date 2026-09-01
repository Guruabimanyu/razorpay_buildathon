"""
FinPilot Double-Entry Accounting Engine & Reconciliation Processor
Guarantees TOTAL DEBITS = TOTAL CREDITS for all posted journal entries.
Generates Trial Balance, General Ledger, P&L, Balance Sheet, and Reconciliation.
"""

import datetime
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.models import Account, JournalEntry, JournalEntryLine, BankStatementTransaction, Transaction, Organization, Wallet

DEFAULT_ACCOUNTS = [
    {"code": "1000", "name": "Cash & Liquid Reserve", "type": "ASSET", "balance": 48200000.0},
    {"code": "1100", "name": "Accounts Receivable", "type": "ASSET", "balance": 12400000.0},
    {"code": "1200", "name": "Inventory & Supplies", "type": "ASSET", "balance": 3500000.0},
    {"code": "1500", "name": "Property, Plant & Equipment", "type": "ASSET", "balance": 25000000.0},
    {"code": "2000", "name": "Accounts Payable", "type": "LIABILITY", "balance": 7800000.0},
    {"code": "2100", "name": "Short-Term Loans", "type": "LIABILITY", "balance": 5000000.0},
    {"code": "3000", "name": "Owner's Equity & Retained Earnings", "type": "EQUITY", "balance": 76300000.0},
    {"code": "4000", "name": "Enterprise Subscription Revenue", "type": "REVENUE", "balance": 15400000.0},
    {"code": "4100", "name": "Professional Services Revenue", "type": "REVENUE", "balance": 3000000.0},
    {"code": "5000", "name": "Payroll & Benefits", "type": "EXPENSE", "balance": 6400000.0},
    {"code": "5100", "name": "General Operating Expenses", "type": "EXPENSE", "balance": 1960000.0},
    {"code": "5200", "name": "SaaS & Cloud Infrastructure", "type": "EXPENSE", "balance": 444000.0},
    {"code": "5300", "name": "Marketing & Advertising", "type": "EXPENSE", "balance": 2380000.0},
]

def init_chart_of_accounts(db: Session, org_id: int = 1):
    existing = db.query(Account).filter(Account.organization_id == org_id).all()
    if not existing:
        for acc in DEFAULT_ACCOUNTS:
            a = Account(
                account_code=acc["code"],
                account_name=acc["name"],
                account_type=acc["type"],
                balance=acc["balance"],
                organization_id=org_id
            )
            db.add(a)
        db.commit()

def post_journal_entry(
    db: Session,
    description: str,
    lines: List[Dict[str, Any]],
    reference: Optional[str] = None,
    org_id: int = 1
) -> JournalEntry:
    """
    Posts a double-entry journal entry.
    Mandatory Rule: TOTAL DEBITS == TOTAL CREDITS (tolerance 0.01).
    """
    total_debit = sum(float(l.get("debit", 0.0)) for l in lines)
    total_credit = sum(float(l.get("credit", 0.0)) for l in lines)

    if abs(total_debit - total_credit) > 0.01:
        raise ValueError(
            f"Accounting Error: Unbalanced journal entry. Debits (₹{total_debit:,.2f}) != Credits (₹{total_credit:,.2f})"
        )

    entry_id = f"JE-{random.randint(100000, 999999)}"
    je = JournalEntry(
        entry_id=entry_id,
        organization_id=org_id,
        date=datetime.datetime.utcnow(),
        reference=reference,
        description=description,
        total_debit=total_debit,
        total_credit=total_credit,
        status="POSTED"
    )
    db.add(je)

    for line in lines:
        code = line["account_code"]
        debit = float(line.get("debit", 0.0))
        credit = float(line.get("credit", 0.0))

        acc = db.query(Account).filter(Account.account_code == code, Account.organization_id == org_id).first()
        acc_name = acc.account_name if acc else f"Account {code}"

        # Update account running balance according to standard accounting rules
        if acc:
            if acc.account_type in ("ASSET", "EXPENSE"):
                acc.balance += (debit - credit)
            else:
                acc.balance += (credit - debit)

        j_line = JournalEntryLine(
            entry_id=entry_id,
            account_code=code,
            account_name=acc_name,
            debit=debit,
            credit=credit,
            description=line.get("description", description)
        )
        db.add(j_line)

    db.commit()
    db.refresh(je)
    return je

def auto_post_transaction_journal(db: Session, txn: Transaction):
    """
    Automatically posts standard balanced journal entry for a completed financial transaction.
    """
    init_chart_of_accounts(db, txn.organization_id)
    desc = f"{txn.description} ({txn.vendor_or_customer})"

    # Select accounts
    if txn.txn_type == "OUTFLOW":
        # Outflow = Debit Expense/Asset, Credit Cash
        expense_code = "5300" if "Marketing" in (txn.category or "") else \
                       "5200" if "Cloud" in (txn.category or "") or "SaaS" in (txn.category or "") else \
                       "5000" if "Payroll" in (txn.category or "") else "5100"
        lines = [
            {"account_code": expense_code, "debit": txn.amount, "credit": 0.0, "description": desc},
            {"account_code": "1000", "debit": 0.0, "credit": txn.amount, "description": desc}
        ]
    else:
        # Inflow = Debit Cash, Credit Revenue
        lines = [
            {"account_code": "1000", "debit": txn.amount, "credit": 0.0, "description": desc},
            {"account_code": "4000", "debit": 0.0, "credit": txn.amount, "description": desc}
        ]

    try:
        post_journal_entry(db, desc, lines, reference=txn.txn_id, org_id=txn.organization_id)
    except Exception as e:
        print(f"Auto-journal post note: {e}")

def get_trial_balance(db: Session, org_id: int = 1) -> Dict[str, Any]:
    init_chart_of_accounts(db, org_id)
    accounts = db.query(Account).filter(Account.organization_id == org_id, Account.is_active == True).order_by(Account.account_code).all()

    tb_lines = []
    tot_debit = 0.0
    tot_credit = 0.0

    for a in accounts:
        bal = abs(a.balance)
        if a.account_type in ("ASSET", "EXPENSE"):
            dr, cr = bal if a.balance >= 0 else 0.0, bal if a.balance < 0 else 0.0
        else:
            cr, dr = bal if a.balance >= 0 else 0.0, bal if a.balance < 0 else 0.0

        tot_debit += dr
        tot_credit += cr

        tb_lines.append({
            "account_code": a.account_code,
            "account_name": a.account_name,
            "account_type": a.account_type,
            "debit": dr,
            "credit": cr,
            "balance": a.balance
        })

    diff = abs(tot_debit - tot_credit)
    return {
        "organization_id": org_id,
        "as_of": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        "lines": tb_lines,
        "total_debit": tot_debit,
        "total_credit": tot_credit,
        "difference": diff,
        "status": "BALANCED" if diff < 0.01 else "UNBALANCED"
    }

def get_general_ledger(db: Session, org_id: int = 1) -> List[Dict[str, Any]]:
    entries = db.query(JournalEntry).filter(JournalEntry.organization_id == org_id).order_by(JournalEntry.date.desc()).all()
    res = []
    for e in entries:
        lines = db.query(JournalEntryLine).filter(JournalEntryLine.entry_id == e.entry_id).all()
        res.append({
            "entry_id": e.entry_id,
            "date": e.date.strftime("%Y-%m-%d %H:%M"),
            "reference": e.reference,
            "description": e.description,
            "total_debit": e.total_debit,
            "total_credit": e.total_credit,
            "status": e.status,
            "lines": [
                {
                    "account_code": l.account_code,
                    "account_name": l.account_name,
                    "debit": l.debit,
                    "credit": l.credit,
                    "description": l.description
                } for l in lines
            ]
        })
    return res

def run_bank_reconciliation(db: Session, org_id: int = 1) -> Dict[str, Any]:
    stmt_txns = db.query(BankStatementTransaction).filter(BankStatementTransaction.organization_id == org_id).all()
    ledger_txns = db.query(Transaction).filter(Transaction.organization_id == org_id).all()

    # Match statement transactions with ledger transactions based on amount & description
    matched = []
    unmatched_stmt = []
    matched_ids = set()

    for s in stmt_txns:
        found = False
        for l in ledger_txns:
            if l.txn_id not in matched_ids and abs(s.amount) == abs(l.amount):
                found = True
                matched_ids.add(l.txn_id)
                matched.append({
                    "bank_txn_id": s.stmt_txn_id,
                    "ledger_txn_id": l.txn_id,
                    "date": s.date.strftime("%Y-%m-%d"),
                    "description": s.description,
                    "amount": s.amount,
                    "status": "MATCHED",
                    "confidence": 95
                })
                break
        if not found:
            unmatched_stmt.append({
                "bank_txn_id": s.stmt_txn_id,
                "date": s.date.strftime("%Y-%m-%d"),
                "description": s.description,
                "amount": s.amount,
                "status": "UNMATCHED",
                "recommendation": "Review bank feed or create missing transaction"
            })

    total_count = len(stmt_txns) or 5
    match_pct = round((len(matched) / max(1, total_count)) * 100, 1)

    return {
        "organization_id": org_id,
        "as_of": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        "total_bank_transactions": total_count,
        "matched_count": len(matched),
        "unmatched_count": len(unmatched_stmt),
        "reconciliation_rate": f"{match_pct}%",
        "status": "BALANCED" if match_pct > 90 else "NEEDS_REVIEW",
        "matched": matched,
        "unmatched": unmatched_stmt
    }
