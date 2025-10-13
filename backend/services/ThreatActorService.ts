/**
 * ThreatActor Service
 * Production-grade service using Sequelize repository pattern
 */

import { threatActorRepository } from '../repositories';
import type { ThreatActor, ListFilters, PaginatedResponse } from '../repositories';

export class ThreatActorService {
  /**
   * Create a new threat actor
   */
  async create(data: {
    name: string;
    aliases?: string[];
    description?: string;
    sophistication?: string;
    motivation?: string[];
    firstSeen?: Date;
    lastSeen?: Date;
    country?: string;
    tags?: string[];
    metadata?: any;
  }): Promise<ThreatActor> {
    // Set defaults
    if (!data.aliases) {
      data.aliases = [];
    }
    if (!data.motivation) {
      data.motivation = [];
    }
    if (!data.tags) {
      data.tags = [];
    }

    return await threatActorRepository.create(data);
  }

  /**
   * Get threat actor by ID
   */
  async getById(id: string): Promise<ThreatActor> {
    return await threatActorRepository.findByIdOrThrow(id);
  }

  /**
   * Get threat actor by name
   */
  async getByName(name: string): Promise<ThreatActor | null> {
    return await threatActorRepository.findByName(name);
  }

  /**
   * List threat actors with pagination and filters
   */
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<ThreatActor>> {
    return await threatActorRepository.list(filters);
  }

  /**
   * List threat actors by alias
   */
  async listByAlias(alias: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findByAlias(alias);
  }

  /**
   * List threat actors by sophistication
   */
  async listBySophistication(sophistication: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findBySophistication(sophistication);
  }

  /**
   * List threat actors by motivation
   */
  async listByMotivation(motivation: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findByMotivation(motivation);
  }

  /**
   * List threat actors by country
   */
  async listByCountry(country: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findByCountry(country);
  }

  /**
   * List recently active threat actors
   */
  async listRecentlyActive(days: number = 30): Promise<ThreatActor[]> {
    return await threatActorRepository.findRecentlyActive(days);
  }

  /**
   * List threat actors by tags
   */
  async listByTags(tags: string[]): Promise<ThreatActor[]> {
    return await threatActorRepository.findByTags(tags);
  }

  /**
   * Update threat actor
   */
  async update(id: string, updates: Partial<ThreatActor>): Promise<ThreatActor> {
    return await threatActorRepository.update(id, updates);
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(id: string): Promise<ThreatActor> {
    return await threatActorRepository.updateLastSeen(id);
  }

  /**
   * Delete threat actor
   */
  async delete(id: string): Promise<void> {
    return await threatActorRepository.delete(id);
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
    return await threatActorRepository.getStatistics();
  }

  /**
   * Check if threat actor exists
   */
  async exists(id: string): Promise<boolean> {
    return await threatActorRepository.exists(id);
  }
}

// Export singleton instance
export const threatActorService = new ThreatActorService();
export default threatActorService;
