import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Shield, Camera, Server, Video, Network, HardDrive, Layers } from 'lucide-react';

const SERVICES = [
  { slug: 'all', label: 'All Services', icon: Layers },
  { slug: 'cctv', label: 'CCTV & Surveillance', icon: Camera },
  { slug: 'noc', label: '24/7 NOC Services', icon: Server },
  { slug: 'video-conferencing', label: 'Video Conferencing', icon: Video },
  { slug: 'cybersecurity', label: 'Cybersecurity & SOC', icon: Shield },
  { slug: 'data-center', label: 'Data Center Colocation', icon: HardDrive },
  { slug: 'networking', label: 'Enterprise Networking', icon: Network }
];

export default function ServiceSelector() {
  const { selectedService, setSelectedService, liveStats } = useAnalytics();

  return (
    <div className="bg-[#111827] border-b border-[#1F293D] px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const isActive = selectedService === s.slug;
          const liveCount = (s.slug === 'all') 
            ? liveStats.activeVisitors 
            : (liveStats.byPage[s.slug] || 0);

          return (
            <button
              key={s.slug}
              onClick={() => setSelectedService(s.slug)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
              {liveCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-sky-400/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {liveCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
