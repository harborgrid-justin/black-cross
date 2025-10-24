/**
 * @fileoverview Dashboard API service.
 *
 * Provides methods for retrieving dashboard metrics, statistics, and visualizations
 * for the main security operations dashboard.
 *
 * Authentication: All methods require a valid bearer token.
 *
 * @module services/dashboardService
 */

import { apiClient } from './api';
import type { ApiResponse } from '@/types';

/**
 * Main dashboard statistics structure.
 */
interface DashboardStats {
  activeThreats: number;
  openIncidents: number;
  vulnerabilities: number;
  riskScore: number;
  threatTrend: number;
  incidentTrend: number;
  vulnTrend: number;
}

/**
 * Recent threat item structure.
 */
interface RecentThreat {
  id: string;
  name: string;
  severity: string;
  time: string;
}

/**
 * System health metrics structure.
 */
interface SystemHealth {
  threatIntelligence: number;
  siemIntegration: number;
  incidentResponse: number;
  vulnerabilityScanning: number;
}

/**
 * Service for handling dashboard API operations.
 *
 * Provides methods for retrieving real-time metrics, trends, and system health
 * information displayed on the main security operations dashboard.
 *
 * Authentication: All endpoints require authentication via bearer token.
 *
 * @namespace dashboardService
 *
 * @example
 * ```typescript
 * import { dashboardService } from './services/dashboardService';
 *
 * // Get main dashboard stats
 * const stats = await dashboardService.getStats();
 * console.log(`Active threats: ${stats.data.activeThreats}`);
 *
 * // Get recent threats
 * const threats = await dashboardService.getRecentThreats(5);
 * ```
 */
export const dashboardService = {
  /**
   * Retrieves main dashboard statistics.
   *
   * Returns high-level metrics including active threats, open incidents,
   * vulnerabilities, overall risk score, and trend indicators.
   *
   * @async
   * @returns {Promise<ApiResponse<DashboardStats>>} Dashboard statistics
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const response = await dashboardService.getStats();
   * const stats = response.data;
   *
   * console.log(`Active Threats: ${stats.activeThreats}`);
   * console.log(`Open Incidents: ${stats.openIncidents}`);
   * console.log(`Vulnerabilities: ${stats.vulnerabilities}`);
   * console.log(`Risk Score: ${stats.riskScore}/100`);
   * console.log(`Threat Trend: ${stats.threatTrend > 0 ? 'Increasing' : 'Decreasing'}`);
   * ```
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  },

  /**
   * Retrieves recent threat detections.
   *
   * Returns the most recently detected threats with severity and timestamp.
   * Results are sorted by detection time in descending order.
   *
   * @async
   * @param {number} [limit=10] - Maximum number of threats to return (default: 10)
   * @returns {Promise<ApiResponse<RecentThreat[]>>} List of recent threats
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 400 Bad Request if limit is invalid (e.g., negative or too large)
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * // Get last 5 threats
   * const response = await dashboardService.getRecentThreats(5);
   * response.data.forEach(threat => {
   *   console.log(`${threat.time}: ${threat.name} (${threat.severity})`);
   * });
   *
   * // Example output:
   * // "2025-10-24T10:30:00Z: Ransomware detected (critical)"
   * // "2025-10-24T09:15:00Z: Phishing attempt (high)"
   * ```
   */
  async getRecentThreats(limit = 10): Promise<ApiResponse<RecentThreat[]>> {
    return apiClient.get<ApiResponse<RecentThreat[]>>(`/dashboard/recent-threats?limit=${limit}`);
  },

  /**
   * Retrieves system health metrics.
   *
   * Returns health status percentages for key system components including
   * threat intelligence, SIEM integration, incident response, and vulnerability scanning.
   * Values are percentages from 0-100.
   *
   * @async
   * @returns {Promise<ApiResponse<SystemHealth>>} System health metrics
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const response = await dashboardService.getSystemHealth();
   * const health = response.data;
   *
   * console.log(`Threat Intelligence: ${health.threatIntelligence}%`);
   * console.log(`SIEM Integration: ${health.siemIntegration}%`);
   * console.log(`Incident Response: ${health.incidentResponse}%`);
   * console.log(`Vulnerability Scanning: ${health.vulnerabilityScanning}%`);
   *
   * // Alert if any system is unhealthy
   * Object.entries(health).forEach(([system, percentage]) => {
   *   if (percentage < 80) {
   *     console.warn(`${system} health is below 80%`);
   *   }
   * });
   * ```
   */
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return apiClient.get<ApiResponse<SystemHealth>>('/dashboard/system-health');
  },

  /**
   * Retrieves threat activity data for time-series charts.
   *
   * Returns threat activity metrics over a specified time period for
   * visualization in dashboard charts and graphs.
   *
   * @async
   * @param {number} [days=7] - Number of days of historical data to return (default: 7)
   * @returns {Promise<ApiResponse<unknown>>} Threat activity time-series data
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 400 Bad Request if days parameter is invalid
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * // Get last 7 days of threat activity
   * const activity = await dashboardService.getThreatActivity(7);
   * // Use data to populate line/bar charts
   *
   * // Get last 30 days for monthly view
   * const monthlyActivity = await dashboardService.getThreatActivity(30);
   * ```
   */
  async getThreatActivity(days = 7): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/dashboard/threat-activity?days=${days}`);
  },

  /**
   * Retrieves quick statistics for dashboard widgets.
   *
   * Returns condensed statistics optimized for small dashboard widgets
   * and quick glance metrics.
   *
   * @async
   * @returns {Promise<ApiResponse<unknown>>} Quick statistics summary
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const quickStats = await dashboardService.getQuickStats();
   * // Display in small widgets across the dashboard
   * ```
   */
  async getQuickStats(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/dashboard/quick-stats');
  },
};
