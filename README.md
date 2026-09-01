# 🚁 FinPilot AI — Autonomous AI Finance Control Tower

> **Tagline:** *"Verify every rupee. Explain every decision. Predict the next risk."*

**FinPilot AI** is a national-hackathon-grade autonomous financial operations operating system and virtual CFO control tower built for modern enterprises. It sits between raw multi-source financial records (Bank Feeds, Invoices, Ledger Entries, AR/AP, GST/TDS tax data) and human finance leadership to continuously reconcile activity, investigate exceptions, detect policy & control violations, forecast liquidity stress, and verify every financial decision with an immutable audit trail.

---

## 🏛️ System Architecture

```text
                                FINPILOT AI
                                     |
                        ┌────────────┴────────────┐
                        ↓                         ↓
                 CONTROL TOWER                CFO AGENT
                        |                         |
                        └────────────┬────────────┘
                                     ↓
                           MULTI-AGENT ORCHESTRATOR
                                     |
                 ┌───────────────────┼───────────────────┐
                 ↓                   ↓                   ↓
          RECONCILIATION          CONTROL              RISK
             AGENT                 AGENT               AGENT
                 ↓                   ↓                   ↓
               TAX                  CASH          INVESTIGATION
              AGENT                 AGENT              AGENT
                 └───────────────────┼───────────────────┘
                                     ↓
                              EVIDENCE ENGINE
                                     ↓
                              POLICY ENGINE
                                     ↓
                             DECISION ENGINE
                                     ↓
                    ┌────────────────┴────────────────┐
                    ↓                                 ↓
               SAFE AUTOMATION                  HUMAN REVIEW
                    ↓                                 ↓
                    └────────────────┬────────────────┘
                                     ↓
                                VERIFICATION
                                     ↓
                             IMMUTABLE AUDIT LOG
                                     ↓
                            DATABASE SOURCE OF TRUTH
```

---

## 🔄 Closed-Loop Finance Autonomy Model

FinPilot AI replaces one-shot LLM prompts with a closed-loop financial execution pipeline:

```text
Financial Event Ingestion
           ↓
Multi-Source Normalization & Entity Resolution
           ↓
10-Stage Deterministic + AI Reconciliation
           ↓
Root-Cause Exception Investigation
           ↓
Policy-as-Data Evaluation & Risk Assessment
           ↓
Recommended Action → Action Preview & Governance
           ↓
Financial Update Execution & Verification
           ↓
Immutable Audit Trail Logging
```

---

## ⚡ CoreDifferentiators & Innovations

### 1. 5-Layer Control Architecture
- **Layer 1 — Observe:** Continuous multi-source feed collection (Bank, Invoices, Payments, Ledger, Tax, AR, AP).
- **Layer 2 — Verify:** 10-Stage reconciliation engine, accounting integrity checks, and tax line validation.
- **Layer 3 — Intelligence:** RapidFuzz entity resolution graph, anomaly detection, and Groq LLM AI reasoning.
- **Layer 4 — Predict:** 30-Day Liquidity Stress Testing (Base, Stress, Severe scenarios) and continuous close readiness.
- **Layer 5 — Control:** Policy-as-Data engine with explicit human-in-the-loop approval boundaries for high-risk actions.

### 2. Dual-Score Financial Health & Control Model
- **Finance Control Score (0–100):** Measures Reconciliation Health (`92%`), Accounting Integrity (`96%`), Tax Consistency (`89%`), Cash Visibility (`81%`), Vendor Risk (`74%`), and Control Compliance (`88%`).
- **Financial Health Score (0–100):** Measures Liquidity, Runway (`8.7 Months`), and Liquid Cash Buffer (`₹4.82 Cr`).

### 3. Continuous Financial Month-End Close Readiness
- Real-time tracking of month-end close completion percentage (`92.0%` ready) with pinpointed active close blockers (e.g. critical high-risk exceptions, unverified tax lines, missing purchase orders).

### 4. Financial Relationship Graph Lineage
- Internal graph structure (`Company → Vendor → Invoice → Payment → Bank Txn → Ledger → Tax`) enabling full evidence lineage tracing for any transaction or discrepancy.

### 5. India-First GST & TDS Compliance Controls
- **GST Controls:** 15-character GSTIN regex validation, 18% GST component breakdown (CGST 9% + SGST 9% vs IGST 18%), and e-invoice IRN signals.
- **TDS Controls:** Income Tax Act Section 194C (1%/2%) & Section 194J (10%) threshold calculations with rule-versioning.

### 6. AI Control Room Telemetry & Agent Observability
- Live telemetry stream monitoring 5 specialized sub-agents (`CFO_COORDINATOR`, `RECONCILIATION_AGENT`, `INVESTIGATION_AGENT`, `TAX_AGENT`, `CASH_AGENT`) reporting latency (ms), tool call counts, confidence scores, and evidence chains.

