import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Smartphone, Laptop, Tablet, TrendingUp, AlertTriangle, ArrowRight, Eye } from 'lucide-react';

export default function DeviceIntelligenceMatrix() {
  const { devices, selectedDevice, setSelectedDevice, isLoading } = useAnalytics();

  if (isLoading && devices.length === 0) {
    return <div className="card-surface p-6 h-64 animate-pulse bg-slate-100 rounded-xl border border-slate-200/80"></div>;
  }

  // Device helper icons & styling
  const devMeta = {
    mobile: {
      name: 'Phone (Mobile)',
      icon: Smartphone,
      color: 'blue',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    desktop: {
      name: 'Laptop / Desktop',
      icon: Laptop,
      color: 'indigo',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    tablet: {
      name: 'Tablet',
      icon: Tablet,
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
    }
  };

  const phoneDev = devices.find(d => d.category === 'mobile') || {};
  const laptopDev = devices.find(d => d.category === 'desktop') || {};
  const tabletDev = devices.find(d => d.category === 'tablet') || {};

  const phoneConv = phoneDev.conversionRate || 0;
  const laptopConv = laptopDev.conversionRate || 0;
  const convDisparity = (phoneConv > 0 && laptopConv > 0) ? (laptopConv / phoneConv).toFixed(1) : '3.2';

  return (
    <div className="card-surface p-6 bg-white border border-slate-200/90 font-sans">
      {/* Header with Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/90 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Device-Wise Intelligence & Conversion Breakdown</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare traffic volume, scroll depth, form starts, and closed won revenue across Phone, Laptop, and Tablet
          </p>
        </div>

        {/* Device Quick Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
          <span className="text-slate-500 text-[11px] px-2 font-medium">Filter View:</span>
          {['all', 'mobile', 'desktop', 'tablet'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedDevice(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                selectedDevice === cat
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Devices' : (cat === 'mobile' ? 'Phone' : (cat === 'desktop' ? 'Laptop' : 'Tablet'))}
            </button>
          ))}
        </div>
      </div>

      {/* Disparity Insight Callout */}
      <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2.5">
          <span className="p-1 rounded-md bg-blue-100 text-blue-700">
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
              className={`p-4 rounded-xl border bg-white transition-all ${
                selectedDevice === d.category ? 'border-blue-600 ring-2 ring-blue-500/10 shadow-sm' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{meta.name}</h3>
                    <span className="text-[11px] text-slate-500">{d.sessions} sessions</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${meta.badgeClass}`}>
                  {d.conversionRate}% conv.
                </span>
              </div>

              {/* Metric Rows */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Visitors</span>
                  <span className="font-semibold text-slate-900 font-mono">{d.visitors.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Bounce Rate</span>
                  <span className={`font-semibold font-mono ${d.bounceRate > 40 ? 'text-amber-700' : 'text-slate-700'}`}>
                    {d.bounceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Avg Scroll Depth</span>
                  <span className="font-semibold text-slate-900 font-mono">{d.avgScrollDepth}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Form Leads</span>
                  <span className="font-semibold text-slate-900 font-mono">{d.leads} leads</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Qualified Leads</span>
                  <span className="font-semibold text-emerald-700 font-mono">{d.qualifiedLeads}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Won Revenue</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    ₹{d.wonRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Scroll Depth Visual Bar */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Page Consumption (Scroll)</span>
                  <span className="font-medium text-slate-700">{d.avgScrollDepth}% avg</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      d.avgScrollDepth >= 60 ? 'bg-emerald-600' : (d.avgScrollDepth >= 40 ? 'bg-blue-600' : 'bg-amber-500')
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
