/**
 * Metrics & Analytics - Controller
 * HTTP request handlers for metrics operations
 */

import type { Request, Response } from 'express';
import { metricsService } from './service';
import {
  RecordMetricRequest,
  QueryMetricsRequest,
  CreateDashboardRequest,
  CreateAlertThresholdRequest,
} from './types';

/**
 * Record a new metric
 */
export async function recordMetric(req: Request, res: Response): Promise<void> {
  try {
    const request: RecordMetricRequest = req.body;
    const metric = await metricsService.recordMetric(request);

    res.status(201).json({
      success: true,
      data: metric,
      message: 'Metric recorded successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record metric';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Query metrics
 */
export async function queryMetrics(req: Request, res: Response): Promise<void> {
  try {
    const query: QueryMetricsRequest = req.body;
    
    const metricQuery = {
      metric_name: query.metric_name,
      start_time: query.start_time ? new Date(query.start_time) : undefined,
      end_time: query.end_time ? new Date(query.end_time) : undefined,
      labels: query.labels,
      aggregation: query.aggregation,
      group_by: query.group_by,
      interval: query.interval,
    };

    const data = await metricsService.queryMetrics(metricQuery);

    res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to query metrics';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get security metrics summary
 */
export async function getSecurityMetrics(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await metricsService.getSecurityMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch security metrics';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Get performance metrics summary
 */
export async function getPerformanceMetrics(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await metricsService.getPerformanceMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance metrics';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Get usage metrics summary
 */
export async function getUsageMetrics(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await metricsService.getUsageMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch usage metrics';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Analyze metric trend
 */
export async function analyzeTrend(req: Request, res: Response): Promise<void> {
  try {
    const { metricName } = req.params;
    const periodHours = req.query.periodHours
      ? parseInt(req.query.periodHours as string, 10)
      : 24;

    const trend = await metricsService.analyzeTrend(metricName, periodHours);

    res.json({
      success: true,
      data: trend,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze trend';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Create dashboard
 */
export async function createDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateDashboardRequest = req.body;
    const dashboard = await metricsService.createDashboard(request, userId);

    res.status(201).json({
      success: true,
      data: dashboard,
      message: 'Dashboard created successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create dashboard';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get all dashboards
 */
export async function getDashboards(req: Request, res: Response): Promise<void> {
  try {
    const dashboards = await metricsService.getDashboards();

    res.json({
      success: true,
      data: dashboards,
      count: dashboards.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboards';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Create alert threshold
 */
export async function createAlertThreshold(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateAlertThresholdRequest = req.body;
    const threshold = await metricsService.createAlertThreshold(request, userId);

    res.status(201).json({
      success: true,
      data: threshold,
      message: 'Alert threshold created successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create threshold';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get all alert thresholds
 */
export async function getAlertThresholds(req: Request, res: Response): Promise<void> {
  try {
    const thresholds = await metricsService.getAlertThresholds();

    res.json({
      success: true,
      data: thresholds,
      count: thresholds.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch thresholds';
    res.status(500).json({ success: false, error: message });
  }
}
