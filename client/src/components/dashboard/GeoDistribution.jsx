import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { MapPin, Globe } from 'lucide-react';

export default function GeoDistribution() {
  const { geo, isLoading } = useAnalytics();

  if (isLoading && geo.length === 0) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-800/40"></div>;
  }

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Geographic Market Performance</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            City-level lead volume, qualification rate, and revenue distribution across India
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-3 pl-2">City / Region</th>
              <th className="pb-3 text-right">State</th>
              <th className="pb-3 text-right">Visitors</th>
              <th className="pb-3 text-right">Sessions</th>
              <th className="pb-3 text-right">Leads</th>
              <th className="pb-3 text-right">Qualified</th>
              <th className="pb-3 text-right">Conv. Rate</th>
              <th className="pb-3 text-right pr-2">Won Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {geo.map((g) => (
              <tr key={`${g.city}-${g.state}`} className="hover:bg-slate-800/40 transition">
                <td className="py-3 pl-2 font-sans font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {g.city}
                </td>
                <td className="py-3 text-right font-sans text-slate-400">{g.state}</td>
                <td className="py-3 text-right text-slate-300">{g.visitors.toLocaleString()}</td>
                <td className="py-3 text-right text-slate-200">{g.sessions.toLocaleString()}</td>
                <td className="py-3 text-right font-bold text-white">{g.leads}</td>
                <td className="py-3 text-right text-emerald-400 font-bold">{g.qualifiedLeads}</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">
                    {g.conversionRate}%
                  </span>
                </td>
                <td className="py-3 text-right pr-2 font-bold text-emerald-400">
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
