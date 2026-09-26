import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  glowColor = 'sky',
  alert = false
}) {
  const iconClasses = {
    sky: 'border-blue-100 text-blue-600 bg-blue-50',
    emerald: 'border-emerald-100 text-emerald-600 bg-emerald-50',
    amber: 'border-amber-100 text-amber-600 bg-amber-50',
    indigo: 'border-indigo-100 text-indigo-600 bg-indigo-50',
    rose: 'border-rose-100 text-rose-600 bg-rose-50'
  };

  return (
    <div className={`card-surface p-5 relative overflow-hidden bg-white ${
      alert ? 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/10' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-tabular">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconClasses[glowColor] || iconClasses.sky} shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
        <span className="text-slate-500 truncate">{subtitle}</span>
        {trend && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] ${
            trendPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-rose-50 text-rose-700 border border-rose-200/70'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
