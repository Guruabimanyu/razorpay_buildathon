# FinPilot AI — Autonomous Finance Controller Architecture

Tagline: **"Reconcile faster. Detect exceptions. Control cash."**

---

## 1. System Overview

FinPilot AI is an autonomous, enterprise-grade digital finance controller that ingests financial records from multiple sources, normalizes entries, resolves entity names, performs 10-stage reconciliation, detects financial exceptions, forecasts cash positions, and maintains an immutable audit trail.

```
                  ┌─────────────────────────────────────┐
                  │          React + Vite Frontend       │
                  │  (Dashboard, Reconciliation, Audit) │
                  └──────────────────┬──────────────────┘
                                     │ REST APIs (JSON)
                  ┌──────────────────▼──────────────────┐
                  │            FastAPI Backend          │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
┌────────▼────────┐        ┌─────────▼────────┐        ┌─────────▼────────┐
│ 10-Stage Engine │        │ Entity Resolution│        │ Settlement Q&A   │
│ Reconciliation  │        │   (RapidFuzz)    │        │  (Database DB)   │
└────────┬────────┘        └─────────┬────────┘        └─────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                         ┌───────────▼───────────┐
                         │   Groq LLM Engine     │
                         │ (Structured JSON AI)  │
                         └───────────┬───────────┘
                                     │
                         ┌───────────▼───────────┐
                         │ SQLAlchemy + SQLite   │
                         │ (Audit, Txns, Ledger) │
                         └───────────────────────┘
```

---

## 2. 10-Stage Multi-Source Reconciliation Pipeline

When processing multi-source batches (BANK, INVOICE, LEDGER, PAYMENTS, RECEIVABLES, PAYABLES), FinPilot AI applies 10 deterministic & AI reasoning stages:

1. **Stage 1 — Exact Reference Matching**: Compares normalized payment/invoice references (30% weight).
2. **Stage 2 — Invoice ID Correlation**: Exact match on invoice numbers.
3. **Stage 3 — Transaction ID Matching**: Correlation of bank transaction IDs.
4. **Stage 4 — Amount Matching**: Exact or near-exact currency match within 0.01 tolerance (25% weight).
5. **Stage 5 — Entity Resolution**: RapidFuzz fuzzy ratio & token sort string comparison for corporate entities (20% weight).
6. **Stage 6 — Date-Window Matching**: Evaluates date differences (0d, 1-3d, 4-7d, >7d) (10% weight).
7. **Stage 7 — Description Token Similarity**: Token sort ratio on line item descriptions (10% weight).
8. **Stage 8 — Cross-Attribute Fuzzy Matching**: Resolves acronyms & typos (5% weight).
9. **Stage 9 — Groq LLM AI Reasoning**: Triggered for ambiguous candidate records (scores 65–88%). Returns strict Pydantic JSON (`decision`, `confidence`, `reason`, `evidence`, `risk_flags`).
10. **Stage 10 — Weighted Confidence Score Calculation**: Calculates final confidence score (0–100%).

### Decision Thresholds
- **90 – 100%**: `AUTO_MATCH`
- **75 – 89%**: `HUMAN_REVIEW`
- **50 – 74%**: `LOW_CONFIDENCE`
- **< 50%**: `UNRESOLVED`

---

## 3. Financial Engines

- **Normalization & Entity Resolution**: Removes corporate suffixes (`Pvt Ltd`, `Inc`, `LLC`, `Corp`, `Technologies`), standardizes dates (ISO YYYY-MM-DD), and calculates fuzzy string similarity.
- **Exception Engine**: Classifies anomalies into 14 categories (`AMOUNT_MISMATCH`, `DUPLICATE_TRANSACTION`, `MISSING_PAYMENT`, `TAX_MISMATCH`, `VENDOR_MISMATCH`, `DATE_MISMATCH`).
- **Human-in-the-Loop Review Center**: Enables finance managers to `APPROVE_MATCH`, `REJECT_MATCH`, `LINK_RECORDS`, or `MARK_EXCEPTION`.
- **Cash Position & Forecasting**: Calculates liquid balance, expected AR inflows, scheduled AP outflows, and baseline 7-day, 14-day, 30-day projections with confidence intervals.
- **Tax-Line Matcher**: Validates `expected_tax = subtotal * tax_rate` vs recorded tax to detect missing GST or tax rate discrepancies.
- **Immutable Audit Trail**: Logs every automated AI decision, human review override, and dataset upload into an immutable compliance table.
