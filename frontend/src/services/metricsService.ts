/**
 * @fileoverview Metrics & Analytics API service.
 * 
 * Provides methods for recording metrics, querying time-series data,
 * managing dashboards, and configuring alert thresholds.
 * 
 * @module services/metricsService
 */

import { apiClient } from './api';
import type { ApiResponse } from '@/types';

/**
 * Metric types
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

/**
 * Time period for metrics aggregation
 */
export enum TimePeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

/**
 * Metric category
 */
export enum MetricCategory {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  USAGE = 'usage',
  BUSINESS = 'business',
}

/**
 * Core metric interface
 */
export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  category: MetricCategory;
  value: number;
  unit?: string;
  labels: Record<string, string>;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  labels?: Record<string, string>;
}

/**
 * Time series data
 */
export interface TimeSeriesData {
  metric_name: string;
  data_points: TimeSeriesDataPoint[];
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'number' | 'table';
  title: string;
  metric_query: MetricQuery;
  size: 'small' | 'medium' | 'large';
  refresh_interval?: number;
  config?: Record<string, any>;
}

/**
 * Dashboard configuration
 */
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  category: string;
  widgets: DashboardWidget[];
  layout?: Array<{
    widget_id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Metric query for filtering and aggregation
 */
export interface MetricQuery {
  metric_name: string;
  start_time?: string;
  end_time?: string;
  labels?: Record<string, string>;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  group_by?: string[];
  interval?: TimePeriod;
}

/**
 * Security metrics
 */
export interface SecurityMetrics {
  total_threats: number;
  threats_by_severity: Record<string, number>;
  active_incidents: number;
  incidents_by_status: Record<string, number>;
  vulnerabilities_open: number;
  vulnerabilities_by_severity: Record<string, number>;
  iocs_detected: number;
  malware_samples: number;
  compliance_score: number;
  mean_time_to_detect: number;
  mean_time_to_respond: number;
  mean_time_to_resolve: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  api_requests_total: number;
  api_requests_per_second: number;
  api_response_time_avg: number;
  api_response_time_p95: number;
  api_response_time_p99: number;
  api_error_rate: number;
  database_connections: number;
  database_query_time_avg: number;
  cache_hit_rate: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
}

/**
 * Usage metrics
 */
export interface UsageMetrics {
  active_users: number;
  total_users: number;
  user_sessions: number;
  features_used: Record<string, number>;
  pages_visited: Record<string, number>;
  actions_performed: Record<string, number>;
  avg_session_duration: number;
  data_volume_processed: number;
}

/**
 * Trend analysis
 */
export interface TrendAnalysis {
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percent: number;
  trend: 'up' | 'down' | 'stable';
  is_anomaly: boolean;
}

/**
 * Alert threshold configuration
 */
export interface MetricAlertThreshold {
  id: string;
  metric_name: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notification_channels: string[];
  created_by: string;
  created_at: string;
}

export interface RecordMetricRequest {
  name: string;
  type: MetricType;
  category: MetricCategory;
  value: number;
  unit?: string;
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface QueryMetricsRequest {
  metric_name: string;
  start_time?: string;
  end_time?: string;
  labels?: Record<string, string>;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  group_by?: string[];
  interval?: TimePeriod;
}

export interface CreateDashboardRequest {
  name: string;
  description?: string;
  category: string;
  widgets: DashboardWidget[];
  is_public?: boolean;
}

export interface CreateAlertThresholdRequest {
  metric_name: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification_channels: string[];
}

/**
 * Service for handling metrics and analytics API operations.
 * 
 * @namespace metricsService
 */
export const metricsService = {
  /**
   * Records a metric data point.
   * 
   * @async
   * @param {RecordMetricRequest} data - Metric data
   * @returns {Promise<ApiResponse<Metric>>} Recorded metric
   */
  async recordMetric(data: RecordMetricRequest): Promise<ApiResponse<Metric>> {
    return apiClient.post<ApiResponse<Metric>>('/metrics', data);
  },

  /**
   * Queries time-series metrics data.
   * 
   * @async
   * @param {QueryMetricsRequest} query - Query parameters
   * @returns {Promise<ApiResponse<TimeSeriesData>>} Time-series data
   */
  async queryMetrics(query: QueryMetricsRequest): Promise<ApiResponse<TimeSeriesData>> {
    return apiClient.post<ApiResponse<TimeSeriesData>>('/metrics/query', query);
  },

  /**
   * Gets security metrics summary.
   * 
   * @async
   * @returns {Promise<ApiResponse<SecurityMetrics>>} Security metrics
   */
  async getSecurityMetrics(): Promise<ApiResponse<SecurityMetrics>> {
    return apiClient.get<ApiResponse<SecurityMetrics>>('/metrics/security');
  },

  /**
   * Gets performance metrics summary.
   * 
   * @async
   * @returns {Promise<ApiResponse<PerformanceMetrics>>} Performance metrics
   */
  async getPerformanceMetrics(): Promise<ApiResponse<PerformanceMetrics>> {
    return apiClient.get<ApiResponse<PerformanceMetrics>>('/metrics/performance');
  },

  /**
   * Gets usage metrics summary.
   * 
   * @async
   * @returns {Promise<ApiResponse<UsageMetrics>>} Usage metrics
   */
  async getUsageMetrics(): Promise<ApiResponse<UsageMetrics>> {
    return apiClient.get<ApiResponse<UsageMetrics>>('/metrics/usage');
  },

  /**
   * Analyzes trend for a specific metric.
   * 
   * @async
   * @param {string} metricName - Metric name
   * @param {number} [hours=24] - Number of hours to analyze
   * @returns {Promise<ApiResponse<TrendAnalysis>>} Trend analysis
   */
  async analyzeTrend(metricName: string, hours: number = 24): Promise<ApiResponse<TrendAnalysis>> {
    return apiClient.get<ApiResponse<TrendAnalysis>>(`/metrics/${metricName}/trend?hours=${hours}`);
  },

  /**
   * Creates a new dashboard.
   * 
   * @async
   * @param {CreateDashboardRequest} data - Dashboard data
   * @returns {Promise<ApiResponse<Dashboard>>} Created dashboard
   */
  async createDashboard(data: CreateDashboardRequest): Promise<ApiResponse<Dashboard>> {
    return apiClient.post<ApiResponse<Dashboard>>('/dashboards', data);
  },

  /**
   * Gets all dashboards.
   * 
   * @async
   * @returns {Promise<ApiResponse<Dashboard[]>>} List of dashboards
   */
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    return apiClient.get<ApiResponse<Dashboard[]>>('/dashboards');
  },

  /**
   * Gets a specific dashboard by ID.
   * 
   * @async
   * @param {string} id - Dashboard ID
   * @returns {Promise<ApiResponse<Dashboard>>} Dashboard details
   */
  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return apiClient.get<ApiResponse<Dashboard>>(`/dashboards/${id}`);
  },

  /**
   * Creates an alert threshold.
   * 
   * @async
   * @param {CreateAlertThresholdRequest} data - Alert threshold data
   * @returns {Promise<ApiResponse<MetricAlertThreshold>>} Created threshold
   */
  async createAlertThreshold(data: CreateAlertThresholdRequest): Promise<ApiResponse<MetricAlertThreshold>> {
    return apiClient.post<ApiResponse<MetricAlertThreshold>>('/alerts/thresholds', data);
  },

  /**
   * Gets all alert thresholds.
   * 
   * @async
   * @returns {Promise<ApiResponse<MetricAlertThreshold[]>>} List of thresholds
   */
  async getAlertThresholds(): Promise<ApiResponse<MetricAlertThreshold[]>> {
    return apiClient.get<ApiResponse<MetricAlertThreshold[]>>('/alerts/thresholds');
  },
};
