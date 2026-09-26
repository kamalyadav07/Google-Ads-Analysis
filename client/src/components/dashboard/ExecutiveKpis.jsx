import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import MetricCard from '../common/MetricCard';
import { IndianRupee, MousePointer, Users, FileCheck, CheckCircle2, Trophy, TrendingUp, Clock } from 'lucide-react';

export default function ExecutiveKpis() {
  const { kpis, isLoading } = useAnalytics();

  if (isLoading && !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-800/40 rounded-xl border border-slate-800"></div>
        ))}
      </div>
    );
  }

  const spend = kpis?.spend || 0;
  const clicks = kpis?.clicks || 0;
  const impressions = kpis?.impressions || 0;
  const visitors = kpis?.visitors || 0;
  const leads = kpis?.leads || 0;
  const qualified = kpis?.qualifiedLeads || 0;
  const wonDeals = kpis?.wonDeals || 0;
  const wonRevenue = kpis?.wonRevenue || 0;
  const cpl = kpis?.cpl || 0;
  const cpql = kpis?.cpql || 0;
  const roas = kpis?.roas || 0;
  const latency = kpis?.avgSalesLatencyMinutes || 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Google Ad Spend */}
      <MetricCard
        title="Google Ad Spend"
        value={`₹${spend.toLocaleString('en-IN')}`}
        subtitle={`${impressions.toLocaleString()} impressions`}
        icon={IndianRupee}
        glowColor="sky"
        trend="+8.2% pacing"
        trendPositive={true}
      />

      {/* 2. Clicks & CPC */}
      <MetricCard
        title="Ad Clicks"
        value={clicks.toLocaleString('en-IN')}
        subtitle={`Avg CPC: ₹${clicks > 0 ? (spend / clicks).toFixed(1) : 0}`}
        icon={MousePointer}
        glowColor="indigo"
        trend={`${impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0}% CTR`}
        trendPositive={true}
      />

      {/* 3. Visitors & Sessions */}
      <MetricCard
        title="Landing Page Visitors"
        value={visitors.toLocaleString('en-IN')}
        subtitle={`${kpis?.sessions || 0} unique sessions`}
        icon={Users}
        glowColor="emerald"
        trend="65% mobile"
        trendPositive={true}
      />

      {/* 4. Total Form Leads & CPL */}
      <MetricCard
        title="Form Leads"
        value={leads.toString()}
        subtitle={`CPL: ₹${cpl.toLocaleString('en-IN')}`}
        icon={FileCheck}
        glowColor="amber"
        trend={`${visitors > 0 ? ((leads / visitors) * 100).toFixed(2) : 0}% conv.`}
        trendPositive={true}
      />

      {/* 5. Qualified Leads & CPQL */}
      <MetricCard
        title="Qualified Leads"
        value={qualified.toString()}
        subtitle={`CPQL: ₹${cpql.toLocaleString('en-IN')}`}
        icon={CheckCircle2}
        glowColor="emerald"
        trend={`${leads > 0 ? ((qualified / leads) * 100).toFixed(1) : 0}% qual rate`}
        trendPositive={qualified > 0}
      />

      {/* 6. Won Revenue */}
      <MetricCard
        title="Won Revenue"
        value={`₹${wonRevenue.toLocaleString('en-IN')}`}
        subtitle={`${wonDeals} deals closed won`}
        icon={Trophy}
        glowColor="amber"
        trend="Direct Closed"
        trendPositive={true}
      />

      {/* 7. ROAS */}
      <MetricCard
        title="ROAS"
        value={`${roas}x`}
        subtitle="Revenue / Ad Spend"
        icon={TrendingUp}
        glowColor="emerald"
        trend={roas >= 4 ? 'High Return' : 'Review Spend'}
        trendPositive={roas >= 3}
      />

      {/* 8. Sales Response Latency */}
      <MetricCard
        title="Sales Latency"
        value={`${latency} min`}
        subtitle="Time to first sales call"
        icon={Clock}
        glowColor={latency > 60 ? 'rose' : 'sky'}
        trend={latency > 90 ? '⚠ High Delay' : 'Within SLA'}
        trendPositive={latency <= 60}
        alert={latency > 90}
      />
    </div>
  );
}
