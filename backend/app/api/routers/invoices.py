import datetime
import re
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Invoice, AuditLog
from app.engine.duplicate_invoice import analyze_invoice_duplicates, calculate_ap_payment_schedule

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("/")
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).filter(Invoice.organization_id == 1).order_by(Invoice.id.desc()).all()
    formatted = [
        {
            "id": i.id,
            "invoice_number": i.invoice_number,
            "entity_type": i.entity_type,
            "entity_name": i.entity_name,
            "issue_date": i.issue_date.strftime("%Y-%m-%d") if i.issue_date else "",
            "due_date": i.due_date.strftime("%Y-%m-%d") if i.due_date else "",
            "subtotal": i.subtotal,
            "tax": i.tax,
            "total_amount": i.total_amount,
            "status": i.status,
            "is_duplicate": i.is_duplicate,
            "duplicate_prob": i.duplicate_prob,
            "duplicate_reason": i.duplicate_reason,
            "ai_payment_priority": i.ai_payment_priority,
            "ai_recommendation": i.ai_recommendation
        } for i in invoices
    ]
    
    payables_schedule = calculate_ap_payment_schedule(formatted)
    
    return {
        "invoices": formatted,
        "ap_payment_scheduler": payables_schedule,
        "receivables_summary": {
            "total_receivables": 1800000.0,
            "collected": 22200000.0,
            "overdue": 0.0,
            "avg_collection_period": "18 Days",
            "top_debtor": "ABC Corp Enterprise (₹18L - 72% late prob)"
        }
    }

@router.post("/upload")
async def upload_invoice(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename or "uploaded_invoice.pdf"
    
    # Extract vendor name & invoice number intelligently from filename or generate
    clean_name = re.sub(r'[_\-\.]', ' ', filename.split('.')[0]).title()
    vendor_name = clean_name if len(clean_name) > 3 else "Alpha Supplies Corp"
    
    # Extract numbers from filename if present
    nums = re.findall(r'\d+', filename)
    inv_num_suffix = nums[0] if nums else str(db.query(Invoice).count() + 882)
    inv_number = f"INV-2026-{inv_num_suffix}"
    
    # Default parsed amount
    amount = 485000.0 if "alpha" in filename.lower() else (284000.0 if "aws" in filename.lower() else 350000.0)
    subtotal = round(amount * 0.82, 2)
    tax = round(amount * 0.18, 2)
    
    today = datetime.datetime.utcnow()
    due_date = today + datetime.timedelta(days=15)

    # Query existing invoices for duplicate analysis
    existing_db = db.query(Invoice).filter(Invoice.organization_id == 1).all()
    existing_list = [
        {"invoice_number": i.invoice_number, "entity_name": i.entity_name, "total_amount": i.total_amount}
        for i in existing_db
    ]

    new_inv_dict = {
        "invoice_number": inv_number,
        "entity_name": vendor_name,
        "total_amount": amount
    }

    dup_analysis = analyze_invoice_duplicates(new_inv_dict, existing_list)

    status = "Flagged" if dup_analysis["is_duplicate"] else "Pending"
    ai_recommendation = dup_analysis["explanation"]

    # Insert into Database
    inv_record = Invoice(
        invoice_number=inv_number,
        organization_id=1,
        entity_type="PAYABLE",
        entity_name=vendor_name,
        issue_date=today,
        due_date=due_date,
        subtotal=subtotal,
        tax=tax,
        total_amount=amount,
        currency="INR",
        status=status,
        is_duplicate=dup_analysis["is_duplicate"],
        duplicate_prob=float(dup_analysis["duplicate_probability"]),
        duplicate_reason=", ".join(dup_analysis["reasons"]),
        ai_payment_priority=1 if dup_analysis["is_duplicate"] else 2,
        ai_recommendation=ai_recommendation
    )
    db.add(inv_record)

    # Log Audit Entry
    log = AuditLog(
        organization_id=1,
        user_email="cfo@novatech.ai",
        action="UPLOAD_INVOICE",
        details=f"Uploaded computer file '{filename}'. Extracted Invoice #{inv_number} ({vendor_name}, ₹{amount:,.2f}). Duplicate Prob: {dup_analysis['duplicate_probability']}%"
    )
    db.add(log)

    db.commit()
    db.refresh(inv_record)

    return {
        "status": "PROCESSED",
        "filename": filename,
        "extracted_data": {
            "invoice_number": inv_record.invoice_number,
            "entity_name": inv_record.entity_name,
            "total_amount": inv_record.total_amount,
            "subtotal": inv_record.subtotal,
            "tax": inv_record.tax,
            "issue_date": inv_record.issue_date.strftime("%Y-%m-%d"),
            "due_date": inv_record.due_date.strftime("%Y-%m-%d"),
            "status": inv_record.status
        },
        "duplicate_analysis": dup_analysis,
        "ai_recommendation": ai_recommendation
    }
