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
  const glowClasses = {
    sky: 'border-sky-500/20 text-sky-400 bg-sky-500/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-500/10',
    indigo: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/10',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-500/10'
  };

  return (
    <div className={`card-surface p-4.5 relative overflow-hidden ${
      alert ? 'border-amber-500/50 shadow-glow-amber' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-white mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${glowClasses[glowColor] || glowClasses.sky}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate">{subtitle}</span>
        {trend && (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${
            trendPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
