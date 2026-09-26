import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Briefcase, Clock, Trophy, AlertCircle, ArrowRight } from 'lucide-react';

export default function CrmSalesFunnel() {
  const { kpis, isLoading } = useAnalytics();

  if (isLoading && !kpis) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-100 rounded-xl border border-slate-200/80"></div>;
  }

  const stages = [
    { name: 'Raw Leads', count: kpis?.leads || 0, dotColor: '#64748B' },
    { name: 'Qualified Leads', count: kpis?.qualifiedLeads || 0, dotColor: '#2563EB' },
    { name: 'Opportunities', count: kpis?.opportunities || 0, dotColor: '#4F46E5' },
    { name: 'Closed Won Deals', count: kpis?.wonDeals || 0, dotColor: '#059669' }
  ];

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Bitrix24 CRM Pipeline & Sales Velocity</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lead qualification SLA, downstream deal progression, and sales cycle efficiency
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {stages.map((st, i) => (
          <div key={st.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{st.name}</span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.dotColor }}></span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {st.count} <span className="text-xs font-normal text-slate-500">units</span>
            </div>

            {i < stages.length - 1 && (
              <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm">
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Latency & Deal Summary */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block">First Sales Contact SLA</span>
            <span className="font-bold text-slate-900 text-sm">
              {kpis?.avgSalesLatencyMinutes || 0} minutes <span className="text-slate-500 font-normal">average latency from submit</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block">Total Pipeline Value Won</span>
            <span className="font-bold text-emerald-700 text-sm font-mono">
              ₹{kpis?.wonRevenue ? kpis.wonRevenue.toLocaleString('en-IN') : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
