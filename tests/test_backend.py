import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.db.seed import seed_database
from app.engine.health_score import calculate_financial_health_score
from app.engine.runway import calculate_cash_runway
from app.engine.digital_twin import run_financial_digital_twin_simulation
from app.engine.budget_optimizer import optimize_budget_savings
from app.engine.duplicate_invoice import analyze_invoice_duplicates
from app.engine.normalization import normalize_entity_name, calculate_entity_resolution
from app.engine.reconciliation import run_10_stage_reconciliation
from app.engine.synthetic_generator import generate_synthetic_financial_dataset
from app.engine.tax_matcher import validate_invoice_tax
from app.engine.cash_forecaster import forecast_cash_position

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    seed_database()

def test_health_score_calculation():
    score_data = calculate_financial_health_score(48200000.0, 15400000.0, 11200000.0, 98.2, 14.5, 5.2, 3)
    assert 0 <= score_data["overall_score"] <= 100
    assert "breakdown" in score_data
    assert score_data["overall_score"] >= 65

def test_runway_calculation():
    rw = calculate_cash_runway(48200000.0, 15400000.0, 11200000.0)
    assert rw["runway_months"] == 99.0 or rw["runway_months"] > 0

def test_entity_resolution_normalization():
    norm_name = normalize_entity_name("ABC Technologies Pvt. Ltd.")
    assert "ABC" in norm_name
    score, match_type = calculate_entity_resolution("ABC Technologies Pvt Ltd", "ABC Tech Pvt Ltd")
    assert score >= 75.0
    assert match_type in ["HIGH_FUZZY", "EXACT_NORMALIZED", "MEDIUM_FUZZY"]

def test_10_stage_reconciliation_exact_match():
    source = {
        "invoice_number": "INV-2026-101",
        "vendor_or_customer": "Alpha Supplies Corp",
        "amount": 50000.0,
        "date": "2026-08-12",
        "description": "Office Supplies"
    }
    candidate = {
        "invoice_number": "INV-2026-101",
        "entity_name": "Alpha Supplies Corp",
        "total_amount": 50000.0,
        "issue_date": "2026-08-12",
        "description": "Office Supplies"
    }
    res = run_10_stage_reconciliation(source, [candidate])
    assert res["status"] in ["AUTO_MATCH", "REVIEW"]
    assert res["confidence_score"] >= 85.0
    assert len(res["evidence"]) > 0

def test_synthetic_data_generator():
    dataset = generate_synthetic_financial_dataset(50)
    assert dataset["record_count"] == 50
    assert len(dataset["records"]) == 50
    assert "breakdown" in dataset

def test_tax_line_matcher():
    inv_valid = {"invoice_number": "INV-101", "subtotal": 100000.0, "tax": 18000.0, "total_amount": 118000.0}
    inv_invalid = {"invoice_number": "INV-102", "subtotal": 100000.0, "tax": 12000.0, "total_amount": 112000.0}
    
    val1 = validate_invoice_tax(inv_valid)
    val2 = validate_invoice_tax(inv_invalid)
    
    assert val1["is_valid"] is True
    assert val2["is_valid"] is False
    assert val2["category"] == "TAX_MISMATCH"

def test_cash_forecasting_engine():
    fc = forecast_cash_position(5000000.0, [], [], horizon_days=30)
    assert fc["opening_cash"] == 5000000.0
    assert "confidence_interval" in fc
    assert fc["confidence_interval"]["min"] < fc["confidence_interval"]["max"]

def test_reconciliation_api_endpoint():
    res = client.post("/api/reconciliation/run?record_count=10")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert data["metrics"]["total_records_processed"] == 10

def test_exceptions_api_endpoint():
    res = client.get("/api/exceptions")
    assert res.status_code == 200
    data = res.json()
    assert "exceptions" in data
    assert len(data["exceptions"]) > 0

def test_human_reviews_api_endpoint():
    res = client.get("/api/reviews")
    assert res.status_code == 200
    data = res.json()
    assert "reviews" in data

def test_audit_log_api_endpoint():
    res = client.get("/api/audit-log")
    assert res.status_code == 200
    data = res.json()
    assert "audit_logs" in data

def test_metrics_api_endpoint():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "throughput_rps" in data
    assert "match_rate_pct" in data

# --- AUTONOMOUS FINANCE CONTROL TOWER TESTS ---

def test_control_score_calculation():
    from app.engine.control_score import calculate_finance_control_score
    score_data = calculate_finance_control_score()
    assert 0.0 <= score_data["finance_control_score"] <= 100.0
    assert "reconciliation_health" in score_data["sub_scores"]
    assert score_data["verdict"] in ["STRONG_CONTROL", "MODERATE_CONTROL", "WEAK_CONTROL"]

def test_continuous_close_readiness():
    from app.engine.continuous_close import calculate_continuous_close_readiness
    close_data = calculate_continuous_close_readiness()
    assert 0.0 <= close_data["close_readiness_score"] <= 100.0
    assert "close_blockers" in close_data
    assert close_data["status"] in ["READY", "IN_PROGRESS", "BLOCKED"]

def test_policy_engine_evaluation():
    from app.engine.policy_engine import evaluate_transaction_against_policies
    txn_normal = {"txn_id": "TXN-101", "amount": 50000.0}
    txn_high_val = {"txn_id": "TXN-102", "amount": 600000.0}
    
    res1 = evaluate_transaction_against_policies(txn_normal)
    res2 = evaluate_transaction_against_policies(txn_high_val)
    
    assert res1["has_violations"] is False
    assert res2["has_violations"] is True
    assert res2["highest_severity"] == "CRITICAL"

def test_gst_tds_compliance_controls():
    from app.engine.gst_tds_control import validate_indian_gst_line, validate_tds_deduction
    gst_val = validate_indian_gst_line(100000.0, 9000.0, 9000.0, 0.0, gstin="27AAACN9012K1Z5")
    tds_val = validate_tds_deduction(50000.0, 1000.0, section="194C", payee_type="COMPANY")
    
    assert gst_val["is_valid"] is True
    assert tds_val["is_valid"] is True

def test_control_tower_api_endpoints():
    res_score = client.get("/api/control-tower/score")
    assert res_score.status_code == 200
    assert "score_data" in res_score.json()

    res_close = client.get("/api/control-tower/close-readiness")
    assert res_close.status_code == 200
    assert "close_readiness_score" in res_close.json()

    res_cash = client.get("/api/control-tower/cash-command")
    assert res_cash.status_code == 200
    assert "liquidity_stress_test" in res_cash.json()

    res_graph = client.get("/api/control-tower/graph")
    assert res_graph.status_code == 200
    assert "nodes" in res_graph.json()

def test_national_hackathon_stress_test_endpoint():
    res = client.post("/api/control-tower/stress-test?record_count=20")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COMPLETED"
    assert "benchmark" in data
    assert data["benchmark"]["records_processed"] == 20

