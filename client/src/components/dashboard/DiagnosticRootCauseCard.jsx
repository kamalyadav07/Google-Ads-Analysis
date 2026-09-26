import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { AlertCircle, Target, FileText, Bug, Users, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function DiagnosticRootCauseCard() {
  const { diagnostics, isLoading } = useAnalytics();

  if (isLoading && !diagnostics) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-800/40"></div>;
  }

  if (!diagnostics) return null;

  const domainIcons = {
    ADVERTISING: Target,
    LANDING_PAGE: FileText,
    FORM_FRICTION: AlertCircle,
    TECHNICAL: Bug,
    LEAD_QUALITY: Users,
    SALES_CRM: Clock
  };

  return (
    <div className="card-surface p-6 border-amber-500/30 shadow-glow-amber bg-gradient-to-b from-[#131b2e] to-[#111827]">
      {/* Header & Primary Verdict */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-[#1F293D] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 uppercase tracking-wider border border-amber-500/30">
              Automated Root Cause Diagnosis
            </span>
            <span className="text-xs text-slate-400">| Heuristic Attribution Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
            {diagnostics.verdictTitle}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            {diagnostics.verdictDescription}
          </p>
        </div>

        {/* Severity Gauge */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bottleneck Severity</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {diagnostics.severityScore}<span className="text-xs text-slate-500">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5-Pillar Scorecard Grid */}
      <div className="mt-5">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          5-Pillar Failure Domain Evaluation
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {diagnostics.domainScores?.map((d) => {
            const Icon = domainIcons[d.domain] || Target;
            const isCritical = d.score >= 50;

            return (
              <div
                key={d.domain}
                className={`p-3 rounded-lg border transition-all ${
                  isCritical
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isCritical ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className={`text-xs font-bold font-mono ${isCritical ? 'text-amber-400' : 'text-slate-400'}`}>
                    {d.score}%
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-200 line-clamp-2">
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Recommendations */}
      {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#1F293D]">
          <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Recommended Remediation Plan
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {diagnostics.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
