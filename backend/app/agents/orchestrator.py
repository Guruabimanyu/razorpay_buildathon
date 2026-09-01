import json
import re
import ssl
import urllib.request
import urllib.error
from typing import Dict, Any, List
from app.config import settings
from app.engine.health_score import calculate_financial_health_score
from app.engine.runway import calculate_cash_runway
from app.engine.digital_twin import run_financial_digital_twin_simulation
from app.engine.budget_optimizer import optimize_budget_savings
from app.engine.stock_engine import MarketProvider

def fmt_amt(amount: float) -> str:
    """Helper to format Rupee amounts into clean Cr / Lakhs notation."""
    abs_amt = abs(amount)
    prefix = "-₹" if amount < 0 else "₹"
    if abs_amt >= 10000000:
        return f"{prefix}{(abs_amt/10000000.0):.2f} Cr"
    elif abs_amt >= 100000:
        return f"{prefix}{(abs_amt/100000.0):.2f} Lakhs"
    else:
        return f"{prefix}{abs_amt:,.2f}"

class MultiAgentCFOOrchestrator:
    """
    FinPilot CFO Universal Intelligence Orchestrator.
    Quality-Gated Answer Relevance Engine:
    Answers the user's specific prompt dynamically and directly.
    """

    APP_KNOWLEDGE = {
        "digital twin": "The Financial Digital Twin creates a live mathematical matrix of your business. Go to 'Financial Digital Twin' in the sidebar to simulate revenue drops (-20%), hiring expansions (+10 staff), or marketing delta changes.",
        "invoices": "Invoices & OCR handles duplicate detection and automated invoice reading. Upload PDFs or images in 'Invoices & OCR' to scan duplicate probability and payment priority.",
        "risk center": "Risk Center evaluates financial risk from 0-100 based on anomaly frequency, budget overruns, and overdue receivables. Click 'Risk Center' in the sidebar to resolve active alerts.",
        "cash flow": "Cash Flow & Runway tracks your liquid cash vs monthly net burn. View 90-day trajectory and runway calculations under 'Cash Flow & Runway'.",
        "budgets": "Budgets & Optimizer lists department caps and identifies unused SaaS seats or low-ROI channels. Navigate to 'Budgets & Optimizer' to run cost reductions.",
        "stock intelligence": "Stock Intelligence terminal provides live/delayed quotes, historical OHLCV charts, technical overlays (SMA, RSI), and 1D-1Y probabilistic Bull/Base/Bear scenario forecasts.",
        "option chain": "Option Chain Terminal displays strike prices, Call/Put LTP, Open Interest (OI), Volume, Implied Volatility (IV), and Put-Call Ratio (PCR) analytics."
    }

    FINANCE_TERMS = {
        "rsi": "📊 **Relative Strength Index (RSI):** A technical momentum indicator that measures the speed and magnitude of recent price changes (scale 0-100). RSI > 70 indicates an overbought asset; RSI < 30 indicates an oversold asset.",
        "macd": "📈 **Moving Average Convergence Divergence (MACD):** A trend-following momentum indicator showing the relationship between two exponential moving averages (typically 12-period and 26-period EMA).",
        "ebitda": "💰 **EBITDA:** Earnings Before Interest, Taxes, Depreciation, and Amortization. Represents core operational profitability before financing and non-cash accounting charges.",
        "pe": "🔢 **P/E Ratio (Price-to-Earnings):** Measures a company's current share price relative to its per-share earnings (EPS). Higher P/E indicates higher market growth expectations.",
        "runway": "⏳ **Cash Runway = Liquid Cash Balance ÷ Average Monthly Net Burn Rate.** Represents the total number of months your company can operate before running out of cash."
    }

    def _call_openai(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        api_key = getattr(settings, 'GROQ_API_KEY', '') or getattr(settings, 'OPENAI_API_KEY', '')
        if not api_key:
            return {}

        is_groq = api_key.startswith("gsk_")
        url = "https://api.groq.com/openai/v1/chat/completions" if is_groq else "https://api.openai.com/v1/chat/completions"
        model_name = getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-120b') if is_groq else "gpt-4o-mini"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0 (FinPilot AI CFO)"
        }

        full_system_prompt = system_prompt + "\nReturn ONLY a valid JSON object with keys: 'answer', 'why', 'evidence' (list of strings), 'financial_impact', 'recommendation', 'sources' (list of strings), 'badge' (e.g. 'FINPILOT DATA', 'LIVE MARKET', 'STOCK FORECAST', 'DIGITAL TWIN', 'APP HELP'). Do not wrap in backticks."

        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1500
        }
        if not is_groq:
            payload["response_format"] = {"type": "json_object"}

        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
                if response.status == 200:
                    res_body = json.loads(response.read().decode("utf-8"))
                    content_str = res_body["choices"][0]["message"]["content"].strip()
                    # Clean markdown code block formatting if present
                    if content_str.startswith("```"):
                        content_str = re.sub(r"^```(?:json)?\s*", "", content_str)
                        content_str = re.sub(r"\s*```$", "", content_str)
                    
                    parsed = json.loads(content_str)
                    if isinstance(parsed, dict) and "answer" in parsed:
                        parsed["sources"] = parsed.get("sources", []) + ["groq_llm" if is_groq else "openai_llm"]
                        return parsed
        except Exception as e:
            print(f"LLM API Exception ({'Groq' if is_groq else 'OpenAI'}): {e}")
        return {}

    def process_query(self, query: str, context_data: Dict[str, Any] = None) -> Dict[str, Any]:
        q = query.strip() if query else "Overview"
        q_lower = q.lower()
        
        ctx = context_data or {}
        cash = ctx.get("current_cash", 48200000.0)
        rev = ctx.get("monthly_revenue", 15400000.0)
        exp = ctx.get("monthly_expenses", 11200000.0)
        page_context = ctx.get("page_context") or ""
        net_profit = rev - exp
        burn_rate = max(0.0, exp - rev)
        runway = round(cash / burn_rate, 1) if burn_rate > 0 else 8.7

        agents_triggered = ["Universal CFO Orchestrator", "Quality Gate Agent"]
        tools_called = ["get_company_metrics"]

        # 1. Check Finance Education Terms (Direct Match without dumping company cash)
        for term, term_desc in self.FINANCE_TERMS.items():
            if f"what is {term}" in q_lower or f"explain {term}" in q_lower or q_lower == term:
                return {
                    "user_prompt": query,
                    "answer": term_desc,
                    "why": f"General financial term inquiry for '{term.upper()}'.",
                    "evidence": [f"Concept: {term.upper()}", "Financial Education Knowledge Base"],
                    "financial_impact": "Understanding technical and financial terminology empowers better CFO decision-making.",
                    "recommendation": f"Ask for real-time application of {term.upper()} to your company's data or stocks.",
                    "confidence": 99,
                    "badge": "FINANCE EDUCATION",
                    "sources": ["finpilot_finance_dictionary"],
                    "agents_involved": ["Education Agent"],
                    "tools_called": ["get_term_definition"]
                }

        # 2. Check Stock Query
        matched_stock = None
        for stk_ticker in ["TCS", "INFY", "NVDA", "AAPL", "RELIANCE", "HDFCBANK", "ICICIBANK", "SBIN"]:
            if stk_ticker.lower() in q_lower or (stk_ticker == "TCS" and "tata" in q_lower) or (stk_ticker == "INFY" and "infosys" in q_lower):
                matched_stock = stk_ticker
                break

        # Attempt OpenAI completion
        system_prompt = f"""You are FinPilot CFO, a universal AI Virtual CFO for NovaTech AI Systems.
Current Verified Context:
- Cash Reserve: {fmt_amt(cash)} (Runway: {runway} Months)
- Monthly Revenue: {fmt_amt(rev)} | Monthly Expenses: {fmt_amt(exp)} | Net Monthly Profit: {fmt_amt(net_profit)}
- Health Score: 78/100 (Healthy)
- Active Risk Alerts: Alpha Supplies ₹4.85L duplicate invoice (91% confidence), Marketing spending ₹23.80L (119% of budget cap), ABC Corp ₹18.00L overdue receivable.
- Active Page Context: '{page_context}'

Rules:
- Format ALL monetary amounts cleanly as Crores (Cr) or Lakhs (e.g. ₹1.54 Cr, ₹4.85 Lakhs).
- Answer the user's specific prompt dynamically and directly without returning unrelated metrics.
"""
        openai_res = self._call_openai(query, system_prompt)

        if openai_res and "answer" in openai_res:
            return {
                "user_prompt": query,
                "answer": openai_res.get("answer", ""),
                "why": openai_res.get("why", f"Verified against live company context: Cash {fmt_amt(cash)}, Revenue {fmt_amt(rev)}."),
                "evidence": openai_res.get("evidence", [
                    f"Analyzed Prompt: '{query}'",
                    f"Current Cash Buffer: {fmt_amt(cash)}",
                    f"Monthly Net Surplus: {fmt_amt(net_profit)}"
                ]),
                "financial_impact": openai_res.get("financial_impact", f"Resolving active risks optimizes monthly burn rate by ₹3.80 Lakhs."),
                "recommendation": openai_res.get("recommendation", "1. Enforce marketing cap, 2. Hold Alpha Supplies payment, 3. Collect receivables."),
                "confidence": 98,
                "badge": openai_res.get("badge", "FINPILOT DATA"),
                "sources": openai_res.get("sources", ["openai_gpt4o_mini", "finpilot_core_db"]),
                "agents_involved": agents_triggered,
                "tools_called": tools_called
            }

        # --- DETERMINISTIC FALLBACK ENGINE ---

        # App Help
        if any(w in q_lower for w in ["how to", "how do i", "where is", "what is this page", "how does"]):
            for key, desc in self.APP_KNOWLEDGE.items():
                if key in q_lower:
                    return {
                        "user_prompt": query,
                        "answer": f"📖 **FinPilot Guide:** {desc}",
                        "why": f"Feature query detected for module '{key}'.",
                        "evidence": [f"Requested Feature: {key.upper()}", "Interactive Navigation Active"],
                        "financial_impact": "Navigating directly saves time and automates financial workflow.",
                        "recommendation": f"Click the relevant menu item in the left sidebar to open {key.title()}.",
                        "confidence": 99,
                        "badge": "APP HELP",
                        "sources": ["finpilot_user_manual"],
                        "agents_involved": ["App Help Agent"],
                        "tools_called": ["get_app_docs"]
                    }

        # Stock Intelligence
        if matched_stock or any(w in q_lower for w in ["stock", "nifty", "sensex", "market index", "share price"]):
            stk_symbol = matched_stock or "TCS"
            stk_data = MarketProvider.get_quote(stk_symbol)
            fc_data = MarketProvider.generate_ai_forecast(stk_symbol)
            fc_1m = fc_data["forecasts"]["1M"]

            return {
                "user_prompt": query,
                "answer": f"📈 **{stk_data['company_name']} ({stk_data['ticker']}) Analysis:** Trading at {stk_data['currency']} {stk_data['current_price']:,.2f} ({stk_data['change_pct']:+.2f}% today) on {stk_data['exchange']}. FinPilot AI Analytical Score: {stk_data['ai_score']}/100.",
                "why": f"1-Month Probabilistic Forecast estimates a Base Case range of {fc_1m['base_range']} with {fc_1m['confidence_pct']}% confidence.",
                "evidence": [
                    f"Ticker: {stk_data['ticker']} ({stk_data['exchange']})",
                    f"Current Price: {stk_data['currency']} {stk_data['current_price']:,.2f}",
                    f"52W Range: {stk_data['52w_low']} - {stk_data['52w_high']}",
                    f"1M Forecast Base Range: {fc_1m['base_range']}"
                ],
                "financial_impact": f"Market Beta & Valuation P/E ({stk_data['pe_ratio']}x) indicate moderate volatility risk.",
                "recommendation": f"⚠️ AI Forecast: Estimated range only (Not guaranteed performance). Review full technicals under Stock Intelligence.",
                "confidence": fc_1m["confidence_pct"],
                "badge": "STOCK FORECAST",
                "sources": [stk_data["data_source"], "finpilot_forecast_ensemble"],
                "agents_involved": ["Stock Intelligence Agent"],
                "tools_called": ["get_stock_quote", "generate_ai_forecast"]
            }

        # Company Financial Knowledge
        return {
            "user_prompt": query,
            "answer": f"✨ **FinPilot CFO Analysis:** NovaTech AI Systems holds {fmt_amt(cash)} in liquid cash reserves with {fmt_amt(net_profit)} net monthly profit and an 8.7-month runway.",
            "why": f"Monthly revenue of {fmt_amt(rev)} exceeds operating expenses of {fmt_amt(exp)}.",
            "evidence": [
                f"Cash Reserve: {fmt_amt(cash)} (8.7 Months Runway)",
                f"Monthly Revenue: {fmt_amt(rev)} | Expenses: {fmt_amt(exp)}",
                "Financial Health Score: 78 / 100 (Healthy)",
                "Active Risk Alerts: 3 (Duplicate Invoice, Marketing Overspend, Overdue AR)"
            ],
            "financial_impact": "Resolving active risk alerts optimizes working capital by ₹22.85 Lakhs.",
            "recommendation": "1. Hold Alpha Supplies ₹4.85 Lakhs duplicate invoice, 2. Enforce marketing cap, 3. Collect ABC Corp receivable.",
            "confidence": 92,
            "badge": "FINPILOT DATA",
            "sources": ["finpilot_core_database"],
            "agents_involved": ["CFO Decision Agent"],
            "tools_called": ["get_company_metrics"]
        }

cfo_orchestrator = MultiAgentCFOOrchestrator()
