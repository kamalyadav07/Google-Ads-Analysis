import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Layers, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function LandingPageStudio() {
  const { landingPages, setSelectedService, isLoading } = useAnalytics();

  if (isLoading && landingPages.length === 0) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-800/40"></div>;
  }

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Landing Page Performance Comparison</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Service-by-service engagement, scroll depth, and revenue attribution
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-3 pl-2">Service Page</th>
              <th className="pb-3 text-right">Visitors</th>
              <th className="pb-3 text-right">Bounce Rate</th>
              <th className="pb-3 text-right">Avg Scroll</th>
              <th className="pb-3 text-right">Form Leads</th>
              <th className="pb-3 text-right">Qualified</th>
              <th className="pb-3 text-right">Conv. Rate</th>
              <th className="pb-3 text-right pr-2">Won Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {landingPages.map((page) => (
              <tr
                key={page.slug}
                onClick={() => setSelectedService(page.slug)}
                className="hover:bg-slate-800/40 cursor-pointer transition group"
              >
                <td className="py-3 pl-2 font-sans">
                  <div className="font-semibold text-white group-hover:text-sky-400 transition flex items-center gap-1.5">
                    /{page.slug}
                    <ArrowUpRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xs">{page.title}</div>
                </td>
                <td className="py-3 text-right text-slate-200">{page.visitors.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <span className={page.bounceRate > 40 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {page.bounceRate}%
                  </span>
                </td>
                <td className="py-3 text-right text-slate-200">{page.avgScroll}%</td>
                <td className="py-3 text-right font-bold text-white">{page.leads}</td>
                <td className="py-3 text-right text-emerald-400 font-bold">{page.qualifiedLeads}</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                    {page.conversionRate}%
                  </span>
                </td>
                <td className="py-3 text-right pr-2 font-bold text-emerald-400">
                  ₹{page.wonRevenue.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
