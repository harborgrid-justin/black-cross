/**
 * AuditLog Service
 * Production-grade service using Sequelize repository pattern
 */

import { auditLogRepository } from '../repositories';
import type { AuditLog, ListFilters, PaginatedResponse } from '../repositories';

export class AuditLogService {
  /**
   * Create a new audit log entry
   */
  async create(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    return await auditLogRepository.create(data);
  }

  /**
   * Log user action
   * Convenience method for creating audit logs
   */
  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    return await this.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get audit log by ID
   */
  async getById(id: string): Promise<AuditLog> {
    return await auditLogRepository.findByIdOrThrow(id);
  }

  /**
   * List audit logs with pagination and filters
   */
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<AuditLog>> {
    return await auditLogRepository.list(filters);
  }

  /**
   * List audit logs by user
   */
  async listByUserId(userId: string): Promise<AuditLog[]> {
    return await auditLogRepository.findByUserId(userId);
  }

  /**
   * List audit logs by action
   */
  async listByAction(action: string): Promise<AuditLog[]> {
    return await auditLogRepository.findByAction(action);
  }

  /**
   * List audit logs by resource
   */
  async listByResource(resource: string): Promise<AuditLog[]> {
    return await auditLogRepository.findByResource(resource);
  }

  /**
   * List audit logs by resource ID
   */
  async listByResourceId(resourceId: string): Promise<AuditLog[]> {
    return await auditLogRepository.findByResourceId(resourceId);
  }

  /**
   * List audit logs by IP address
   */
  async listByIpAddress(ipAddress: string): Promise<AuditLog[]> {
    return await auditLogRepository.findByIpAddress(ipAddress);
  }

  /**
   * List recent audit logs
   */
  async listRecent(hours: number = 24): Promise<AuditLog[]> {
    return await auditLogRepository.findRecent(hours);
  }

  /**
   * List audit logs within time range
   */
  async listByTimeRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await auditLogRepository.findByTimeRange(startDate, endDate);
  }

  /**
   * List audit logs by user and action
   */
  async listByUserAndAction(userId: string, action: string): Promise<AuditLog[]> {
    return await auditLogRepository.findByUserAndAction(userId, action);
  }

  /**
   * Find suspicious activities
   */
  async findSuspiciousActivities(threshold: number = 5, hours: number = 1): Promise<{
    byUser: Array<{ userId: string; count: number }>;
    byIp: Array<{ ipAddress: string; count: number }>;
  }> {
    return await auditLogRepository.findSuspiciousActivities(threshold, hours);
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(hours: number = 24): Promise<{
    total: number;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
    uniqueUsers: number;
    uniqueIps: number;
  }> {
    return await auditLogRepository.getStatistics(hours);
  }

  /**
   * Check if audit log exists
   */
  async exists(id: string): Promise<boolean> {
    return await auditLogRepository.exists(id);
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
export default auditLogService;
