/**
 * IOC Repository
 * Type-safe repository for IOC (Indicators of Compromise) model operations
 */

import { Op } from 'sequelize';
import type { IOC } from '../utils/sequelize';
import { BaseRepository } from '../utils/BaseRepository';
import IOCModel from '../models/IOC';

class IOCRepository extends BaseRepository<IOC> {
  protected model = IOCModel;

  /**
   * Find IOC by value
   */
  async findByValue(value: string): Promise<IOC | null> {
    return await this.model.findOne({
      where: { value },
    });
  }

  /**
   * Find IOCs by type
   */
  async findByType(type: string): Promise<IOC[]> {
    return await this.model.findAll({
      where: { type },
      order: [['lastSeen', 'DESC']],
    });
  }

  /**
   * Find IOCs by severity
   */
  async findBySeverity(severity: string): Promise<IOC[]> {
    return await this.model.findAll({
      where: { severity },
      order: [['lastSeen', 'DESC']],
    });
  }

  /**
   * Find active IOCs
   */
  async findActive(): Promise<IOC[]> {
    return await this.model.findAll({
      where: { isActive: true },
      order: [
        ['severity', 'ASC'],
        ['lastSeen', 'DESC'],
      ],
    });
  }

  /**
   * Find IOCs by source
   */
  async findBySource(source: string): Promise<IOC[]> {
    return await this.model.findAll({
      where: { source },
      order: [['lastSeen', 'DESC']],
    });
  }

  /**
   * Find IOCs by tags
   */
  async findByTags(tags: string[]): Promise<IOC[]> {
    return await this.model.findAll({
      where: {
        tags: {
          [Op.overlap]: tags,
        },
      },
      order: [['lastSeen', 'DESC']],
    });
  }

  /**
   * Find recent IOCs
   */
  async findRecent(days: number = 7): Promise<IOC[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await this.model.findAll({
      where: {
        lastSeen: {
          [Op.gte]: date,
        },
      },
      order: [['lastSeen', 'DESC']],
    });
  }

  /**
   * Find high-confidence IOCs
   */
  async findHighConfidence(threshold: number = 75): Promise<IOC[]> {
    return await this.model.findAll({
      where: {
        confidence: {
          [Op.gte]: threshold,
        },
        isActive: true,
      },
      order: [['confidence', 'DESC']],
    });
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(id: string): Promise<IOC> {
    const ioc = await this.findByIdOrThrow(id);
    return await ioc.update({ lastSeen: new Date() });
  }

  /**
   * Deactivate IOC
   */
  async deactivate(id: string): Promise<IOC> {
    const ioc = await this.findByIdOrThrow(id);
    return await ioc.update({ isActive: false });
  }

  /**
   * Activate IOC
   */
  async activate(id: string): Promise<IOC> {
    const ioc = await this.findByIdOrThrow(id);
    return await ioc.update({ isActive: true });
  }

  /**
   * Get IOC statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  }> {
    const [
      total,
      active,
      inactive,
      critical,
      high,
      medium,
      low,
      allIocs,
    ] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
      this.count({ severity: 'critical' }),
      this.count({ severity: 'high' }),
      this.count({ severity: 'medium' }),
      this.count({ severity: 'low' }),
      this.model.findAll({ attributes: ['type'] }),
    ]);

    // Count by type
    const byType: Record<string, number> = {};
    allIocs.forEach((ioc) => {
      byType[ioc.type] = (byType[ioc.type] || 0) + 1;
    });

    return { total, active, inactive, critical, high, medium, low, byType };
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where[Op.or] = [
        { value: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { source: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const iocRepository = new IOCRepository();
export default iocRepository;
