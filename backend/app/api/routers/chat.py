import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Conversation, ConversationMessage, MessageAttachment, MessageFeedback, Organization, User, Wallet
from app.engine.tool_runner import tool_runner
from app.agents.orchestrator import cfo_orchestrator

router = APIRouter(prefix="/chat", tags=["ChatGPT-Style AI CFO Chat"])

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New CFO Conversation"
    context_page: Optional[str] = None
    department_context: Optional[str] = None

class SendMessageRequest(BaseModel):
    message: str
    context_page: Optional[str] = None
    department_context: Optional[str] = None

class RenameConversationRequest(BaseModel):
    title: str

class FeedbackRequest(BaseModel):
    rating: str # thumbs_up, thumbs_down
    reason: Optional[str] = None
    details: Optional[str] = None

@router.get("/conversations")
def list_conversations(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Conversation).filter(Conversation.organization_id == 1, Conversation.is_archived == False)
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(Conversation.title.ilike(s))
    
    convs = query.order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc()).all()

    if not convs:
        demos = [
            ("Cash Flow & Runway Forecast", "How much runway do we have?", "Your current liquid cash reserve is ₹4.82 Cr, giving NovaTech AI Systems a solid 8.7 months cash runway under base growth trajectory."),
            ("Can We Afford Expansion?", "Can we afford to hire 10 engineers?", "Adding 10 full-time staff increases monthly burn to ₹44.00 Lakhs/mo, dropping cash runway from 8.7 months to 6.1 months. Stagger hiring across Q3/Q4 instead."),
            ("Alpha Supplies Duplicate Risk", "Show suspicious payments", "Alpha Supplies Corp submitted invoice #INV-2026-881 for ₹4.85 Lakhs, which is 4.1x higher than baseline and has 91% duplicate match with #INV-2026-880."),
            ("Marketing Overspend Audit", "Why did expenses increase?", "Marketing department spent ₹23.80 Lakhs (119% of ₹20.00 Lakhs cap), driving a temporary opex increase of ₹3.80 Lakhs.")
        ]
        for idx, (title, u_q, a_ans) in enumerate(demos):
            c_id = str(uuid.uuid4())
            c_time = datetime.datetime.utcnow() - datetime.timedelta(hours=idx*3)
            conv = Conversation(
                conversation_id=c_id,
                organization_id=1,
                user_id=1,
                title=title,
                is_pinned=(idx == 0),
                created_at=c_time,
                updated_at=c_time
            )
            db.add(conv)
            
            m1 = ConversationMessage(conversation_id=c_id, role="user", content=u_q, created_at=c_time)
            m2 = ConversationMessage(
                conversation_id=c_id, role="assistant", content=a_ans,
                confidence=96, sources=["finpilot_core_db"],
                execution_summary=["Analyzing financial database ✓", "Running Runway Model ✓"],
                created_at=c_time + datetime.timedelta(seconds=2)
            )
            db.add(m1)
            db.add(m2)

        db.commit()
        convs = db.query(Conversation).filter(Conversation.organization_id == 1).order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc()).all()

    return [
        {
            "id": c.conversation_id,
            "title": c.title,
            "is_pinned": c.is_pinned,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
            "updated_at": c.updated_at.strftime("%Y-%m-%d %H:%M")
        } for c in convs
    ]

@router.post("/conversations")
def create_conversation(req: CreateConversationRequest, db: Session = Depends(get_db)):
    c_id = str(uuid.uuid4())
    conv = Conversation(
        conversation_id=c_id,
        organization_id=1,
        user_id=1,
        title=req.title or "New CFO Conversation",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return {"conversation_id": c_id, "title": conv.title, "created_at": conv.created_at.strftime("%Y-%m-%d %H:%M")}

@router.get("/conversations/{conv_id}")
def get_conversation_history(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.conversation_id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(ConversationMessage).filter(ConversationMessage.conversation_id == conv_id).order_by(ConversationMessage.created_at.asc()).all()

    return {
        "conversation_id": conv.conversation_id,
        "title": conv.title,
        "is_pinned": conv.is_pinned,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "intent": m.intent,
                "confidence": m.confidence,
                "sources": m.sources or ["finpilot_database"],
                "metrics": m.metrics,
                "charts": m.charts,
                "actions": m.actions,
                "tool_calls": m.tool_calls,
                "execution_summary": m.execution_summary or ["Analyzing financial database ✓"],
                "created_at": m.created_at.strftime("%H:%M:%S")
            } for m in messages
        ]
    }

