import React, { useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { dashboardApi } from '../../services/api';
import { Radio, RefreshCw, Zap, Calendar, Sparkles } from 'lucide-react';

export default function Header({ onOpenAiDrawer }) {
  const { liveStats, isSocketConnected, dateRange, setDateRange, refreshData, isLoading } = useAnalytics();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateLead = async () => {
    setIsSimulating(true);
    try {
      await dashboardApi.simulateLead({
        service: 'cctv',
        company: 'Delhi Logistics Corp',
        name: 'Vikas Malhotra',
        phone: '+91 9811223344',
        status: 'QUALIFIED'
      });
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <header className="bg-[#111827] border-b border-[#1F293D] px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Live Pulse */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/20">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-white">Marketing & Conversion Intelligence</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-funnel attribution: Google Ads ──► Landing Page Telemetry ──► Bitrix24 CRM
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* AI Analyst Trigger */}
          <button
            onClick={onOpenAiDrawer}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:border-sky-400 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            AI Analyst
          </button>

          {/* Test Lead Simulator */}
          <button
            onClick={handleSimulateLead}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition"
            title="Fire a synthetic Bitrix24 lead to verify live pipeline updates"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {isSimulating ? 'Simulating...' : 'Simulate Lead'}
          </button>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-[#0B0F19] border border-[#1F293D] rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="today" className="bg-slate-900 text-slate-100">Today</option>
              <option value="7d" className="bg-slate-900 text-slate-100">Last 7 Days</option>
              <option value="14d" className="bg-slate-900 text-slate-100">Last 14 Days</option>
              <option value="30d" className="bg-slate-900 text-slate-100">Last 30 Days</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-[#0B0F19] border border-[#1F293D] text-slate-400 hover:text-white transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
