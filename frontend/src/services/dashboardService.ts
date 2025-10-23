/**
 * @fileoverview Dashboard API service.
 * 
 * Provides methods for retrieving dashboard metrics, statistics, and visualizations.
 * 
 * @module services/dashboardService
 */

import { apiClient } from './api';
import type { ApiResponse } from '@/types';

interface DashboardStats {
  activeThreats: number;
  openIncidents: number;
  vulnerabilities: number;
  riskScore: number;
  threatTrend: number;
  incidentTrend: number;
  vulnTrend: number;
}

interface RecentThreat {
  id: string;
  name: string;
  severity: string;
  time: string;
}

interface SystemHealth {
  threatIntelligence: number;
  siemIntegration: number;
  incidentResponse: number;
  vulnerabilityScanning: number;
}

/**
 * Service for handling dashboard API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace dashboardService
 */
export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  },

  // Get recent threats
  async getRecentThreats(limit = 10): Promise<ApiResponse<RecentThreat[]>> {
    return apiClient.get<ApiResponse<RecentThreat[]>>(`/dashboard/recent-threats?limit=${limit}`);
  },

  // Get system health metrics
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return apiClient.get<ApiResponse<SystemHealth>>('/dashboard/system-health');
  },

  // Get threat activity data for charts
  async getThreatActivity(days = 7): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/dashboard/threat-activity?days=${days}`);
  },

  // Get quick stats
  async getQuickStats(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/dashboard/quick-stats');
  },
};
