/**
 * Prometheus Metrics Middleware
 * Enterprise-grade metrics collection
 * 
 * Features:
 * - Request counter by method, path, status
 * - Request duration histogram
 * - Active requests gauge
 * - System metrics (memory, CPU)
 * - Custom business metrics
 */

// In-memory metrics store (use Prometheus client in production)
const metrics = {
  http_requests_total: new Map(),
  http_request_duration_seconds: [],
  http_requests_in_progress: 0,
  system_memory_bytes: 0,
  system_uptime_seconds: 0,
};

/**
 * Update request counter
 */
function incrementRequestCounter(method, path, status) {
  const key = `${method}:${path}:${status}`;
  const current = metrics.http_requests_total.get(key) || 0;
  metrics.http_requests_total.set(key, current + 1);
}

/**
 * Record request duration
 */
function recordRequestDuration(method, path, duration) {
  metrics.http_request_duration_seconds.push({
    method,
    path,
    duration,
    timestamp: Date.now(),
  });
  
  // Keep only last 1000 records
  if (metrics.http_request_duration_seconds.length > 1000) {
    metrics.http_request_duration_seconds.shift();
  }
}

/**
 * Metrics middleware
 */
function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  metrics.http_requests_in_progress += 1;
  
  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    
    const duration = (Date.now() - startTime) / 1000; // seconds
    metrics.http_requests_in_progress -= 1;
    
    // Normalize path (remove IDs)
    const normalizedPath = req.route ? req.route.path : req.path;
    
    incrementRequestCounter(req.method, normalizedPath, res.statusCode);
    recordRequestDuration(req.method, normalizedPath, duration);
    
    return res.send(data);
  };
  
  next();
}

/**
 * Get metrics in Prometheus format
 */
function getMetricsPrometheus(req, res) {
  const lines = [];
  
  // Update system metrics
  const memUsage = process.memoryUsage();
  metrics.system_memory_bytes = memUsage.rss;
  metrics.system_uptime_seconds = Math.floor(process.uptime());
  
  // HTTP requests total
  lines.push('# HELP http_requests_total Total number of HTTP requests');
  lines.push('# TYPE http_requests_total counter');
  for (const [key, value] of metrics.http_requests_total.entries()) {
    const [method, path, status] = key.split(':');
    lines.push(`http_requests_total{method="${method}",path="${path}",status="${status}"} ${value}`);
  }
  
  // HTTP requests in progress
  lines.push('# HELP http_requests_in_progress Number of HTTP requests in progress');
  lines.push('# TYPE http_requests_in_progress gauge');
  lines.push(`http_requests_in_progress ${metrics.http_requests_in_progress}`);
  
  // HTTP request duration
  if (metrics.http_request_duration_seconds.length > 0) {
    lines.push('# HELP http_request_duration_seconds HTTP request duration in seconds');
    lines.push('# TYPE http_request_duration_seconds histogram');
    
    // Calculate percentiles
    const durations = metrics.http_request_duration_seconds
      .map(m => m.duration)
      .sort((a, b) => a - b);
    
    const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
    const p90 = durations[Math.floor(durations.length * 0.9)] || 0;
    const p99 = durations[Math.floor(durations.length * 0.99)] || 0;
    
    lines.push(`http_request_duration_seconds{quantile="0.5"} ${p50.toFixed(3)}`);
    lines.push(`http_request_duration_seconds{quantile="0.9"} ${p90.toFixed(3)}`);
    lines.push(`http_request_duration_seconds{quantile="0.99"} ${p99.toFixed(3)}`);
  }
  
  // System metrics
  lines.push('# HELP system_memory_bytes System memory usage in bytes');
  lines.push('# TYPE system_memory_bytes gauge');
  lines.push(`system_memory_bytes ${metrics.system_memory_bytes}`);
  
  lines.push('# HELP system_uptime_seconds System uptime in seconds');
  lines.push('# TYPE system_uptime_seconds counter');
  lines.push(`system_uptime_seconds ${metrics.system_uptime_seconds}`);
  
  // Node.js version
  lines.push('# HELP nodejs_version Node.js version info');
  lines.push('# TYPE nodejs_version gauge');
  lines.push(`nodejs_version{version="${process.version}"} 1`);
  
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(lines.join('\n') + '\n');
}

/**
 * Get metrics in JSON format
 */
function getMetricsJson(req, res) {
  const memUsage = process.memoryUsage();
  
  // Convert Map to object
  const requestCounts = {};
  for (const [key, value] of metrics.http_requests_total.entries()) {
    requestCounts[key] = value;
  }
  
  // Calculate request duration stats
  const durations = metrics.http_request_duration_seconds
    .map(m => m.duration)
    .sort((a, b) => a - b);
  
  const durationStats = durations.length > 0 ? {
    count: durations.length,
    min: durations[0],
    max: durations[durations.length - 1],
    p50: durations[Math.floor(durations.length * 0.5)],
    p90: durations[Math.floor(durations.length * 0.9)],
    p99: durations[Math.floor(durations.length * 0.99)],
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
  } : null;
  
  res.json({
    timestamp: new Date().toISOString(),
    metrics: {
      http: {
        requests_total: requestCounts,
        requests_in_progress: metrics.http_requests_in_progress,
        request_duration_seconds: durationStats,
      },
      system: {
        memory: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external,
        },
        uptime: process.uptime(),
        pid: process.pid,
        nodeVersion: process.version,
      },
    },
  });
}

/**
 * Reset metrics (for testing)
 */
function resetMetrics() {
  metrics.http_requests_total.clear();
  metrics.http_request_duration_seconds = [];
  metrics.http_requests_in_progress = 0;
}

module.exports = {
  metricsMiddleware,
  getMetricsPrometheus,
  getMetricsJson,
  resetMetrics,
};
