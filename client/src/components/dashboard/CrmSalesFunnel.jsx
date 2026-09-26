import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Briefcase, Clock, Trophy, AlertCircle, ArrowRight } from 'lucide-react';

export default function CrmSalesFunnel() {
  const { kpis, isLoading } = useAnalytics();

  if (isLoading && !kpis) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-800/40"></div>;
  }

  const stages = [
    { name: 'Raw Leads', count: kpis?.leads || 0, color: 'bg-slate-700' },
    { name: 'Qualified Leads', count: kpis?.qualifiedLeads || 0, color: 'bg-sky-600' },
    { name: 'Opportunities', count: kpis?.opportunities || 0, color: 'bg-indigo-600' },
    { name: 'Closed Won Deals', count: kpis?.wonDeals || 0, color: 'bg-emerald-500' }
  ];

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Bitrix24 CRM Pipeline & Sales Velocity</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Lead qualification SLA, downstream deal progression, and sales cycle efficiency
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {stages.map((st, i) => (
          <div key={st.name} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{st.name}</span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color.replace('bg-', '') }}></span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {st.count} <span className="text-xs font-normal text-slate-400">units</span>
            </div>

            {i < stages.length - 1 && (
              <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Latency & Deal Summary */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block">First Sales Contact SLA</span>
            <span className="font-bold text-white text-sm">
              {kpis?.avgSalesLatencyMinutes || 0} minutes <span className="text-slate-400 font-normal">average latency from submit</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block">Total Pipeline Value Won</span>
            <span className="font-bold text-emerald-400 text-sm font-mono">
              ₹{kpis?.wonRevenue ? kpis.wonRevenue.toLocaleString('en-IN') : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
