import React, { useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { dashboardApi } from '../../services/api';
import { X, Sparkles, Send, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Why did CCTV leads drop today?",
  "Which campaign is spending money with lowest qualified leads?",
  "Diagnose Phone vs Laptop conversion on /cybersecurity",
  "Is our primary bottleneck advertising, landing page, or sales latency?"
];

export default function AiAnalystDrawer({ isOpen, onClose }) {
  const { selectedService } = useAnalytics();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am your **AI Conversion Intelligence Analyst**. I continuously monitor your Google Ads spend, landing page telemetry, form drop-offs, and Bitrix24 deal outcomes.\n\nAsk me any diagnostic question or click one of the suggested prompts below.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q.trim() || isAnalyzing) return;

    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsAnalyzing(true);

    try {
      const res = await dashboardApi.askAiAnalyst(q, selectedService);
      const aiReply = {
        role: 'assistant',
        text: res.data.response,
        engine: res.data.engine
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ **Diagnostic Error:** Could not query the analytics engine. (${err.message})`
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-xl bg-[#0B0F19] border-l border-[#1F293D] shadow-2xl flex flex-col h-full z-10">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1F293D] bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Marketing & Conversion Analyst</h3>
              <p className="text-[11px] text-slate-400">Grounded in real-time MySQL telemetry and diagnostic rules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-[#1F293D] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isAnalyzing}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-sky-500/20 hover:text-sky-300 text-slate-300 border border-slate-700/80 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-indigo-600 text-white shadow-glow-cyan'
                }`}
              >
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-[#111827] border border-[#1F293D] text-slate-200 rounded-tl-none'
                }`}
              >
                <div 
                  className="prose prose-invert prose-xs max-w-none space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/### (.*?)\n/g, '<h4 class="text-sm font-bold text-sky-400 mt-2 mb-1">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\* (.*?)\n/g, '<li class="ml-4 list-disc">$1</li>')
                  }}
                />
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-10">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span>Analyzing funnel telemetry and diagnostic heuristics...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#111827] border-t border-[#1F293D]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask why leads dropped, compare mobile vs laptop..."
              className="flex-1 bg-[#0B0F19] border border-[#1F293D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !input.trim()}
              className="p-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
