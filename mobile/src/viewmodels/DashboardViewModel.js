import { useState, useCallback } from 'react';
import DashboardRepository from '../repositories/DashboardRepository';

export const useDashboardViewModel = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadTime, setLoadTime] = useState(null);

  const loadDashboard = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await DashboardRepository.loadDashboardData(options);
      setDashboardData(data);
      setLoadTime(data.loadTime);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      return await DashboardRepository.loadStats();
    } catch {
      return null;
    }
  }, []);

  return {
    dashboardData,
    isLoading,
    error,
    loadTime,
    loadDashboard,
    loadStats,
  };
};
