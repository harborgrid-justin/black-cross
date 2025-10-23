/**
 * Metrics & Analytics - Type Definitions
 * Advanced analytics and metrics tracking
 */

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
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: Date;
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
  created_at: Date;
  updated_at: Date;
}

/**
 * Metric query for filtering and aggregation
 */
export interface MetricQuery {
  metric_name: string;
  start_time?: Date;
  end_time?: Date;
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
  created_at: Date;
}

/**
 * Request/Response types
 */
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
