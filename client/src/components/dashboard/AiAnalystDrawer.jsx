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
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-10">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Marketing & Conversion Analyst</h3>
              <p className="text-[11px] text-slate-500">Grounded in real-time MySQL telemetry and diagnostic rules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isAnalyzing}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 border border-slate-200 shadow-sm font-medium transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50">
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-white shadow-sm'
                }`}
              >
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                }`}
              >
                <div 
                  className="prose prose-xs max-w-none space-y-2 text-inherit"
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/### (.*?)\n/g, '<h4 class="text-sm font-bold text-blue-700 mt-2 mb-1">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\* (.*?)\n/g, '<li class="ml-4 list-disc">$1</li>')
                  }}
                />
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic pl-10">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>Analyzing funnel telemetry and diagnostic heuristics...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
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
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !input.trim()}
              className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 shadow-sm transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
