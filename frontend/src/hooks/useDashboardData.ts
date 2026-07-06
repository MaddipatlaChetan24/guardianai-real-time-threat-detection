// frontend/src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';

interface ThreatLevel {
  level: string;
  count: number;
}

interface IncidentSummary {
  id: number;
  title: string;
  threatLevel: string;
  timestamp: string;
  location: string;
}

export const useDashboardData = () => {
  const [threatLevels, setThreatLevels] = useState<ThreatLevel[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch threat levels
        const threatLevelsData = await dashboardService.getThreatLevels();
        setThreatLevels(threatLevelsData);
        
        // Fetch recent incidents
        const incidentsData = await dashboardService.getRecentIncidents();
        setRecentIncidents(incidentsData);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { threatLevels, recentIncidents, loading, error };
};
