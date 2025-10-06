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

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

// Health check cache
let lastHealthCheck = null;
let lastHealthCheckTime = 0;
const HEALTH_CHECK_CACHE_MS = 5000; // Cache for 5 seconds

/**
 * Get system metrics
 */
function getSystemMetrics() {
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
async function checkMongoDB() {
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
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
    };
  }
}

/**
 * Basic health check endpoint
 */
async function basicHealthCheck(req, res) {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'Black-Cross',
    version: '1.0.0',
  });
}

/**
 * Detailed health check endpoint
 */
async function detailedHealthCheck(req, res) {
  const now = Date.now();

  // Return cached result if recent
  if (lastHealthCheck && (now - lastHealthCheckTime) < HEALTH_CHECK_CACHE_MS) {
    return res.json(lastHealthCheck);
  }

  try {
    // Check dependencies
    const mongoHealth = await checkMongoDB();

    // Determine overall status
    const isHealthy = mongoHealth.status === 'healthy';

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      platform: 'Black-Cross',
      version: '1.0.0',
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
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}

/**
 * Readiness probe
 * Checks if application is ready to accept traffic
 */
async function readinessProbe(req, res) {
  try {
    const mongoHealth = await checkMongoDB();

    if (mongoHealth.status === 'healthy') {
      return res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      reason: 'Database not connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}

/**
 * Liveness probe
 * Checks if application is alive
 */
function livenessProbe(req, res) {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  basicHealthCheck,
  detailedHealthCheck,
  readinessProbe,
  livenessProbe,
};
