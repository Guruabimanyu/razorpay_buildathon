from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.seed import seed_database

# Import Routers
from app.api.routers import (
    auth, dashboard, wallet, transactions, invoices, cashflow,
    budgets, digital_twin, ai_cfo, risk, market_news,
    vendors_customers, reports, demo, chat, stocks, ai_command, accounting,
    reconciliation, ingestion, exceptions, reviews, tax, audit, metrics, control_tower
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FinPilot AI — Autonomous AI Finance Controller & Virtual CFO Operating System",
    version=settings.VERSION
)

# Enable CORS for local React/Vite development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        seed_database()
    except Exception as e:
        print(f"Database seed note: {e}")

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(control_tower.router, prefix=settings.API_V1_STR)
app.include_router(reconciliation.router, prefix=settings.API_V1_STR)
app.include_router(ingestion.router, prefix=settings.API_V1_STR)
app.include_router(exceptions.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(tax.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(metrics.router, prefix=settings.API_V1_STR)
app.include_router(wallet.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(invoices.router, prefix=settings.API_V1_STR)
app.include_router(cashflow.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(digital_twin.router, prefix=settings.API_V1_STR)
app.include_router(ai_cfo.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(stocks.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(market_news.router, prefix=settings.API_V1_STR)
app.include_router(vendors_customers.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)
app.include_router(ai_command.router, prefix=settings.API_V1_STR)
app.include_router(accounting.router, prefix=settings.API_V1_STR)

# Direct routes for compatibility
app.include_router(control_tower.router)
app.include_router(reconciliation.router)
app.include_router(ingestion.router)
app.include_router(exceptions.router)
app.include_router(reviews.router)
app.include_router(tax.router)
app.include_router(audit.router)
app.include_router(metrics.router)
app.include_router(cashflow.router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "OPERATIONAL",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
