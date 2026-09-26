import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Layers, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function LandingPageStudio() {
  const { landingPages, setSelectedService, isLoading } = useAnalytics();

  if (isLoading && landingPages.length === 0) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-100 rounded-xl border border-slate-200/80"></div>;
  }

  return (
    <div className="card-surface p-6 bg-white border border-slate-200/90 shadow-subtle font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Landing Page Performance Comparison</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Service-by-service engagement, scroll depth, and revenue attribution
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/60">
              <th className="py-2.5 pl-2.5">Service Page</th>
              <th className="py-2.5 text-right">Visitors</th>
              <th className="py-2.5 text-right">Bounce Rate</th>
              <th className="py-2.5 text-right">Avg Scroll</th>
              <th className="py-2.5 text-right">Form Leads</th>
              <th className="py-2.5 text-right">Qualified</th>
              <th className="py-2.5 text-right">Conv. Rate</th>
              <th className="py-2.5 text-right pr-2.5">Won Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {landingPages.map((page) => (
              <tr
                key={page.slug}
                onClick={() => setSelectedService(page.slug)}
                className="hover:bg-slate-50/80 cursor-pointer transition group"
              >
                <td className="py-3 pl-2.5 font-sans">
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                    /{page.slug}
                    <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-xs">{page.title}</div>
                </td>
                <td className="py-3 text-right text-slate-700">{page.visitors.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <span className={page.bounceRate > 40 ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                    {page.bounceRate}%
                  </span>
                </td>
                <td className="py-3 text-right text-slate-700">{page.avgScroll}%</td>
                <td className="py-3 text-right font-bold text-slate-900">{page.leads}</td>
                <td className="py-3 text-right text-emerald-700 font-bold">{page.qualifiedLeads}</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold">
                    {page.conversionRate}%
                  </span>
                </td>
                <td className="py-3 text-right pr-2.5 font-bold text-emerald-700">
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
