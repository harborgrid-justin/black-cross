# Metrics & Analytics

Advanced analytics and metrics tracking for security operations.

## Features

- ✅ Real-time metric recording
- ✅ Time-series data queries
- ✅ Security metrics dashboard
- ✅ Performance metrics monitoring
- ✅ Usage analytics
- ✅ Trend analysis and anomaly detection
- ✅ Custom dashboards
- ✅ Alert thresholds and notifications

## API Endpoints

### Metrics
- `POST /api/v1/metrics` - Record metric
- `POST /api/v1/metrics/query` - Query metrics
- `GET /api/v1/metrics/security` - Get security metrics
- `GET /api/v1/metrics/performance` - Get performance metrics
- `GET /api/v1/metrics/usage` - Get usage metrics
- `GET /api/v1/metrics/:metricName/trend` - Analyze trend

### Dashboards
- `POST /api/v1/dashboards` - Create dashboard
- `GET /api/v1/dashboards` - Get all dashboards

### Alerts
- `POST /api/v1/alerts/thresholds` - Create alert threshold
- `GET /api/v1/alerts/thresholds` - Get alert thresholds

## Usage Example

```typescript
import { metricsService } from './service';

// Record metric
await metricsService.recordMetric({
  name: 'threats.detected',
  type: MetricType.COUNTER,
  category: MetricCategory.SECURITY,
  value: 1,
  labels: { severity: 'high', source: 'feed-1' }
});

// Query metrics
const data = await metricsService.queryMetrics({
  metric_name: 'threats.detected',
  start_time: new Date(Date.now() - 24 * 60 * 60 * 1000),
  end_time: new Date(),
  aggregation: 'sum'
});

// Get security summary
const securityMetrics = await metricsService.getSecurityMetrics();
```

## Metric Types

- **Counter**: Monotonically increasing value (e.g., total threats detected)
- **Gauge**: Point-in-time value (e.g., active incidents)
- **Histogram**: Distribution of values (e.g., response times)
- **Summary**: Statistical summary (e.g., percentiles)
