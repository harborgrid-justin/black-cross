/**
 * ThreatActor Repository
 * Type-safe repository for ThreatActor model operations
 */

import { Op } from 'sequelize';
import type { ThreatActor } from '../utils/sequelize';
import { BaseRepository } from '../utils/BaseRepository';
import ThreatActorModel from '../models/ThreatActor';

class ThreatActorRepository extends BaseRepository<ThreatActor> {
  protected model = ThreatActorModel;

  /**
   * Find threat actor by name
   */
  async findByName(name: string): Promise<ThreatActor | null> {
    return await this.model.findOne({
      where: { name },
    });
  }

  /**
   * Find threat actors by alias
   */
  async findByAlias(alias: string): Promise<ThreatActor[]> {
    return await this.model.findAll({
      where: {
        aliases: {
          [Op.contains]: [alias],
        },
      },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find threat actors by sophistication level
   */
  async findBySophistication(sophistication: string): Promise<ThreatActor[]> {
    return await this.model.findAll({
      where: { sophistication },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find threat actors by motivation
   */
  async findByMotivation(motivation: string): Promise<ThreatActor[]> {
    return await this.model.findAll({
      where: {
        motivation: {
          [Op.contains]: [motivation],
        },
      },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find threat actors by country
   */
  async findByCountry(country: string): Promise<ThreatActor[]> {
    return await this.model.findAll({
      where: { country },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find recently active threat actors
   */
  async findRecentlyActive(days: number = 30): Promise<ThreatActor[]> {
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
   * Find threat actors by tags
   */
  async findByTags(tags: string[]): Promise<ThreatActor[]> {
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
   * Update last seen timestamp
   */
  async updateLastSeen(id: string): Promise<ThreatActor> {
    const threatActor = await this.findByIdOrThrow(id);
    return await threatActor.update({ lastSeen: new Date() });
  }

  /**
   * Get threat actor statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byCountry: Record<string, number>;
    bySophistication: Record<string, number>;
    recentlyActive: number;
  }> {
    const allActors = await this.model.findAll({
      attributes: ['country', 'sophistication', 'lastSeen'],
    });

    const total = allActors.length;

    // Count by country
    const byCountry: Record<string, number> = {};
    allActors.forEach((actor) => {
      if (actor.country) {
        byCountry[actor.country] = (byCountry[actor.country] || 0) + 1;
      }
    });

    // Count by sophistication
    const bySophistication: Record<string, number> = {};
    allActors.forEach((actor) => {
      if (actor.sophistication) {
        bySophistication[actor.sophistication] = (bySophistication[actor.sophistication] || 0) + 1;
      }
    });

    // Count recently active (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyActive = allActors.filter(
      (actor) => actor.lastSeen && actor.lastSeen >= thirtyDaysAgo
    ).length;

    return { total, byCountry, bySophistication, recentlyActive };
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { aliases: { [Op.overlap]: [search] } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const threatActorRepository = new ThreatActorRepository();
export default threatActorRepository;
