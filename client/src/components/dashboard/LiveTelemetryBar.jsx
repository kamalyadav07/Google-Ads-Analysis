import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Smartphone, Laptop, Tablet, Activity, Radio, ArrowRight } from 'lucide-react';

export default function LiveTelemetryBar() {
  const { liveStats, liveEvents } = useAnalytics();

  const total = liveStats.activeVisitors || 0;
  const dev = liveStats.byDevice || { mobile: 0, tablet: 0, desktop: 0 };
  const pages = liveStats.byPage || {};

  const phonePct = total > 0 ? Math.round((dev.mobile / total) * 100) : 65;
  const laptopPct = total > 0 ? Math.round((dev.desktop / total) * 100) : 28;
  const tabletPct = total > 0 ? Math.round((dev.tablet / total) * 100) : 7;

  return (
    <div className="card-surface p-4 border border-sky-500/20 shadow-glow-cyan bg-gradient-to-r from-[#111827] via-[#131b2e] to-[#111827]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Active Visitors & Device Ratio */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
            <div className="relative">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 block"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 absolute top-0 left-0 animate-ping-slow"></span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Live Now</span>
              <span className="text-xl font-extrabold text-white leading-tight">
                {total} <span className="text-xs font-normal text-slate-400">active visitors</span>
              </span>
            </div>
          </div>

          {/* Device Split Pills */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Phone: <strong className="text-white">{phonePct}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              <span>Laptop: <strong className="text-white">{laptopPct}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Tablet className="w-3.5 h-3.5 text-amber-400" />
              <span>Tablet: <strong className="text-white">{tabletPct}%</strong></span>
            </div>
          </div>

          {/* Active by Service Page */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 pl-2">
            <span>Active on:</span>
            {Object.entries(pages).map(([slug, count]) => {
              if (count === 0) return null;
              return (
                <span key={slug} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                  /{slug}: <strong className="text-sky-400">{count}</strong>
                </span>
              );
            })}
          </div>
        </div>

        {/* Live Incoming Event Ticker */}
        <div className="flex items-center gap-2 overflow-hidden max-w-lg text-xs">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="truncate text-slate-300">
            {liveEvents.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px]">
                  /{liveEvents[0].page}
                </span>
                <span className="text-slate-200 font-medium truncate">
                  {liveEvents[0].elementText || liveEvents[0].eventType}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">({liveEvents[0].device})</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">Listening for live landing page beacons...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
