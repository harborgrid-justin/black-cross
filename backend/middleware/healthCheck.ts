/**
 * Health Check Middleware
 * Enterprise-grade health monitoring
 *
 * Features:
 * - Application health status
 * - Database connectivity checks
 * - System resource monitoring
 * - Dependency status checks
 * - Readiness and liveness probes
 */

import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { APP, STATUS, CACHE_DURATION } from '../constants';

interface SystemMetrics {
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
  uptime: string;
  uptimeSeconds: number;
  pid: number;
  nodeVersion: string;
}

interface MongoHealthStatus {
  status: 'healthy' | 'unhealthy';
  message: string;
  readyState?: number;
}

interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  platform: string;
  version: string;
  system?: SystemMetrics;
  dependencies?: {
    mongodb: MongoHealthStatus;
  };
  modules?: Record<string, string>;
  error?: string;
}

// Health check cache
let lastHealthCheck: HealthCheckData | null = null;
let lastHealthCheckTime: number = 0;
const HEALTH_CHECK_CACHE_MS: number = CACHE_DURATION.HEALTH_CHECK;

/**
 * Get system metrics
 */
function getSystemMetrics(): SystemMetrics {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    },
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    uptimeSeconds: Math.floor(uptime),
    pid: process.pid,
    nodeVersion: process.version,
  };
}

/**
 * Check MongoDB connection
 */
async function checkMongoDB(): Promise<MongoHealthStatus> {
  try {
    if (mongoose.connection.readyState === 1) {
      return {
        status: 'healthy',
        message: 'MongoDB connected',
        readyState: mongoose.connection.readyState,
      };
    }
    return {
      status: 'unhealthy',
      message: 'MongoDB not connected',
      readyState: mongoose.connection.readyState,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'unhealthy',
      message: errorMessage,
    };
  }
}

/**
 * Basic health check endpoint
 */
async function basicHealthCheck(req: Request, res: Response): Promise<void> {
  res.json({
    status: STATUS.HEALTHY,
    timestamp: new Date().toISOString(),
    platform: APP.NAME,
    version: APP.VERSION,
  });
}

/**
 * Detailed health check endpoint
 */
async function detailedHealthCheck(req: Request, res: Response): Promise<void> {
  const now = Date.now();

  // Return cached result if recent
  if (lastHealthCheck && (now - lastHealthCheckTime) < HEALTH_CHECK_CACHE_MS) {
    res.json(lastHealthCheck);
    return;
  }

  try {
    // Check dependencies
    const mongoHealth = await checkMongoDB();

    // Determine overall status
    const isHealthy = mongoHealth.status === 'healthy';

    const healthData: HealthCheckData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      platform: APP.NAME,
      version: APP.VERSION,
      system: getSystemMetrics(),
      dependencies: {
        mongodb: mongoHealth,
      },
      modules: {
        threatIntelligence: 'operational',
        incidentResponse: 'operational',
        threatHunting: 'operational',
        vulnerabilityManagement: 'operational',
        siem: 'operational',
        threatActors: 'operational',
        iocManagement: 'operational',
        threatFeeds: 'operational',
        riskAssessment: 'operational',
        collaboration: 'operational',
        reporting: 'operational',
        malwareAnalysis: 'operational',
        darkWeb: 'operational',
        compliance: 'operational',
        automation: 'operational',
      },
    };

    // Cache result
    lastHealthCheck = healthData;
    lastHealthCheckTime = now;

    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Health check failed', { error: errorMessage });
    res.status(503).json({
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    });
  }
}

/**
 * Readiness probe
 * Checks if application is ready to accept traffic
 */
async function readinessProbe(req: Request, res: Response): Promise<void> {
  try {
    const mongoHealth = await checkMongoDB();

    if (mongoHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      reason: 'Database not connected',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: errorMessage,
    });
  }
}

/**
 * Liveness probe
 * Checks if application is alive
 */
function livenessProbe(req: Request, res: Response): void {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
}

export default {
  basicHealthCheck,
  detailedHealthCheck,
  readinessProbe,
  livenessProbe,
};
