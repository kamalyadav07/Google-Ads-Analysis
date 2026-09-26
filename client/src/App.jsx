import React, { useState } from 'react';
import { useAnalytics } from './context/AnalyticsContext';
import Header from './components/common/Header';
import ServiceSelector from './components/common/ServiceSelector';
import ExecutiveKpis from './components/dashboard/ExecutiveKpis';
import LiveTelemetryBar from './components/dashboard/LiveTelemetryBar';
import ConversionFunnel13 from './components/dashboard/ConversionFunnel13';
import DiagnosticRootCauseCard from './components/dashboard/DiagnosticRootCauseCard';
import DeviceIntelligenceMatrix from './components/dashboard/DeviceIntelligenceMatrix';
import LandingPageStudio from './components/dashboard/LandingPageStudio';
import FormFrictionWaterfall from './components/dashboard/FormFrictionWaterfall';
import CampaignIntelligence from './components/dashboard/CampaignIntelligence';
import GeoDistribution from './components/dashboard/GeoDistribution';
import TechHealthRadar from './components/dashboard/TechHealthRadar';
import CrmSalesFunnel from './components/dashboard/CrmSalesFunnel';
import AiAnalystDrawer from './components/dashboard/AiAnalystDrawer';

import { 
  BarChart3, 
  Layers, 
  FileSpreadsheet, 
  Target, 
  MapPin, 
  Briefcase, 
  Activity, 
  Smartphone 
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Executive Command Center', icon: BarChart3 },
  { id: 'funnel', label: '13-Stage Funnel & Devices', icon: Smartphone },
  { id: 'pages', label: 'Landing Page Studio', icon: Layers },
  { id: 'forms', label: 'Form Friction Waterfall', icon: FileSpreadsheet },
  { id: 'campaigns', label: 'Google Ads & ROAS', icon: Target },
  { id: 'geo', label: 'Geographic Markets', icon: MapPin },
  { id: 'crm', label: 'Bitrix24 CRM Funnel', icon: Briefcase },
  { id: 'tech', label: 'Technical Health', icon: Activity }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const { selectedService } = useAnalytics();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* 1. Executive Top Bar */}
      <Header onOpenAiDrawer={() => setIsAiDrawerOpen(true)} />

      {/* 2. Service Tabs Filter */}
      <ServiceSelector />

      {/* 3. Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/90 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-blue-700 border border-slate-200/90 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Executive Command Center */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <LiveTelemetryBar />
            <ExecutiveKpis />
            <DiagnosticRootCauseCard />
            <DeviceIntelligenceMatrix />
            <ConversionFunnel13 />
          </div>
        )}

        {/* Tab 2: 13-Stage Funnel & Devices */}
        {activeTab === 'funnel' && (
          <div className="space-y-6">
            <DeviceIntelligenceMatrix />
            <ConversionFunnel13 />
          </div>
        )}

        {/* Tab 3: Landing Page Studio */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <LandingPageStudio />
            <FormFrictionWaterfall />
          </div>
        )}

        {/* Tab 4: Form Friction Waterfall */}
        {activeTab === 'forms' && (
          <div className="space-y-6">
            <FormFrictionWaterfall />
            <DiagnosticRootCauseCard />
          </div>
        )}

        {/* Tab 5: Google Ads & ROAS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <CampaignIntelligence />
            <ExecutiveKpis />
          </div>
        )}

        {/* Tab 6: Geographic Markets */}
        {activeTab === 'geo' && (
          <div className="space-y-6">
            <GeoDistribution />
          </div>
        )}

        {/* Tab 7: Bitrix24 CRM Funnel */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <CrmSalesFunnel />
            <ConversionFunnel13 />
          </div>
        )}

        {/* Tab 8: Technical Health */}
        {activeTab === 'tech' && (
          <div className="space-y-6">
            <TechHealthRadar />
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-[#1F293D] bg-[#111827] py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Marketing & Landing Page Intelligence Platform &copy; 2026. Production Ready.</span>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/kamalyadav07/Google-Ads-Analysis.git" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition underline"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <span className="font-mono text-[11px] text-sky-400">Filter: /{selectedService}</span>
          </div>
        </div>
      </footer>

      {/* 5. AI Analyst Slide-out Drawer */}
      <AiAnalystDrawer 
        isOpen={isAiDrawerOpen} 
        onClose={() => setIsAiDrawerOpen(false)} 
      />
    </div>
  );
}
