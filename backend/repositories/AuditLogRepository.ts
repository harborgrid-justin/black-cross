/**
 * AuditLog Repository
 * Type-safe repository for AuditLog model operations
 */

import { Op } from 'sequelize';
import type { AuditLog } from '../utils/sequelize';
import { BaseRepository } from '../utils/BaseRepository';
import AuditLogModel from '../models/AuditLog';
import UserModel from '../models/User';

class AuditLogRepository extends BaseRepository<AuditLog> {
  protected model = AuditLogModel;

  /**
   * Find audit logs by user ID
   */
  async findByUserId(userId: string): Promise<AuditLog[]> {
    return await this.model.findAll({
      where: { userId },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find audit logs by action
   */
  async findByAction(action: string): Promise<AuditLog[]> {
    return await this.model.findAll({
      where: { action },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find audit logs by resource
   */
  async findByResource(resource: string): Promise<AuditLog[]> {
    return await this.model.findAll({
      where: { resource },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find audit logs by resource ID
   */
  async findByResourceId(resourceId: string): Promise<AuditLog[]> {
    return await this.model.findAll({
      where: { resourceId },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find audit logs by IP address
   */
  async findByIpAddress(ipAddress: string): Promise<AuditLog[]> {
    return await this.model.findAll({
      where: { ipAddress },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find recent audit logs
   */
  async findRecent(hours: number = 24): Promise<AuditLog[]> {
    const date = new Date();
    date.setHours(date.getHours() - hours);

    return await this.model.findAll({
      where: {
        timestamp: {
          [Op.gte]: date,
        },
      },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find audit logs within time range
   */
  async findByTimeRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await this.model.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find audit logs by user and action
   */
  async findByUserAndAction(userId: string, action: string): Promise<AuditLog[]> {
    return await this.model.findAll({
      where: { userId, action },
      include: [{ model: UserModel, as: 'user' }],
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Find suspicious activities
   * (Multiple failed actions by same user or IP in short time)
   */
  async findSuspiciousActivities(threshold: number = 5, hours: number = 1): Promise<{
    byUser: Array<{ userId: string; count: number }>;
    byIp: Array<{ ipAddress: string; count: number }>;
  }> {
    const date = new Date();
    date.setHours(date.getHours() - hours);

    const failedLogs = await this.model.findAll({
      where: {
        action: {
          [Op.or]: [
            { [Op.iLike]: '%failed%' },
            { [Op.iLike]: '%denied%' },
            { [Op.iLike]: '%unauthorized%' },
          ],
        },
        timestamp: {
          [Op.gte]: date,
        },
      },
      attributes: ['userId', 'ipAddress'],
    });

    // Count by user
    const userCounts: Record<string, number> = {};
    failedLogs.forEach((log) => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    const byUser = Object.entries(userCounts)
      .filter(([, count]) => count >= threshold)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count);

    // Count by IP
    const ipCounts: Record<string, number> = {};
    failedLogs.forEach((log) => {
      if (log.ipAddress) {
        ipCounts[log.ipAddress] = (ipCounts[log.ipAddress] || 0) + 1;
      }
    });

    const byIp = Object.entries(ipCounts)
      .filter(([, count]) => count >= threshold)
      .map(([ipAddress, count]) => ({ ipAddress, count }))
      .sort((a, b) => b.count - a.count);

    return { byUser, byIp };
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
    const date = new Date();
    date.setHours(date.getHours() - hours);

    const logs = await this.model.findAll({
      where: {
        timestamp: {
          [Op.gte]: date,
        },
      },
      attributes: ['action', 'resource', 'userId', 'ipAddress'],
    });

    const total = logs.length;

    // Count by action
    const byAction: Record<string, number> = {};
    logs.forEach((log) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });

    // Count by resource
    const byResource: Record<string, number> = {};
    logs.forEach((log) => {
      byResource[log.resource] = (byResource[log.resource] || 0) + 1;
    });

    // Count unique users
    const uniqueUsers = new Set(logs.map((log) => log.userId)).size;

    // Count unique IPs
    const uniqueIps = new Set(logs.filter((log) => log.ipAddress).map((log) => log.ipAddress)).size;

    return { total, byAction, byResource, uniqueUsers, uniqueIps };
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where[Op.or] = [
        { action: { [Op.iLike]: `%${search}%` } },
        { resource: { [Op.iLike]: `%${search}%` } },
        { resourceId: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;