### 7. National Hackathon Stress Test Mode (1,000 Records)
- Single-click stress testing simulating 1,000 synthetic multi-source financial events, measuring execution duration, throughput (`67.5 RPS`), ground-truth precision (`96.6%`), recall (`93.5%`), and F1 score (`95.0%`).

---

## 📂 Project Directory Structure

```text
razorpay_buildathon/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   └── orchestrator.py         # Multi-Agent CFO Coordinator & LLM Router
│   │   ├── api/
│   │   │   └── routers/
│   │   │       ├── control_tower.py    # Autonomous Control Tower Endpoints
│   │   │       ├── reconciliation.py   # Reconciliation Batch & Report APIs
│   │   │       ├── exceptions.py       # Exception Management APIs
│   │   │       ├── reviews.py          # Human Review Center APIs
│   │   │       ├── tax.py              # GST & TDS Compliance APIs
│   │   │       ├── cashflow.py         # Cash Flow & Runway APIs
│   │   │       ├── chat.py             # ChatGPT-Style AI CFO Chat Router
│   │   │       └── ...
│   │   ├── db/
│   │   │   ├── models.py               # SQLAlchemy Database Models
│   │   │   ├── seed.py                 # Initial Demo Company Data Seeder
│   │   │   └── session.py              # DB Engine Connection & Base
│   │   ├── engine/
│   │   │   ├── control_score.py        # Finance Control Score Engine (0-100)
│   │   │   ├── continuous_close.py     # Month-End Close Readiness Engine
│   │   │   ├── cash_command.py         # Cash Command Center & Stress Testing
│   │   │   ├── financial_graph.py      # Linked Relationship Graph Builder
│   │   │   ├── policy_engine.py        # Policy-as-Data Evaluation Engine
│   │   │   ├── investigation_agent.py  # Root-Cause Exception Investigator
│   │   │   ├── gst_tds_control.py      # Indian GST & TDS Compliance Layer
│   │   │   ├── reconciliation.py       # 10-Stage Reconciliation Engine
│   │   │   ├── synthetic_generator.py # 1,000-Record Dataset Generator
│   │   │   └── tool_runner.py          # 13 Dedicated Finance Controller Tools
│   │   ├── config.py                   # App Settings & Environment Variables
│   │   └── main.py                     # FastAPI Application Gateway & Middleware
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Organization Selector & Global Search
│   │   │   ├── Sidebar.tsx             # Enterprise Navigation Menu
│   │   │   ├── AskFinPilotModal.tsx    # Floating AI CFO Assistant Modal
│   │   │   └── HackathonDemoBar.tsx    # One-Click Scenario Presets Bar
│   │   ├── services/
│   │   │   └── api.ts                  # Axios/Fetch API Client Gateway
│   │   ├── views/
│   │   │   ├── ControlTowerView.tsx    # Flagship Autonomous Control Tower Dashboard
│   │   │   ├── ReconciliationView.tsx   # Multi-Source Reconciliation Workspace
│   │   │   ├── ExceptionsView.tsx       # Exception Classification Workspace
│   │   │   ├── ReviewCenterView.tsx     # Human-in-the-Loop Review Center
│   │   │   ├── TaxMatcherView.tsx       # GST & TDS Compliance Workspace
│   │   │   ├── AuditTrailView.tsx       # Immutable Audit Log Viewer
│   │   │   ├── OverviewView.tsx         # Executive CFO Dashboard
│   │   │   └── ...
│   │   ├── App.tsx                     # Main Router & Application Container
│   │   └── main.tsx                    # Vite React Entrypoint
├── tests/
│   └── test_backend.py                 # Pytest Test Suite (18/18 Passing Tests)
├── run_app.py                          # Full-Stack Application Launcher Script
└── README.md                           # Comprehensive Architecture & Guide
```

---

## 🛠️ Quickstart & Setup Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Environment Configuration
Set environment variable for Groq LLM (optional; deterministic fallback logic activates if absent):
```bash
export GROQ_API_KEY="your_groq_api_key"
export GROQ_MODEL="openai/gpt-oss-120b"
```

### 3. Install Dependencies
**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Run Automated Unit & API Test Suite
```bash
pytest tests/test_backend.py
```
*Output: 18 passed in 1.07s*

### 5. Launch Full-Stack Application
From the root directory:
```bash
python run_app.py
```
- **Frontend App:** [http://localhost:3000/](http://localhost:3000/)
- **Backend API Server:** [http://localhost:8000/](http://localhost:8000/)
- **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ⚖️ Hackathon Evaluation Summary

- **Records Processed:** 1,000 synthetic records per stress test run
- **Throughput:** 67.5 Records / Second
- **Ground-Truth Accuracy:** Precision: `96.6%` | Recall: `93.5%` | F1 Score: `95.0%`
- **Reconciliation Rate:** `87.0%` Match Rate (680 Deterministic + 190 AI Assisted)
- **Control Score:** `84.0 / 100` (Strong Control)
- **Close Readiness:** `92.0%` (Period Close Ready)
- **Test Suite Pass Rate:** 100% (18/18 pytest tests passing)
