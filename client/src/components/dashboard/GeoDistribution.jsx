import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { MapPin, Globe } from 'lucide-react';

export default function GeoDistribution() {
  const { geo, isLoading } = useAnalytics();

  if (isLoading && geo.length === 0) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-100 rounded-xl border border-slate-200/80"></div>;
  }

  return (
    <div className="card-surface p-6 bg-white border border-slate-200/90 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Geographic Market Performance</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            City-level lead volume, qualification rate, and revenue distribution across India
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/60">
              <th className="py-2.5 pl-2.5">City / Region</th>
              <th className="py-2.5 text-right">State</th>
              <th className="py-2.5 text-right">Visitors</th>
              <th className="py-2.5 text-right">Sessions</th>
              <th className="py-2.5 text-right">Leads</th>
              <th className="py-2.5 text-right">Qualified</th>
              <th className="py-2.5 text-right">Conv. Rate</th>
              <th className="py-2.5 text-right pr-2.5">Won Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {geo.map((g) => (
              <tr key={`${g.city}-${g.state}`} className="hover:bg-slate-50/80 transition">
                <td className="py-3 pl-2.5 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {g.city}
                </td>
                <td className="py-3 text-right font-sans text-slate-500">{g.state}</td>
                <td className="py-3 text-right text-slate-700">{g.visitors.toLocaleString()}</td>
                <td className="py-3 text-right text-slate-700">{g.sessions.toLocaleString()}</td>
                <td className="py-3 text-right font-bold text-slate-900">{g.leads}</td>
                <td className="py-3 text-right text-emerald-700 font-bold">{g.qualifiedLeads}</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold">
                    {g.conversionRate}%
                  </span>
                </td>
                <td className="py-3 text-right pr-2.5 font-bold text-emerald-700">
                  ₹{g.revenue.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
