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
    <header className="bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-6 py-3.5 sticky top-0 z-30 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Live Pulse */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900">Marketing & Conversion Intelligence</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping-slow"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cross-funnel attribution: Google Ads ──► Landing Page Telemetry ──► Bitrix24 CRM
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* AI Analyst Trigger */}
          <button
            onClick={onOpenAiDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            AI Analyst
          </button>

          {/* Test Lead Simulator */}
          <button
            onClick={handleSimulateLead}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-medium hover:bg-slate-50 shadow-sm transition"
            title="Fire a synthetic Bitrix24 lead to verify live pipeline updates"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            {isSimulating ? 'Simulating...' : 'Simulate Lead'}
          </button>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="14d">Last 14 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
