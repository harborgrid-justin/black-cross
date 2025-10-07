/**
 * Incident Repository
 * Type-safe repository for Incident model operations
 */

import type { Incident, Prisma } from '../utils/prisma';
import { BaseRepository } from '../utils/BaseRepository';

class IncidentRepository extends BaseRepository<
  Incident,
  Prisma.IncidentCreateInput,
  Prisma.IncidentUpdateInput
> {
  protected modelName = 'incident';

  /**
   * Find incidents by status
   */
  async findByStatus(status: string): Promise<Incident[]> {
    return await this.model.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find incidents by severity
   */
  async findBySeverity(severity: string): Promise<Incident[]> {
    return await this.model.findMany({
      where: { severity },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find incidents assigned to user
   */
  async findByAssignee(userId: string): Promise<Incident[]> {
    return await this.model.findMany({
      where: { assignedToId: userId },
      include: { assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find open incidents
   */
  async findOpen(): Promise<Incident[]> {
    return await this.model.findMany({
      where: {
        status: {
          in: ['open', 'investigating', 'in_progress'],
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Find critical incidents
   */
  async findCritical(): Promise<Incident[]> {
    return await this.model.findMany({
      where: {
        severity: 'critical',
        status: {
          notIn: ['resolved', 'closed'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Assign incident to user
   */
  async assign(incidentId: string, userId: string): Promise<Incident> {
    return await this.model.update({
      where: { id: incidentId },
      data: { assignedToId: userId },
    });
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

    return await this.model.update({
      where: { id },
      data,
    });
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
      this.count({ status: { in: ['open', 'investigating', 'in_progress'] } }),
      this.count({ status: { in: ['resolved', 'closed'] } }),
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
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const incidentRepository = new IncidentRepository();
export default incidentRepository;
