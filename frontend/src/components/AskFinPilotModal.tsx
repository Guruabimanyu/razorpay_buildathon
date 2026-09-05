import React, { useState, useEffect } from 'react';
import { X, Bot, Send, Sparkles, CheckCircle2, ShieldCheck, Smile, MessageSquare, ThumbsUp, Copy, Check, Paperclip, Mic } from 'lucide-react';
import { askFinPilotCFO } from '../services/api';
import { CFOAgentResponse } from '../types';
import { FormattedMarkdownText } from './FormattedMarkdownText';

interface AskFinPilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const AskFinPilotModal: React.FC<AskFinPilotModalProps> = ({ isOpen, onClose, initialQuery }) => {
  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState<string[]>([]);
  const [history, setHistory] = useState<CFOAgentResponse[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const sampleQuestions = [
    { icon: "⚡", prompt: "What is our current cash runway?" },
    { icon: "📊", prompt: "Why did marketing expenses increase?" },
    { icon: "👥", prompt: "Can we afford 10 new engineers?" },
    { icon: "⚠️", prompt: "Show duplicate invoices and risk alerts" },
    { icon: "📈", prompt: "Forecast cash balance for next 90 days" },
    { icon: "✂️", prompt: "How can we cut ₹10 lakh in opex?" },
  ];

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInputQuery(initialQuery);
      handleAsk(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleAsk = async (queryToAsk?: string) => {
    const q = (queryToAsk !== undefined ? queryToAsk : inputQuery).trim();
    if (!q) return;

    setInputQuery(q);
    setIsLoading(true);
    setAgentSteps([]);

    const steps = ["Cash Flow Engine", "Digital Twin Hiring Simulator", "Groq AI CFO Model"];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 100));
      setAgentSteps(prev => [...prev, steps[i]]);
    }

    const result = await askFinPilotCFO(q);
    setHistory(prev => [result, ...prev]);
    setIsLoading(false);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#171717] border border-[#2f2f2f] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans">
        
        {/* ChatGPT Header */}
        <div className="px-5 py-4 bg-[#212121] border-b border-[#2f2f2f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-md shadow-blue-500/10">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                FinPilot CFO
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">Groq GPT-120B • ONLINE</span>
              </h3>
              <p className="text-[11px] text-slate-400">Ask any question about your company's finances, cash flow, or risks in plain English.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#2f2f2f] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ChatGPT Scrollable Conversation Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-[#171717]">
          
          {/* Welcome Helper Banner */}
          {history.length === 0 && !isLoading && (
            <div className="p-5 bg-[#212121] border border-[#2f2f2f] rounded-2xl flex items-start gap-3.5 shadow-xl">
              <div className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                <Smile className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-100 text-sm">Hello! How can I assist your business today?</h4>
                <p className="text-slate-400 leading-relaxed">I can analyze spending, calculate hiring runway, check duplicate vendor invoices, or model scenario simulations using verified database context.</p>
              </div>
            </div>
          )}

          {/* ChatGPT Prompt Pills */}
          <div className="bg-[#212121] p-4 rounded-2xl border border-[#2f2f2f] space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
              <span>Suggested Helper Prompts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleQuestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleAsk(item.prompt);
                  }}
                  className="text-xs bg-[#171717] hover:bg-[#2f2f2f] border border-[#2f2f2f] hover:border-blue-500/40 text-slate-300 hover:text-white p-3 rounded-xl transition-all text-left font-medium flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.prompt}</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-blue-400 transition-colors text-sm">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Thinking / Agent Processing Indicator */}
          {isLoading && (
            <div className="p-4 bg-[#212121] border border-blue-500/30 rounded-2xl space-y-3 animate-pulse shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <Sparkles className="h-4 w-4 animate-spin text-blue-400" />
                <span>FinPilot CFO is querying Groq LLM & business database...</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {agentSteps.map((agent, idx) => (
                  <span key={idx} className="text-[11px] text-blue-400 font-mono bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {agent} ✓
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conversational Stream of Responses */}
          {history.length > 0 && (
            <div className="space-y-6">
              {history.map((response, hIdx) => (
                <div key={hIdx} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  
                  {/* User Message Bubble */}
                  <div className="flex justify-end">
                    <div className="bg-[#2f2f2f] text-slate-100 text-xs font-medium px-4 py-3 rounded-2xl rounded-tr-sm max-w-lg shadow-md">
                      {response.user_prompt}
                    </div>
                  </div>

                  {/* ChatGPT Assistant Card */}
                  <div className="p-5 bg-[#212121] border border-[#2f2f2f] rounded-2xl space-y-4 shadow-xl">
                    
                    {/* Assistant Header & Copy */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#2f2f2f]">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xs font-bold">
                          FP
                        </div>
                        <span className="text-xs font-bold text-slate-200">FinPilot CFO Analysis</span>
                      </div>
                      <button
                        onClick={() => handleCopy(response.answer, hIdx)}
                        className="p-1.5 text-slate-400 hover:text-white bg-[#171717] hover:bg-[#2f2f2f] rounded-lg border border-[#2f2f2f] text-xs flex items-center gap-1 transition-colors"
                      >
                        {copiedIdx === hIdx ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-[10px] text-blue-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Formatted Markdown Answer */}
                    <FormattedMarkdownText content={response.answer} />

                    {/* Reasoning & Evidence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 bg-[#171717] border border-[#2f2f2f] rounded-xl space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REASONING</div>
                        <FormattedMarkdownText content={response.why} />
                      </div>
                      <div className="p-3.5 bg-[#171717] border border-[#2f2f2f] rounded-xl space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">EVIDENCE METRICS</div>
                        <ul className="space-y-1">
                          {response.evidence?.map((ev, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0"></span>
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Financial Impact & Action */}
                    <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-2">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">EXPECTED FINANCIAL IMPACT</div>
                      <FormattedMarkdownText content={response.financial_impact} />
                      <div className="pt-2 border-t border-blue-800/40">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RECOMMENDED ACTION</div>
                        <FormattedMarkdownText content={response.recommendation} />
                      </div>
                    </div>

                    {/* Footer Stats & Sources */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#2f2f2f]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400">Confidence:</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold text-[11px]">{response.confidence}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-semibold text-slate-400">Sources:</span>
                        <span className="text-slate-300 font-mono">{response.sources?.join(', ')}</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ChatGPT Input Bar Footer */}
        <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="p-4 bg-[#212121] border-t border-[#2f2f2f] flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAsk("What is our current cash runway?")}
            className="p-3 text-slate-400 hover:text-white bg-[#171717] hover:bg-[#2f2f2f] rounded-2xl border border-[#2f2f2f] transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask your friendly AI CFO any question..."
            className="flex-1 bg-[#171717] text-xs text-slate-100 placeholder-slate-400 px-4 py-3 rounded-2xl border border-[#2f2f2f] focus:outline-none focus:border-blue-500 font-medium"
          />

          <button
            type="button"
            onClick={() => handleAsk("Show active financial risk alerts")}
            className="p-3 text-slate-400 hover:text-white bg-[#171717] hover:bg-[#2f2f2f] rounded-2xl border border-[#2f2f2f] transition-colors"
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white rounded-2xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>Ask AI</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};

