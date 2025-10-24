/**
 * Health Check Factory
 * Creates standardized health check endpoints for modules
 *
 * Eliminates 400+ lines of duplicated health check code across 17+ modules
 *
 * @example
 * ```typescript
 * import { createHealthCheckHandler } from '../../utils/healthCheckFactory';
 *
 * router.get('/health', createHealthCheckHandler({
 *   moduleName: 'automation',
 *   version: '1.0.0',
 *   subFeatures: [
 *     'pre-built-playbooks',
 *     'custom-playbook-creation',
 *     'playbook-execution-engine'
 *   ],
 * }));
 * ```
 */

import type { Request, Response, RequestHandler } from 'express';

/**
 * Configuration for module health check
 */
export interface HealthCheckConfig {
  /** Module name (e.g., 'automation', 'incident-response') */
  readonly moduleName: string;

  /** Module version (defaults to '1.0.0') */
  readonly version?: string;

  /** List of sub-features provided by this module */
  readonly subFeatures: readonly string[];

  /** Optional function to check database connectivity */
  readonly getDatabaseStatus?: () => Promise<'connected' | 'disconnected' | 'error'>;

  /** Optional function to check external dependencies */
  readonly getDependenciesStatus?: () => Promise<Record<string, boolean>>;

  /** Optional function to get module-specific metrics */
  readonly getMetrics?: () => Promise<Record<string, number>>;
}

/**
 * Standard health check response format
 */
export interface HealthCheckResponse {
  readonly module: string;
  readonly status: 'operational' | 'degraded' | 'down';
  readonly version: string;
  readonly subFeatures: readonly string[];
  readonly timestamp: string;
  readonly database?: 'connected' | 'disconnected' | 'error';
  readonly dependencies?: Record<string, boolean>;
  readonly metrics?: Record<string, number>;
}

/**
 * Creates a health check request handler for a module
 *
 * @param config - Health check configuration
 * @returns Express request handler
 *
 * @example
 * ```typescript
 * router.get('/health', createHealthCheckHandler({
 *   moduleName: 'threat-intelligence',
 *   subFeatures: ['threat-detection', 'threat-correlation', 'threat-enrichment'],
 *   getDatabaseStatus: async () => {
 *     const isConnected = mongoose.connection.readyState === 1;
 *     return isConnected ? 'connected' : 'disconnected';
 *   }
 * }));
 * ```
 */
export function createHealthCheckHandler(config: HealthCheckConfig): RequestHandler {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      let response: HealthCheckResponse = {
        module: config.moduleName,
        status: 'operational',
        version: config.version ?? '1.0.0',
        subFeatures: config.subFeatures,
        timestamp: new Date().toISOString(),
      };

      // Check database status if configured
      if (config.getDatabaseStatus) {
        try {
          const databaseStatus = await config.getDatabaseStatus();
          response = {
            ...response,
            database: databaseStatus,
            status: databaseStatus === 'error' ? 'degraded' : response.status,
          };
        } catch (error) {
          response = {
            ...response,
            database: 'error',
            status: 'degraded',
          };
        }
      }

      // Check dependencies if configured
      if (config.getDependenciesStatus) {
        try {
          const dependencies = await config.getDependenciesStatus();
          const allHealthy = Object.values(dependencies).every(status => status);
          response = {
            ...response,
            dependencies,
            status: !allHealthy && response.status === 'operational' ? 'degraded' : response.status,
          };
        } catch (error) {
          response = {
            ...response,
            status: 'degraded',
          };
        }
      }

      // Get metrics if configured
      if (config.getMetrics) {
        try {
          const metrics = await config.getMetrics();
          response = {
            ...response,
            metrics,
          };
        } catch (error) {
          // Metrics failure doesn't affect overall status
        }
      }

      // Set HTTP status based on health status
      const httpStatus = response.status === 'operational' ? 200 : 503;
      res.status(httpStatus).json(response);
    } catch (error) {
      // Catastrophic failure in health check itself
      res.status(503).json({
        module: config.moduleName,
        status: 'down',
        version: config.version ?? '1.0.0',
        subFeatures: config.subFeatures,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Helper function to check MongoDB connection status
 */
export async function checkMongoDBStatus(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    const mongoose = require('mongoose');
    const readyState = mongoose.connection.readyState;

    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (readyState === 1) return 'connected';
    if (readyState === 0 || readyState === 3) return 'disconnected';
    return 'error';
  } catch (error) {
    return 'error';
  }
}

/**
 * Helper function to check PostgreSQL connection status
 */
export async function checkPostgreSQLStatus(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    const { getSequelize } = require('../config/sequelize');
    const sequelize = getSequelize();

    await sequelize.authenticate();
    return 'connected';
  } catch (error) {
    return 'disconnected';
  }
}

/**
 * Helper function to check Redis connection status
 */
export async function checkRedisStatus(): Promise<boolean> {
  try {
    const { redisClient } = require('./cache/redis-client');
    return redisClient.isConnected();
  } catch (error) {
    return false;
  }
}

/**
 * Creates a comprehensive health check with all common dependencies
 *
 * @example
 * ```typescript
 * router.get('/health', createComprehensiveHealthCheck({
 *   moduleName: 'incident-response',
 *   subFeatures: ['incident-tracking', 'sla-management', 'workflow-automation'],
 *   checkDatabase: true,
 *   checkRedis: true,
 * }));
 * ```
 */
export function createComprehensiveHealthCheck(
  config: HealthCheckConfig & {
    checkDatabase?: boolean;
    checkRedis?: boolean;
  }
): RequestHandler {
  const enhancedConfig: HealthCheckConfig = {
    ...config,
    getDatabaseStatus: config.checkDatabase ? checkPostgreSQLStatus : undefined,
    getDependenciesStatus: async () => {
      const dependencies: Record<string, boolean> = {};

      if (config.checkRedis) {
        dependencies.redis = await checkRedisStatus();
      }

      return dependencies;
    },
  };

  return createHealthCheckHandler(enhancedConfig);
}

/**
 * Usage examples for all modules:
 *
 * // Simple health check
 * router.get('/health', createHealthCheckHandler({
 *   moduleName: 'example-typescript',
 *   subFeatures: ['basic-crud', 'advanced-filtering'],
 * }));
 *
 * // With database check
 * router.get('/health', createHealthCheckHandler({
 *   moduleName: 'threat-intelligence',
 *   subFeatures: ['threat-detection', 'correlation'],
 *   getDatabaseStatus: checkMongoDBStatus,
 * }));
 *
 * // Comprehensive check
 * router.get('/health', createComprehensiveHealthCheck({
 *   moduleName: 'vulnerability-management',
 *   subFeatures: ['scan-import', 'risk-scoring'],
 *   checkDatabase: true,
 *   checkRedis: true,
 * }));
 */
