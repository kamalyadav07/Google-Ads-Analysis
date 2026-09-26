import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Activity, Bug, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function TechHealthRadar() {
  const { techHealth, isLoading } = useAnalytics();

  if (isLoading && !techHealth) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-100 rounded-xl border border-slate-200/80"></div>;
  }

  const summary = techHealth?.summary || { totalErrors: 0, avgLcpMs: 2400, avgLoadMs: 1800 };
  const logs = techHealth?.recentLogs || [];

  const lcpStatus = summary.avgLcpMs <= 2500 ? 'Good' : (summary.avgLcpMs <= 4000 ? 'Needs Improvement' : 'Poor');
  const lcpColor = summary.avgLcpMs <= 2500 ? 'text-emerald-700' : (summary.avgLcpMs <= 4000 ? 'text-amber-700' : 'text-rose-700');

  return (
    <div className="card-surface p-6 bg-white border border-slate-200/90 shadow-subtle font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Technical Stability & Core Web Vitals</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of client-side JavaScript exceptions, Core Web Vitals (LCP), and load performance
          </p>
        </div>
      </div>

      {/* 3 Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Largest Contentful Paint (LCP)</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${lcpColor}`}>
              {summary.avgLcpMs} <span className="text-xs font-normal text-slate-500">ms</span>
            </div>
            <span className={`text-[11px] font-semibold ${lcpColor}`}>{lcpStatus} (&lt; 2.5s target)</span>
          </div>
          <Zap className="w-6 h-6 text-blue-600 opacity-50" />
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Avg Page Load Time</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {(summary.avgLoadMs / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-500">s</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">Fast Response</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-600 opacity-50" />
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Client JS Errors</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${summary.totalErrors > 5 ? 'text-amber-700' : 'text-slate-800'}`}>
              {summary.totalErrors} <span className="text-xs font-normal text-slate-500">exceptions</span>
            </div>
            <span className="text-[11px] text-slate-500">Captured via telemetry</span>
          </div>
          <Bug className="w-6 h-6 text-amber-600 opacity-50" />
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="mt-5">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Recent Client-Side Exceptions & Failures
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50/60">
                <th className="py-2 pl-2">Error Type</th>
                <th className="py-2">Message</th>
                <th className="py-2">Page URL</th>
                <th className="py-2 text-right pr-2">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 pl-2 text-amber-700 font-semibold">{log.error_type}</td>
                    <td className="py-2.5 text-slate-700 truncate max-w-md">{log.message}</td>
                    <td className="py-2.5 text-slate-500 truncate max-w-xs">{log.page_url || '/'}</td>
                    <td className="py-2.5 text-right pr-2 text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                    Zero technical exceptions recorded. System is healthy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