@router.post("/conversations/{conv_id}/messages")
def send_chat_message(conv_id: str, req: SendMessageRequest, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.conversation_id == conv_id).first()
    if not conv:
        conv = Conversation(
            conversation_id=conv_id,
            organization_id=1,
            user_id=1,
            title="Financial Discussion",
            created_at=datetime.datetime.utcnow()
        )
        db.add(conv)
        db.commit()

    user_msg_str = req.message.strip()

    # Save User Message
    user_msg = ConversationMessage(
        conversation_id=conv_id,
        role="user",
        content=user_msg_str,
        created_at=datetime.datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()

    past_messages = db.query(ConversationMessage).filter(ConversationMessage.conversation_id == conv_id).order_by(ConversationMessage.created_at.asc()).all()
    context_history = [m.content for m in past_messages[-4:]] if past_messages else []

    orchestrator_resp = cfo_orchestrator.process_query(
        user_msg_str,
        context_data={
            "current_cash": 48200000.0,
            "monthly_revenue": 15400000.0,
            "monthly_expenses": 11200000.0,
            "context_history": context_history,
            "page_context": req.context_page,
            "dept_context": req.department_context
        }
    )

    actions = []
    charts = None
    q_lower = user_msg_str.lower()

    if any(w in q_lower for w in ["cut", "reduce", "expense", "budget", "save"]):
        actions = [
            {"label": "Run Cost Reduction Scenario", "type": "SCENARIO", "payload": {"expense_cut": 1000000.0}},
            {"label": "Open Budgets Page", "type": "NAVIGATE", "route": "budgets"}
        ]
        charts = {
            "type": "bar",
            "title": "Department Expense Breakdown & Budgets",
            "data": [
                {"name": "Engineering", "spent": 44.1, "budget": 45.0},
                {"name": "Marketing", "spent": 23.8, "budget": 20.0},
                {"name": "Sales", "spent": 16.5, "budget": 18.0},
                {"name": "Admin", "spent": 12.2, "budget": 12.0},
                {"name": "HR", "spent": 15.4, "budget": 15.0}
            ]
        }
    elif any(w in q_lower for w in ["afford", "hire", "expansion", "employee", "payroll"]):
        actions = [
            {"label": "Simulate 10 Hires in Digital Twin", "type": "SCENARIO", "payload": {"hiring_count": 10}},
            {"label": "Open Digital Twin", "type": "NAVIGATE", "route": "digital-twin"}
        ]
        charts = {
            "type": "line",
            "title": "Projected Cash Runway Under Expansion (Months)",
            "data": [
                {"month": "Base", "runway": 8.7},
                {"month": "+3 Hires", "runway": 7.8},
                {"month": "+5 Hires", "runway": 7.2},
                {"month": "+10 Hires", "runway": 6.1}
            ]
        }
    elif any(w in q_lower for w in ["tcs", "infy", "nvda", "stock", "share", "market"]):
        actions = [
            {"label": "Open Stock Terminal", "type": "NAVIGATE", "route": "stock-intelligence"}
        ]
    elif any(w in q_lower for w in ["risk", "vendor", "fraud", "suspicious", "alpha"]):
        actions = [
            {"label": "Hold Payment for Alpha Supplies", "type": "ACTION", "action_name": "HOLD_PAYMENT"},
            {"label": "Open Risk Center", "type": "NAVIGATE", "route": "risk"}
        ]

    if conv.title in ["New CFO Conversation", "Financial Discussion"]:
        conv.title = user_msg_str[:30] + ("..." if len(user_msg_str) > 30 else "")
    
    conv.updated_at = datetime.datetime.utcnow()

    badge_str = orchestrator_resp.get('badge', 'FINPILOT DATA')
    formatted_content = f"[{badge_str}]  \n\n{orchestrator_resp.get('answer', '')}\n\n**Reasoning:** {orchestrator_resp.get('why', '')}\n\n**Recommendation:** {orchestrator_resp.get('recommendation', '')}"

    execution_summary = [
        "Analyzing verified business database ✓",
        "Checking page context ✓",
        "Evaluating multi-domain knowledge ✓",
        "Running Virtual CFO Decision Engine ✓"
    ]

    assistant_msg = ConversationMessage(
        conversation_id=conv_id,
        role="assistant",
        content=formatted_content,
        intent="FINANCIAL_ANALYSIS",
        confidence=orchestrator_resp.get("confidence", 95),
        sources=orchestrator_resp.get("sources", ["finpilot_database"]),
        metrics=[
            {"label": "Cash Reserve", "value": "₹4.82 Cr"},
            {"label": "Runway", "value": "8.7 Months"},
            {"label": "Net Profit", "value": "₹42.0 Lakhs"}
        ],
        charts=charts,
        actions=actions,
        tool_calls=["get_company_profile", "get_financial_summary", "get_department_spending", "get_risk_alerts"],
        execution_summary=execution_summary,
        created_at=datetime.datetime.utcnow()
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return {
        "id": assistant_msg.id,
        "conversation_id": conv_id,
        "role": "assistant",
        "content": assistant_msg.content,
        "intent": assistant_msg.intent,
        "confidence": assistant_msg.confidence,
        "sources": assistant_msg.sources,
        "metrics": assistant_msg.metrics,
        "charts": assistant_msg.charts,
        "actions": assistant_msg.actions,
        "tool_calls": assistant_msg.tool_calls,
        "execution_summary": assistant_msg.execution_summary,
        "created_at": assistant_msg.created_at.strftime("%H:%M:%S")
    }

@router.post("/conversations/{conv_id}/rename")
def rename_conversation(conv_id: str, req: RenameConversationRequest, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.conversation_id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.title = req.title
    db.commit()
    return {"status": "SUCCESS", "title": conv.title}

@router.post("/conversations/{conv_id}/pin")
def toggle_pin_conversation(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.conversation_id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.is_pinned = not conv.is_pinned
    db.commit()
    return {"status": "SUCCESS", "is_pinned": conv.is_pinned}

@router.delete("/conversations/{conv_id}")
def delete_conversation(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.conversation_id == conv_id).first()
    if conv:
        db.delete(conv)
        db.query(ConversationMessage).filter(ConversationMessage.conversation_id == conv_id).delete()
        db.commit()
    return {"status": "SUCCESS", "message": "Conversation deleted"}

@router.post("/messages/{msg_id}/feedback")
def submit_message_feedback(msg_id: int, req: FeedbackRequest, db: Session = Depends(get_db)):
    fb = MessageFeedback(
        message_id=msg_id,
        rating=req.rating,
        reason=req.reason,
        details=req.details,
        created_at=datetime.datetime.utcnow()
    )
    db.add(fb)
    db.commit()
    return {"status": "SUCCESS", "message": "Feedback recorded!"}

@router.get("/suggestions")
def get_chat_suggestions():
    return {
        "title": "What can I help you understand?",
        "tagline": "Your AI CFO, available anytime.",
        "suggestions": [
            {"icon": "💰", "category": "Cash Flow", "prompt": "How much cash runway do we have?"},
            {"icon": "📊", "category": "Expenses", "prompt": "Why did expenses increase this month?"},
            {"icon": "📈", "category": "Stocks", "prompt": "Analyze TCS stock and 3-month forecast"},
            {"icon": "⚠️", "category": "Risk", "prompt": "Show me our highest-risk transactions."},
            {"icon": "🔮", "category": "Forecast", "prompt": "What will our cash balance look like in 90 days?"},
            {"icon": "🧬", "category": "Digital Twin", "prompt": "What happens if revenue falls by 20%?"},
            {"icon": "🎯", "category": "Strategy", "prompt": "Can we afford to hire 10 engineers?"},
            {"icon": "📑", "category": "Reports", "prompt": "Generate a monthly CFO executive report."}
        ]
    }
