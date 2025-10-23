/**
 * Asset Repository
 * Type-safe repository for Asset model operations
 */

import { Op } from 'sequelize';
import type { Asset } from '../utils/sequelize';
import { BaseRepository } from '../utils/BaseRepository';
import AssetModel from '../models/Asset';

class AssetRepository extends BaseRepository<Asset> {
  protected model = AssetModel;

  /**
   * Find assets by type
   */
  async findByType(type: string): Promise<Asset[]> {
    return await this.model.findAll({
      where: { type },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find assets by criticality
   */
  async findByCriticality(criticality: string): Promise<Asset[]> {
    return await this.model.findAll({
      where: { criticality },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find critical assets
   */
  async findCritical(): Promise<Asset[]> {
    return await this.model.findAll({
      where: {
        criticality: {
          [Op.in]: ['critical', 'high'],
        },
      },
      order: [['criticality', 'ASC']],
    });
  }

  /**
   * Find asset by IP address
   */
  async findByIpAddress(ipAddress: string): Promise<Asset | null> {
    return await this.model.findOne({
      where: { ipAddress },
    });
  }

  /**
   * Find asset by hostname
   */
  async findByHostname(hostname: string): Promise<Asset | null> {
    return await this.model.findOne({
      where: { hostname },
    });
  }

  /**
   * Find assets by owner
   */
  async findByOwner(owner: string): Promise<Asset[]> {
    return await this.model.findAll({
      where: { owner },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find assets by location
   */
  async findByLocation(location: string): Promise<Asset[]> {
    return await this.model.findAll({
      where: { location },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find assets by environment
   */
  async findByEnvironment(environment: string): Promise<Asset[]> {
    return await this.model.findAll({
      where: { environment },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find assets by tags
   */
  async findByTags(tags: string[]): Promise<Asset[]> {
    return await this.model.findAll({
      where: {
        tags: {
          [Op.overlap]: tags,
        },
      },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get asset statistics
   */
  async getStatistics(): Promise<{
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  }> {
    const [
      total,
      critical,
      high,
      medium,
      low,
      allAssets,
    ] = await Promise.all([
      this.count(),
      this.count({ criticality: 'critical' }),
      this.count({ criticality: 'high' }),
      this.count({ criticality: 'medium' }),
      this.count({ criticality: 'low' }),
      this.model.findAll({ attributes: ['type'] }),
    ]);

    // Count by type
    const byType: Record<string, number> = {};
    allAssets.forEach((asset) => {
      byType[asset.type] = (byType[asset.type] || 0) + 1;
    });

    return {
      total, critical, high, medium, low, byType,
    };
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { ipAddress: { [Op.iLike]: `%${search}%` } },
        { hostname: { [Op.iLike]: `%${search}%` } },
        { owner: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const assetRepository = new AssetRepository();
export default assetRepository;
