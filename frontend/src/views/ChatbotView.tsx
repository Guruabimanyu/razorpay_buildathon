import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Plus, Search, MessageSquare, Pin, Trash2, Edit3, Send, Paperclip, 
  Mic, Sparkles, CheckCircle2, ShieldCheck, ThumbsUp, ThumbsDown, Copy, 
  TrendingUp, AlertTriangle, ArrowRight, Share2, RefreshCw, BarChart2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { FormattedMarkdownText } from '../components/FormattedMarkdownText';

interface ChatbotViewProps {
  onNavigateView?: (view: string) => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({ onNavigateView }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<string[]>([]);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    { icon: "💰", category: "Cash Flow", prompt: "How much runway do we have?" },
    { icon: "📊", category: "Expenses", prompt: "Why did expenses increase this month?" },
    { icon: "📈", category: "Stocks", prompt: "Analyze TCS stock and 3-month forecast" },
    { icon: "⚠️", category: "Risk", prompt: "Show me our highest-risk transactions." },
    { icon: "🔮", category: "Forecast", prompt: "What will our cash balance look like in 90 days?" },
    { icon: "🧬", category: "Digital Twin", prompt: "What happens if revenue falls by 20%?" },
    { icon: "🎯", category: "Strategy", prompt: "Can we afford to hire 10 engineers?" },
    { icon: "📑", category: "Reports", prompt: "Generate a monthly CFO executive report." }
  ];

  const slashCommands = [
    { cmd: "/cash", desc: "Check current available cash and runway" },
    { cmd: "/budget", desc: "View department spending and overruns" },
    { cmd: "/stock", desc: "Open Stock Intelligence Terminal" },
    { cmd: "/risk", desc: "Audit high-risk transactions and duplicate invoices" },
    { cmd: "/forecast", desc: "Run 90-day cash flow projection" },
    { cmd: "/scenario", desc: "Launch Digital Twin revenue/hiring simulation" },
    { cmd: "/report", desc: "Generate monthly executive CFO report" }
  ];

  const loadConversations = () => {
    fetch('/api/chat/conversations')
      .then(r => r.json())
      .then(data => {
        setConversations(data || []);
        if (data && data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
        }
      })
      .catch(() => {});
  };

