# FinPilot AI — API Specification

The FastAPI backend exposes RESTful endpoints for multi-source financial reconciliation, data ingestion, exception management, human review, cash forecasting, tax line matching, audit trail, and AI settlement Q&A.

Base URL: `http://localhost:8000/api`

---

## 1. Reconciliation Engine

### `POST /api/reconciliation/run`
Executes the 10-Stage Multi-Source Reconciliation Engine over a batch of records.
- **Query Params**:
  - `org_name` (string): Target organization (default: `NovaTech AI Systems`).
  - `record_count` (int): Number of records in batch (default: `50`).
- **Response**:
  ```json
  {
    "status": "SUCCESS",
    "organization": "NovaTech AI Systems",
    "metrics": {
      "total_records_processed": 50,
      "matched": 43,
      "review_queue": 4,
      "unresolved": 3,
      "match_rate": 86.0,
      "average_confidence": 94.2,
      "processing_duration_sec": 2.41,
      "throughput_rps": 20.7
    }
  }
  ```

### `GET /api/reconciliation/summary`
Returns high-level summary metrics for executive dashboard reconciliation funnel.

---

## 2. Data Ingestion System

### `POST /api/uploads`
Uploads financial dataset in CSV, XLSX, or JSON format.
- **Form Data**:
  - `file`: Multipart file upload.
  - `source_name`: Feed title (e.g. `HDFC Bank Feed`).
  - `source_type`: `BANK` | `INVOICE` | `LEDGER` | `PAYMENTS` | `RECEIVABLES` | `PAYABLES`.

---

## 3. Exception Engine

### `GET /api/exceptions`
Returns categorized financial exceptions.
- **Query Params**:
  - `status`: `OPEN` | `UNDER_REVIEW` | `RESOLVED` | `All`.
  - `category`: Category string or `All`.

### `POST /api/exceptions/{exception_id}/resolve`
Marks an exception as RESOLVED with resolution notes.

---

## 4. Human Review Center

### `GET /api/reviews`
Returns pending human-in-the-loop review items.

### `POST /api/reviews/action`
Executes human review action (`APPROVE_MATCH`, `REJECT_MATCH`, `MARK_EXCEPTION`, `LINK_RECORDS`).
- **Request Body**:
  ```json
  {
    "review_id": "REV-501",
    "action": "APPROVE_MATCH",
    "notes": "Approved by CFO"
  }
  ```

---

## 5. Cash Position & Forecasting

### `GET /api/cash-position`
Returns liquid cash balance, expected AR inflows, expected AP outflows, and projected 30-day position.

### `GET /api/cash-forecast`
Generates 7, 14, 30-day baseline forecasts with confidence intervals and financial drivers.

---

## 6. Tax-Line Matcher

### `POST /api/tax/validate`
Validates tax calculation for a single invoice subtotal and tax line.

### `GET /api/tax/summary`
Audits database invoices for GST tax discrepancies.

---

## 7. Settlement Q&A & Audit Trail

### `POST /api/qa`
Database-grounded Q&A assistant answering questions about unpaid/overdue invoices with exact ID citations.

### `GET /api/audit-log`
Returns immutable compliance audit trail logs.

### `GET /api/metrics`
Returns system throughput (records/sec), AI calls, AI cost savings, and match accuracy metrics.
