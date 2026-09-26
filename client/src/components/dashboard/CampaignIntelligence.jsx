import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Target, TrendingUp, IndianRupee } from 'lucide-react';

export default function CampaignIntelligence() {
  const { campaigns, isLoading } = useAnalytics();

  if (isLoading && campaigns.length === 0) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-800/40"></div>;
  }

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Google Ads Campaign Intelligence</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ad spend, CPC efficiency, and closed conversion performance across all search campaigns
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-3 pl-2">Campaign Name</th>
              <th className="pb-3 text-right">Daily Budget</th>
              <th className="pb-3 text-right">Impressions</th>
              <th className="pb-3 text-right">Clicks</th>
              <th className="pb-3 text-right">CTR</th>
              <th className="pb-3 text-right">Avg CPC</th>
              <th className="pb-3 text-right">Spend</th>
              <th className="pb-3 text-right">Conversions</th>
              <th className="pb-3 text-right pr-2">Cost / Conv</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 pl-2 font-sans font-semibold text-white">
                  {c.name}
                  <div className="text-[10px] text-slate-500 font-mono">{c.id}</div>
                </td>
                <td className="py-3 text-right text-slate-300">₹{c.dailyBudget.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-slate-300">{c.impressions.toLocaleString()}</td>
                <td className="py-3 text-right text-slate-200 font-bold">{c.clicks.toLocaleString()}</td>
                <td className="py-3 text-right text-sky-400">{c.ctr}%</td>
                <td className="py-3 text-right text-slate-300">₹{c.cpc}</td>
                <td className="py-3 text-right text-white font-bold">₹{c.spend.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-emerald-400 font-bold">{c.conversions}</td>
                <td className="py-3 text-right pr-2 text-slate-300">₹{c.costPerConversion.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
