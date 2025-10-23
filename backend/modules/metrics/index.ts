/**
 * Metrics & Analytics - Router
 * API endpoints for metrics and analytics operations
 */

import { Router } from 'express';
import * as controller from './controller';

const router = Router();

// Metric recording and querying
router.post('/metrics', controller.recordMetric);
router.post('/metrics/query', controller.queryMetrics);

// Metric summaries
router.get('/metrics/security', controller.getSecurityMetrics);
router.get('/metrics/performance', controller.getPerformanceMetrics);
router.get('/metrics/usage', controller.getUsageMetrics);

// Trend analysis
router.get('/metrics/:metricName/trend', controller.analyzeTrend);

// Dashboard management
router.post('/dashboards', controller.createDashboard);
router.get('/dashboards', controller.getDashboards);

// Alert thresholds
router.post('/alerts/thresholds', controller.createAlertThreshold);
router.get('/alerts/thresholds', controller.getAlertThresholds);

export default router;
