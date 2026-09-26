import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Smartphone, Laptop, Tablet, TrendingUp, AlertTriangle, ArrowRight, Eye } from 'lucide-react';

export default function DeviceIntelligenceMatrix() {
  const { devices, selectedDevice, setSelectedDevice, isLoading } = useAnalytics();

  if (isLoading && devices.length === 0) {
    return <div className="card-surface p-6 h-64 animate-pulse bg-slate-800/40"></div>;
  }

  // Device helper icons & styling
  const devMeta = {
    mobile: {
      name: 'Phone (Mobile)',
      icon: Smartphone,
      color: 'sky',
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    },
    desktop: {
      name: 'Laptop / Desktop',
      icon: Laptop,
      color: 'indigo',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    tablet: {
      name: 'Tablet',
      icon: Tablet,
      color: 'amber',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  };

  const phoneDev = devices.find(d => d.category === 'mobile') || {};
  const laptopDev = devices.find(d => d.category === 'desktop') || {};
  const tabletDev = devices.find(d => d.category === 'tablet') || {};

  const phoneConv = phoneDev.conversionRate || 0;
  const laptopConv = laptopDev.conversionRate || 0;
  const convDisparity = (phoneConv > 0 && laptopConv > 0) ? (laptopConv / phoneConv).toFixed(1) : '3.2';

  return (
    <div className="card-surface p-6">
      {/* Header with Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#1F293D] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Device-Wise Intelligence & Conversion Breakdown</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare traffic volume, scroll depth, form starts, and closed won revenue across Phone, Laptop, and Tablet
          </p>
        </div>

        {/* Device Quick Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-lg border border-[#1F293D] text-xs">
          <span className="text-slate-400 text-[11px] px-2 font-medium">Filter View:</span>
          {['all', 'mobile', 'desktop', 'tablet'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedDevice(cat)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedDevice === cat
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Devices' : (cat === 'mobile' ? 'Phone' : (cat === 'desktop' ? 'Laptop' : 'Tablet'))}
            </button>
          ))}
        </div>
      </div>

      {/* Disparity Insight Callout */}
      <div className="mt-4 p-3 rounded-lg bg-sky-500/5 border border-sky-500/20 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-sky-500/20 text-sky-400">
            <TrendingUp className="w-3.5 h-3.5" />
          </span>
          <span>
            <strong>Device Disparity Insight:</strong> Laptop traffic converts at <strong>{laptopConv}%</strong> vs Phone traffic at <strong>{phoneConv}%</strong> ({convDisparity}x higher on laptop). Phone visitors drop off significantly at 25% scroll.
          </span>
        </div>
      </div>

      {/* 3 Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {devices.map((d) => {
          const meta = devMeta[d.category] || devMeta.desktop;
          const Icon = meta.icon;

          return (
            <div
              key={d.category}
              className={`p-4 rounded-xl border bg-slate-900/60 transition-all ${
                selectedDevice === d.category ? 'border-sky-500 shadow-glow-cyan' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <Icon className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{meta.name}</h3>
                    <span className="text-[11px] text-slate-400">{d.sessions} sessions</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${meta.badgeClass}`}>
                  {d.conversionRate}% conv.
                </span>
              </div>

              {/* Metric Rows */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Total Visitors</span>
                  <span className="font-semibold text-white font-mono">{d.visitors.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Bounce Rate</span>
                  <span className={`font-semibold font-mono ${d.bounceRate > 40 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {d.bounceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Avg Scroll Depth</span>
                  <span className="font-semibold text-white font-mono">{d.avgScrollDepth}%</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Total Form Leads</span>
                  <span className="font-semibold text-white font-mono">{d.leads} leads</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Qualified Leads</span>
                  <span className="font-semibold text-emerald-400 font-mono">{d.qualifiedLeads}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Won Revenue</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    ₹{d.wonRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Scroll Depth Visual Bar */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Page Consumption (Scroll)</span>
                  <span>{d.avgScrollDepth}% avg</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      d.avgScrollDepth >= 60 ? 'bg-emerald-400' : (d.avgScrollDepth >= 40 ? 'bg-sky-400' : 'bg-amber-400')
                    }`}
                    style={{ width: `${Math.min(100, d.avgScrollDepth)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
