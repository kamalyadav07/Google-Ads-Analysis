import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Filter, AlertTriangle, ArrowDown, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ConversionFunnel13() {
  const { funnel, isLoading } = useAnalytics();

  if (isLoading && funnel.length === 0) {
    return (
      <div className="card-surface p-6 animate-pulse bg-slate-100 rounded-xl border border-slate-200/80">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200/70 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate highest count for bar width scaling (impressions is top, but for visible scale we normalize from clicks down)
  const maxBarValue = funnel.length > 2 ? funnel[2].count : 1000;

  return (
    <div className="card-surface p-6 bg-white border border-slate-200/90 shadow-subtle font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/90 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Full 13-Stage Conversion Funnel</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click-to-Cash attribution tracking drop-offs from impression down to won deal revenue
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Normal Flow
          </span>
          <span className="flex items-center gap-1.5 text-amber-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Anomaly / Friction
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {funnel.map((stage, idx) => {
          // Normalize bar width
          let widthPct = 100;
          if (idx === 0) widthPct = 100;
          else if (idx === 1) widthPct = 85;
          else {
            widthPct = Math.max(8, Math.min(100, Math.round((stage.count / (maxBarValue || 1)) * 100)));
          }

          const hasDropAnomaly = parseFloat(stage.dropOffPct) > 70 && idx > 2;

          return (
            <div key={stage.name} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                  <span className="font-semibold text-slate-800">{stage.name}</span>
                  {hasDropAnomaly && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      ⚠ High Drop-off (-{stage.dropOffPct}%)
                    </span>
                  )}
                  {stage.name === 'Won Deals' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ₹{stage.revenue ? stage.revenue.toLocaleString('en-IN') : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="font-mono text-slate-500 text-xs">
                    {stage.convPct}% step conv.
                  </span>
                  <span className="font-bold text-slate-900 text-sm font-mono w-20">
                    {stage.count.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hasDropAnomaly
                      ? 'bg-amber-500'
                      : (stage.name === 'Won Deals'
                        ? 'bg-emerald-600'
                        : 'bg-blue-600')
                  }`}
                  style={{ width: `${widthPct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
