/**
 * Metrics & Analytics - Service Layer
 * Business logic for metrics collection and analytics
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  Metric,
  TimeSeriesData,
  TimeSeriesDataPoint,
  Dashboard,
  MetricAlertThreshold,
  SecurityMetrics,
  PerformanceMetrics,
  UsageMetrics,
  TrendAnalysis,
  RecordMetricRequest,
  MetricQuery,
  CreateDashboardRequest,
  CreateAlertThresholdRequest,
  MetricType,
  MetricCategory,
} from './types';

/**
 * Metrics and analytics service
 */
class MetricsService extends EventEmitter {
  private metrics: Map<string, Metric> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private alertThresholds: Map<string, MetricAlertThreshold> = new Map();

  /**
   * Record a new metric
   */
  async recordMetric(request: RecordMetricRequest): Promise<Metric> {
    const metric: Metric = {
      id: uuidv4(),
      name: request.name,
      type: request.type,
      category: request.category,
      value: request.value,
      unit: request.unit,
      labels: request.labels || {},
      timestamp: new Date(),
      metadata: request.metadata,
    };

    this.metrics.set(metric.id, metric);

    // Check alert thresholds
    await this.checkAlertThresholds(metric);

    this.emit('metric:recorded', metric);
    return metric;
  }

  /**
   * Query metrics with filters and aggregation
   */
  async queryMetrics(query: MetricQuery): Promise<TimeSeriesData> {
    let filteredMetrics = Array.from(this.metrics.values())
      .filter((m) => m.name === query.metric_name);

    // Apply time filters
    if (query.start_time) {
      filteredMetrics = filteredMetrics.filter(
        (m) => m.timestamp >= query.start_time!
      );
    }

    if (query.end_time) {
      filteredMetrics = filteredMetrics.filter(
        (m) => m.timestamp <= query.end_time!
      );
    }

    // Apply label filters
    if (query.labels) {
      filteredMetrics = filteredMetrics.filter((m) =>
        Object.entries(query.labels!).every(
          ([key, value]) => m.labels[key] === value
        )
      );
    }

    // Convert to time series data points
    const dataPoints: TimeSeriesDataPoint[] = filteredMetrics.map((m) => ({
      timestamp: m.timestamp,
      value: m.value,
      labels: m.labels,
    }));

    // Sort by timestamp
    dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      metric_name: query.metric_name,
      data_points: dataPoints,
      aggregation: query.aggregation,
    };
  }

  /**
   * Get security metrics summary
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    // In production, these would query actual data
    const metrics: SecurityMetrics = {
      total_threats: await this.getMetricValue('threats.total', MetricType.COUNTER),
      threats_by_severity: {
        critical: await this.getMetricValue('threats.severity.critical', MetricType.COUNTER),
        high: await this.getMetricValue('threats.severity.high', MetricType.COUNTER),
        medium: await this.getMetricValue('threats.severity.medium', MetricType.COUNTER),
        low: await this.getMetricValue('threats.severity.low', MetricType.COUNTER),
      },
      active_incidents: await this.getMetricValue('incidents.active', MetricType.GAUGE),
      incidents_by_status: {
        open: await this.getMetricValue('incidents.status.open', MetricType.GAUGE),
        in_progress: await this.getMetricValue('incidents.status.in_progress', MetricType.GAUGE),
        resolved: await this.getMetricValue('incidents.status.resolved', MetricType.COUNTER),
      },
      vulnerabilities_open: await this.getMetricValue('vulnerabilities.open', MetricType.GAUGE),
      vulnerabilities_by_severity: {
        critical: await this.getMetricValue('vulnerabilities.severity.critical', MetricType.GAUGE),
        high: await this.getMetricValue('vulnerabilities.severity.high', MetricType.GAUGE),
        medium: await this.getMetricValue('vulnerabilities.severity.medium', MetricType.GAUGE),
        low: await this.getMetricValue('vulnerabilities.severity.low', MetricType.GAUGE),
      },
      iocs_detected: await this.getMetricValue('iocs.detected', MetricType.COUNTER),
      malware_samples: await this.getMetricValue('malware.samples', MetricType.COUNTER),
      compliance_score: await this.getMetricValue('compliance.score', MetricType.GAUGE),
      mean_time_to_detect: await this.getMetricValue('mttd', MetricType.HISTOGRAM),
      mean_time_to_respond: await this.getMetricValue('mttr', MetricType.HISTOGRAM),
      mean_time_to_resolve: await this.getMetricValue('mttr.resolve', MetricType.HISTOGRAM),
    };

    return metrics;
  }

  /**
   * Get performance metrics summary
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      api_requests_total: await this.getMetricValue('api.requests.total', MetricType.COUNTER),
      api_requests_per_second: await this.getMetricValue('api.requests.rate', MetricType.GAUGE),
      api_response_time_avg: await this.getMetricValue('api.response_time.avg', MetricType.HISTOGRAM),
      api_response_time_p95: await this.getMetricValue('api.response_time.p95', MetricType.HISTOGRAM),
      api_response_time_p99: await this.getMetricValue('api.response_time.p99', MetricType.HISTOGRAM),
      api_error_rate: await this.getMetricValue('api.errors.rate', MetricType.GAUGE),
      database_connections: await this.getMetricValue('db.connections', MetricType.GAUGE),
      database_query_time_avg: await this.getMetricValue('db.query_time.avg', MetricType.HISTOGRAM),
      cache_hit_rate: await this.getMetricValue('cache.hit_rate', MetricType.GAUGE),
      memory_usage_mb: await this.getMetricValue('system.memory.usage', MetricType.GAUGE),
      cpu_usage_percent: await this.getMetricValue('system.cpu.usage', MetricType.GAUGE),
    };

    return metrics;
  }

  /**
   * Get usage metrics summary
   */
  async getUsageMetrics(): Promise<UsageMetrics> {
    const metrics: UsageMetrics = {
      active_users: await this.getMetricValue('users.active', MetricType.GAUGE),
      total_users: await this.getMetricValue('users.total', MetricType.GAUGE),
      user_sessions: await this.getMetricValue('sessions.active', MetricType.GAUGE),
      features_used: {
        threat_intelligence: await this.getMetricValue('features.threat_intelligence', MetricType.COUNTER),
        incident_response: await this.getMetricValue('features.incident_response', MetricType.COUNTER),
        vulnerability_mgmt: await this.getMetricValue('features.vulnerability_mgmt', MetricType.COUNTER),
      },
      pages_visited: {},
      actions_performed: {},
      avg_session_duration: await this.getMetricValue('sessions.duration.avg', MetricType.HISTOGRAM),
      data_volume_processed: await this.getMetricValue('data.volume', MetricType.COUNTER),
    };

    return metrics;
  }

  /**
   * Analyze metric trend
   */
  async analyzeTrend(metricName: string, periodHours: number = 24): Promise<TrendAnalysis> {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodHours * 60 * 60 * 1000);
    const halfPeriod = new Date(now.getTime() - (periodHours / 2) * 60 * 60 * 1000);

    const recentMetrics = Array.from(this.metrics.values())
      .filter((m) => m.name === metricName && m.timestamp >= periodStart);

    const currentPeriod = recentMetrics.filter((m) => m.timestamp >= halfPeriod);
    const previousPeriod = recentMetrics.filter((m) => m.timestamp < halfPeriod);

    const currentValue = currentPeriod.length > 0
      ? currentPeriod.reduce((sum, m) => sum + m.value, 0) / currentPeriod.length
      : 0;

    const previousValue = previousPeriod.length > 0
      ? previousPeriod.reduce((sum, m) => sum + m.value, 0) / previousPeriod.length
      : 0;

    const changePercent = previousValue !== 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 10) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      metric_name: metricName,
      current_value: currentValue,
      previous_value: previousValue,
      change_percent: changePercent,
      trend,
      is_anomaly: Math.abs(changePercent) > 50,
    };
  }

  /**
   * Create dashboard
   */
  async createDashboard(request: CreateDashboardRequest, userId: string): Promise<Dashboard> {
    const dashboard: Dashboard = {
      id: uuidv4(),
      name: request.name,
      description: request.description,
      category: request.category,
      widgets: request.widgets,
      is_public: request.is_public || false,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    this.emit('dashboard:created', dashboard);

    return dashboard;
  }

  /**
   * Get all dashboards
   */
  async getDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  /**
   * Create alert threshold
   */
  async createAlertThreshold(
    request: CreateAlertThresholdRequest,
    userId: string
  ): Promise<MetricAlertThreshold> {
    const threshold: MetricAlertThreshold = {
      id: uuidv4(),
      metric_name: request.metric_name,
      condition: request.condition,
      threshold: request.threshold,
      duration: request.duration,
      severity: request.severity,
      enabled: true,
      notification_channels: request.notification_channels,
      created_by: userId,
      created_at: new Date(),
    };

    this.alertThresholds.set(threshold.id, threshold);
    this.emit('threshold:created', threshold);

    return threshold;
  }

  /**
   * Get all alert thresholds
   */
  async getAlertThresholds(): Promise<MetricAlertThreshold[]> {
    return Array.from(this.alertThresholds.values());
  }

  /**
   * Helper: Get latest metric value
   */
  private async getMetricValue(name: string, type: MetricType): Promise<number> {
    const metrics = Array.from(this.metrics.values())
      .filter((m) => m.name === name && m.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (metrics.length === 0) return 0;

    if (type === MetricType.COUNTER || type === MetricType.GAUGE) {
      return metrics[0].value;
    }

    // For histogram/summary, return average
    const sum = metrics.slice(0, 100).reduce((s, m) => s + m.value, 0);
    return sum / Math.min(metrics.length, 100);
  }

  /**
   * Helper: Check alert thresholds
   */
  private async checkAlertThresholds(metric: Metric): Promise<void> {
    const thresholds = Array.from(this.alertThresholds.values())
      .filter((t) => t.enabled && t.metric_name === metric.name);

    for (const threshold of thresholds) {
      let triggered = false;

      switch (threshold.condition) {
        case 'gt':
          triggered = metric.value > threshold.threshold;
          break;
        case 'lt':
          triggered = metric.value < threshold.threshold;
          break;
        case 'eq':
          triggered = metric.value === threshold.threshold;
          break;
        case 'gte':
          triggered = metric.value >= threshold.threshold;
          break;
        case 'lte':
          triggered = metric.value <= threshold.threshold;
          break;
      }

      if (triggered) {
        this.emit('alert:triggered', {
          threshold,
          metric,
          message: `Metric ${metric.name} ${threshold.condition} ${threshold.threshold} (current: ${metric.value})`,
        });
      }
    }
  }
}

// Export singleton instance
export const metricsService = new MetricsService();
