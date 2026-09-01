from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import MarketAsset, FinancialNews

router = APIRouter(prefix="/market-news", tags=["Market & News"])

@router.get("/")
def get_market_and_news(db: Session = Depends(get_db)):
    assets = db.query(MarketAsset).all()
    news = db.query(FinancialNews).all()

    formatted_assets = [
        {
            "id": a.id,
            "symbol": a.symbol,
            "name": a.name,
            "asset_type": a.asset_type,
            "price": a.price,
            "change": a.change,
            "change_pct": a.change_pct,
            "volume": a.volume,
            "high_52w": a.high_52w,
            "low_52w": a.low_52w,
            "sentiment": a.sentiment
        } for a in assets
    ]

    formatted_news = [
        {
            "id": n.id,
            "headline": n.headline,
            "publisher": n.publisher,
            "timestamp": n.timestamp,
            "category": n.category,
            "impact_level": n.impact_level,
            "sentiment": n.sentiment,
            "ai_summary": n.ai_summary,
            "potential_impact": n.potential_impact,
            "finpilot_action": n.finpilot_action
        } for n in news
    ]

    return {
        "data_status": "DEMO DATA", # VISIBLY LABELED as required by spec #33, #35
        "data_indicator": "● Demo Data Source",
        "market_assets": formatted_assets,
        "financial_news": formatted_news,
        "external_factor_analysis": {
            "summary": "External macro conditions indicate rising cloud hardware tariffs and steady monetary policy rates.",
            "impact_channels": [
                {"factor": "GPU Compute Supply Tariffs", "channel": "Engineering COGS", "direction": "Increase (+8-12%)", "risk": "Medium"},
                {"factor": "Repo Rate Stability (6.5%)", "channel": "Working Capital Credit", "direction": "Neutral (0%)", "risk": "Low"}
            ]
        }
    }
