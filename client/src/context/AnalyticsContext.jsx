import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { dashboardApi } from '../services/api';

const AnalyticsContext = createContext(null);

export const AnalyticsProvider = ({ children }) => {
  // Global Filters
  const [selectedService, setSelectedService] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [dateRange, setDateRange] = useState('14d');

  // Real-Time Socket.IO State
  const [liveStats, setLiveStats] = useState({
    activeVisitors: 0,
    byPage: {},
    byDevice: { mobile: 0, tablet: 0, desktop: 0 }
  });
  const [liveEvents, setLiveEvents] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Analytical Data States
  const [kpis, setKpis] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [devices, setDevices] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [forms, setForms] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [geo, setGeo] = useState([]);
  const [techHealth, setTechHealth] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('live_stats', (stats) => {
      setLiveStats(stats);
    });

    socket.on('live_event', (event) => {
      setLiveEvents((prev) => [event, ...prev.slice(0, 19)]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        kpiRes,
        funnelRes,
        devRes,
        lpRes,
        formRes,
        campRes,
        geoRes,
        techRes,
        diagRes
      ] = await Promise.all([
        dashboardApi.getOverview(selectedService),
        dashboardApi.getFunnel(selectedService),
        dashboardApi.getDevices(selectedService),
        dashboardApi.getLandingPages(),
        dashboardApi.getForms(selectedService),
        dashboardApi.getCampaigns(),
        dashboardApi.getGeo(),
        dashboardApi.getTechHealth(),
        dashboardApi.getDiagnostics(selectedService, selectedDevice)
      ]);

      setKpis(kpiRes.data);
      setFunnel(funnelRes.data.stages || []);
      setDevices(devRes.data.devices || []);
      setLandingPages(lpRes.data.pages || []);
      setForms(formRes.data.fields || []);
      setCampaigns(campRes.data.campaigns || []);
      setGeo(geoRes.data.cities || []);
      setTechHealth(techRes.data);
      setDiagnostics(diagRes.data);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedService, selectedDevice, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AnalyticsContext.Provider
      value={{
        selectedService,
        setSelectedService,
        selectedDevice,
        setSelectedDevice,
        dateRange,
        setDateRange,
        liveStats,
        liveEvents,
        isSocketConnected,
        kpis,
        funnel,
        devices,
        landingPages,
        forms,
        campaigns,
        geo,
        techHealth,
        diagnostics,
        isLoading,
        refreshData: fetchData
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
