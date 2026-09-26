import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Target, TrendingUp, IndianRupee } from 'lucide-react';

export default function CampaignIntelligence() {
  const { campaigns, isLoading } = useAnalytics();

  if (isLoading && campaigns.length === 0) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-100 rounded-xl border border-slate-200/80"></div>;
  }

  return (
    <div className="card-surface p-6 bg-white border border-slate-200/90 shadow-subtle font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Google Ads Campaign Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ad spend, CPC efficiency, and closed conversion performance across all search campaigns
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/60">
              <th className="py-2.5 pl-2.5">Campaign Name</th>
              <th className="py-2.5 text-right">Daily Budget</th>
              <th className="py-2.5 text-right">Impressions</th>
              <th className="py-2.5 text-right">Clicks</th>
              <th className="py-2.5 text-right">CTR</th>
              <th className="py-2.5 text-right">Avg CPC</th>
              <th className="py-2.5 text-right">Spend</th>
              <th className="py-2.5 text-right">Conversions</th>
              <th className="py-2.5 text-right pr-2.5">Cost / Conv</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 pl-2.5 font-sans font-semibold text-slate-900">
                  {c.name}
                  <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                </td>
                <td className="py-3 text-right text-slate-700">₹{c.dailyBudget.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-slate-700">{c.impressions.toLocaleString()}</td>
                <td className="py-3 text-right text-slate-900 font-bold">{c.clicks.toLocaleString()}</td>
                <td className="py-3 text-right text-blue-600 font-bold">{c.ctr}%</td>
                <td className="py-3 text-right text-slate-700">₹{c.cpc}</td>
                <td className="py-3 text-right text-slate-900 font-bold">₹{c.spend.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-emerald-700 font-bold">{c.conversions}</td>
                <td className="py-3 text-right pr-2.5 text-slate-700">₹{c.costPerConversion.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
