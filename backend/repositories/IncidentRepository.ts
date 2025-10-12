/**
 * Incident Repository
 * Type-safe repository for Incident model operations
 */

import { Op } from 'sequelize';
import type { Incident } from '../utils/sequelize';
import { BaseRepository } from '../utils/BaseRepository';
import IncidentModel from '../models/Incident';
import UserModel from '../models/User';

class IncidentRepository extends BaseRepository<Incident> {
  protected model = IncidentModel;

  /**
   * Find incidents by status
   */
  async findByStatus(status: string): Promise<Incident[]> {
    return await this.model.findAll({
      where: { status },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find incidents by severity
   */
  async findBySeverity(severity: string): Promise<Incident[]> {
    return await this.model.findAll({
      where: { severity },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find incidents assigned to user
   */
  async findByAssignee(userId: string): Promise<Incident[]> {
    return await this.model.findAll({
      where: { assignedToId: userId },
      include: [{ model: UserModel, as: 'assignedTo' }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find open incidents
   */
  async findOpen(): Promise<Incident[]> {
    return await this.model.findAll({
      where: {
        status: {
          [Op.in]: ['open', 'investigating', 'in_progress'],
        },
      },
      order: [
        ['priority', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
  }

  /**
   * Find critical incidents
   */
  async findCritical(): Promise<Incident[]> {
    return await this.model.findAll({
      where: {
        severity: 'critical',
        status: {
          [Op.notIn]: ['resolved', 'closed'],
        },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Assign incident to user
   */
  async assign(incidentId: string, userId: string): Promise<Incident> {
    const incident = await this.findByIdOrThrow(incidentId);
    return await incident.update({ assignedToId: userId });
  }

  /**
   * Update incident status
   */
  async updateStatus(id: string, status: string): Promise<Incident> {
    const data: any = { status };

    // If resolving, set resolvedAt
    if (status === 'resolved' || status === 'closed') {
      data.resolvedAt = new Date();
    }

    const incident = await this.findByIdOrThrow(id);
    return await incident.update(data);
  }

  /**
   * Get incident statistics
   */
  async getStatistics(): Promise<{
    total: number;
    open: number;
    resolved: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> {
    const [
      total,
      open,
      resolved,
      critical,
      high,
      medium,
      low,
    ] = await Promise.all([
      this.count(),
      this.count({ status: { [Op.in]: ['open', 'investigating', 'in_progress'] } }),
      this.count({ status: { [Op.in]: ['resolved', 'closed'] } }),
      this.count({ severity: 'critical' }),
      this.count({ severity: 'high' }),
      this.count({ severity: 'medium' }),
      this.count({ severity: 'low' }),
    ]);

    return { total, open, resolved, critical, high, medium, low };
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const incidentRepository = new IncidentRepository();
export default incidentRepository;