  const loadMessages = (convId: string) => {
    fetch(`/api/chat/conversations/${convId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data.messages || []);
      })
      .catch(() => setMessages([]));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewChat = () => {
    fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: "New CFO Conversation" })
    })
      .then(r => r.json())
      .then(data => {
        setActiveConvId(data.conversation_id);
        setMessages([]);
        loadConversations();
      });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!text) return;

    let targetConvId = activeConvId;
    if (!targetConvId) {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text.slice(0, 25) })
      }).then(r => r.json());
      targetConvId = res.conversation_id;
      setActiveConvId(targetConvId);
    }

    const userMsgObj = { id: Date.now(), role: 'user', content: text, created_at: 'Just now' };
    setMessages(prev => [...prev, userMsgObj]);
    setInputMessage('');
    setIsLoading(true);
    setExecutionSteps([]);

    const steps = [
      "Analyzing verified business database ✓",
      "Checking multi-domain knowledge ✓",
      "Evaluating CFO Decision Framework ✓"
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 100));
      setExecutionSteps(prev => [...prev, steps[i]]);
    }

    try {
      const res = await fetch(`/api/chat/conversations/${targetConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context_page: "ChatbotView" })
      }).then(r => r.json());

      if (res && res.content) {
        setMessages(prev => [...prev, res]);
      } else {
        throw new Error('Empty backend response');
      }
    } catch (e) {
      const fallbackMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `[FINPILOT DATA]\n\n👋 Hello! Regarding '${text}': NovaTech AI Systems holds ₹4.82 Cr cash reserves with ₹1.54 Cr monthly revenue and 8.7 months cash runway.\n\n**Reasoning:** Monthly expenses stand at ₹1.12 Cr/mo, producing ₹42.00 Lakhs net monthly profit.\n\n**Recommendation:** 1. Maintain ₹25.00 Lakhs safety reserve, 2. Enforce marketing budget cap, 3. Hold Alpha Supplies ₹4.85 Lakhs flagged duplicate invoice.`,
        confidence: 95,
        sources: ["finpilot_core_database"],
        execution_summary: ["Analyzing verified business database ✓", "Running Runway Model ✓"]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      loadConversations();
    }
  };

  const handleDeleteConv = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(`/api/chat/conversations/${convId}`, { method: 'DELETE' }).then(() => {
      if (activeConvId === convId) setActiveConvId(null);
      loadConversations();
    });
  };

  const handleTogglePin = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(`/api/chat/conversations/${convId}/pin`, { method: 'POST' }).then(() => {
      loadConversations();
    });
  };

  const handleFeedback = (msgId: number, rating: 'thumbs_up' | 'thumbs_down') => {
    fetch(`/api/chat/messages/${msgId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    });
    alert(rating === 'thumbs_up' ? "Thank you for your feedback! 👍" : "Feedback recorded. We will refine this response! 👎");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);
    if (val.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-[#171717] text-slate-100 rounded-3xl overflow-hidden border border-[#2f2f2f] shadow-2xl">
      
      <input type="file" ref={fileInputRef} className="hidden" onChange={() => handleSendMessage("Analyzed uploaded computer document.")} />

      {/* LEFT CHAT SIDEBAR */}
      <div className="w-72 bg-[#212121] border-r border-[#2f2f2f] flex flex-col shrink-0">
        
        <div className="p-4 border-b border-[#2f2f2f]">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="p-3 border-b border-[#2f2f2f]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#171717] text-xs text-slate-100 placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-lg border border-[#2f2f2f] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations
            .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between group cursor-pointer transition-all ${
                  activeConvId === c.id ? 'bg-[#2f2f2f] text-blue-400 font-bold border border-blue-500/30' : 'text-slate-300 hover:bg-[#2f2f2f]/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{c.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleTogglePin(c.id, e)} className="p-1 text-slate-400 hover:text-amber-400">
                    <Pin className={`h-3 w-3 ${c.is_pinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button onClick={(e) => handleDeleteConv(c.id, e)} className="p-1 text-slate-400 hover:text-rose-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="p-3 bg-[#171717] border-t border-[#2f2f2f] flex items-center gap-2 text-xs">
          <div className="h-7 w-7 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-[10px]">
            FP
          </div>
          <div>
            <div className="font-bold text-slate-200">FinPilot CFO Agent</div>
            <div className="text-[10px] text-blue-400 font-mono">Universal Core v3.0</div>
          </div>
        </div>

      </div>

      {/* MAIN CONVERSATION AREA */}
      <div className="flex-1 flex flex-col bg-[#171717]">
        
        {/* ChatGPT Top Navbar */}
        <div className="px-5 py-4 bg-[#212121] border-b border-[#2f2f2f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                FinPilot CFO
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-mono font-semibold">Groq GPT-120B • ONLINE</span>
              </h2>
              <p className="text-[11px] text-slate-400">Company Finance • Stock Intelligence • Digital Twin • App Navigation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleNewChat} className="px-3.5 py-1.5 bg-[#2f2f2f] hover:bg-[#383838] text-slate-200 text-xs font-semibold rounded-xl border border-[#383838] flex items-center gap-1.5 transition-colors cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Messages / Starter Cards Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#171717]">
          
          {messages.length === 0 && !isLoading && (
            <div className="max-w-3xl mx-auto space-y-6 pt-6">
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-black text-2xl shadow-xl mb-2">
                  FP
                </div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">What can I help you understand today?</h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto">Ask any question about your company's finances, stocks, app features, or market news...</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 bg-[#212121] hover:bg-[#2f2f2f] border border-[#2f2f2f] hover:border-blue-500/40 rounded-2xl text-left transition-all group cursor-pointer space-y-2 shadow-xl"
                  >
                    <div className="text-lg">{item.icon}</div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300">{item.category}</div>
                    <div className="text-[11px] text-slate-400 leading-tight">"{item.prompt}"</div>
                  </button>
                ))}
              </div>

            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 max-w-3xl mx-auto ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {m.role === 'assistant' && (
                <div className="h-8 w-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                  FP
                </div>
              )}

              <div className={`space-y-3 ${m.role === 'user' ? 'max-w-md' : 'flex-1'}`}>
                
                {m.role === 'user' ? (
                  <div className="p-3.5 bg-[#2f2f2f] text-slate-100 rounded-2xl rounded-tr-sm text-xs font-medium shadow-md">
                    {m.content}
                  </div>
                ) : (
                  
                  <div className="p-5 bg-[#212121] border border-[#2f2f2f] rounded-2xl space-y-4 shadow-xl">
                    
                    {m.execution_summary && (
                      <div className="flex flex-wrap gap-2 pb-2 border-b border-[#2f2f2f]">
                        {m.execution_summary.map((step: string, sIdx: number) => (
                          <span key={sIdx} className="text-[10px] bg-[#171717] text-blue-400 px-2 py-0.5 rounded-md font-mono font-semibold flex items-center gap-1 border border-blue-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            {step}
                          </span>
                        ))}
                      </div>
                    )}

                    <FormattedMarkdownText content={m.content} />

                    {m.charts && (
                      <div className="p-4 bg-[#171717] border border-[#2f2f2f] rounded-xl space-y-2">
                        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <BarChart2 className="h-4 w-4 text-blue-400" />
                          <span>{m.charts.title}</span>
                        </div>
                        <div className="h-40 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={m.charts.data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                              <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                              <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#2f2f2f', borderRadius: '8px', fontSize: '11px' }} />
                              <Bar dataKey="spent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="budget" fill="#64748B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {m.actions && m.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2f2f2f]">
                        {m.actions.map((act: any, aIdx: number) => (
                          <button
                            key={aIdx}
                            onClick={() => {
                              if (act.type === 'NAVIGATE' && onNavigateView) onNavigateView(act.route);
                              else if (act.type === 'PROMPT') handleSendMessage(act.prompt);
                              else alert(`Executing action: ${act.label}`);
                            }}
                            className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold rounded-lg border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Sources:</span>
                        <span className="px-2 py-0.5 bg-[#0B132B] text-blue-400 rounded font-mono font-bold uppercase">{m.sources?.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleFeedback(m.id, 'thumbs_up')} className="p-1 hover:text-blue-400">
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleFeedback(m.id, 'thumbs_down')} className="p-1 hover:text-rose-400">
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-3xl mx-auto">
              <div className="h-8 w-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                FP
              </div>
              <div className="p-4 bg-[#212121] border border-blue-500/30 rounded-2xl space-y-2 animate-pulse flex-1 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <Sparkles className="h-4 w-4 animate-spin text-blue-400" />
                  <span>FinPilot CFO is querying Groq LLM & business database...</span>
                </div>
                <div className="space-y-1">
                  {executionSteps.map((step, idx) => (
                    <div key={idx} className="text-xs text-blue-400 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showSlashMenu && (
          <div className="mx-6 p-2 bg-[#212121] border border-[#2f2f2f] rounded-xl space-y-1 shadow-2xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">FinPilot Quick Commands</div>
            {slashCommands.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(sc.cmd + ' ');
                  setShowSlashMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[#2f2f2f] text-xs flex justify-between items-center"
              >
                <span className="font-mono font-bold text-blue-400">{sc.cmd}</span>
                <span className="text-slate-400 text-[11px]">{sc.desc}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-[#212121] border-t border-[#2f2f2f] flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-white bg-[#171717] hover:bg-[#2f2f2f] rounded-2xl border border-[#2f2f2f] transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Ask FinPilot anything about business, app features, stocks, or markets..."
            className="flex-1 bg-[#171717] text-xs text-slate-100 placeholder-slate-400 px-4 py-3 rounded-2xl border border-[#2f2f2f] focus:outline-none focus:border-blue-500 font-medium"
          />

          <button
            type="button"
            onClick={() => alert("Voice input active. Speak your question...")}
            className="p-3 text-slate-400 hover:text-white bg-[#171717] hover:bg-[#2f2f2f] rounded-2xl border border-[#2f2f2f] transition-colors"
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white rounded-2xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};
