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
    <div className="card-surface p-4 bg-white border border-slate-200/90 shadow-subtle font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Active Visitors & Device Ratio */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 absolute top-0 left-0 animate-ping-slow"></span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Live Now</span>
              <span className="text-xl font-bold text-slate-900 leading-tight">
                {total} <span className="text-xs font-normal text-slate-500">active visitors</span>
              </span>
            </div>
          </div>

          {/* Device Split Pills */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Phone: <strong className="text-slate-900 font-semibold">{phonePct}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
              <Laptop className="w-3.5 h-3.5 text-indigo-600" />
              <span>Laptop: <strong className="text-slate-900 font-semibold">{laptopPct}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
              <Tablet className="w-3.5 h-3.5 text-amber-600" />
              <span>Tablet: <strong className="text-slate-900 font-semibold">{tabletPct}%</strong></span>
            </div>
          </div>

          {/* Active by Service Page */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 pl-2">
            <span>Active on:</span>
            {Object.entries(pages).map(([slug, count]) => {
              if (count === 0) return null;
              return (
                <span key={slug} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                  /{slug}: <strong className="text-blue-600">{count}</strong>
                </span>
              );
            })}
          </div>
        </div>

        {/* Live Incoming Event Ticker */}
        <div className="flex items-center gap-2 overflow-hidden max-w-lg text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
          <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <div className="truncate text-slate-600">
            {liveEvents.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-mono text-[10px] font-semibold">
                  /{liveEvents[0].page}
                </span>
                <span className="text-slate-800 font-medium truncate">
                  {liveEvents[0].elementText || liveEvents[0].eventType}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-medium">({liveEvents[0].device})</span>
              </span>
            ) : (
              <span className="text-slate-500 italic">Listening for live landing page beacons...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
