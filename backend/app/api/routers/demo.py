from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.seed import seed_database

router = APIRouter(prefix="/demo", tags=["Hackathon Demo"])

@router.post("/launch")
def launch_demo():
    """
    Prepares the entire dashboard with preloaded demo data and seeds intentional anomalies.
    """
    seed_database()
    return {
        "status": "SUCCESS",
        "message": "Hackathon Demo Environment active for NovaTech AI Systems!",
        "company": "NovaTech AI Systems",
        "health_score": 78,
        "active_anomalies_count": 3
    }

@router.get("/scenarios/preset")
def trigger_demo_preset(preset_id: str):
    presets = {
        "revenue_crash": {
            "title": "Revenue Crash (-20%)",
            "sim_revenue": "₹1.23 Cr",
            "sim_runway": "5.8 Months",
            "cfo_verdict": "REJECT",
            "verdict_badge": "red",
            "reasoning": "Top-line contraction depletes cash runway to under 6 months. Defer non-critical hiring immediately."
        },
        "expansion": {
            "title": "Afford Expansion? (+10 Hires, +₹5L Mktg)",
            "sim_revenue": "₹1.54 Cr",
            "sim_expenses": "₹1.27 Cr",
            "sim_runway": "5.4 Months",
            "cfo_verdict": "REJECT",
            "verdict_badge": "red",
            "reasoning": "Expansion is NOT recommended under current liquidity buffer. Stagger hiring across 2 quarters."
        },
        "fraud_detection": {
            "title": "Duplicate Invoice Detection",
            "flagged_vendor": "Alpha Supplies Corp",
            "amount": "₹4,85,000",
            "duplicate_prob": "91%",
            "cfo_verdict": "HOLD_PAYMENT",
            "reasoning": "Identical invoice number and exact 4.1x spend anomaly. Prevented ₹4.85L duplicate payout."
        }
    }
    
    return presets.get(preset_id, presets["expansion"])
