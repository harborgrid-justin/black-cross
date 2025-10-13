/**
 * Asset Service
 * Production-grade service using Sequelize repository pattern
 */

import { assetRepository } from '../repositories';
import type { Asset, ListFilters, PaginatedResponse } from '../repositories';

export class AssetService {
  /**
   * Create a new asset
   */
  async create(data: {
    name: string;
    type: string;
    ipAddress?: string;
    hostname?: string;
    criticality?: string;
    owner?: string;
    location?: string;
    environment?: string;
    tags?: string[];
    metadata?: any;
  }): Promise<Asset> {
    // Set defaults
    if (!data.criticality) {
      data.criticality = 'medium';
    }
    if (!data.tags) {
      data.tags = [];
    }

    return await assetRepository.create(data);
  }

  /**
   * Get asset by ID
   */
  async getById(id: string): Promise<Asset> {
    return await assetRepository.findByIdOrThrow(id);
  }

  /**
   * Get asset by IP address
   */
  async getByIpAddress(ipAddress: string): Promise<Asset | null> {
    return await assetRepository.findByIpAddress(ipAddress);
  }

  /**
   * Get asset by hostname
   */
  async getByHostname(hostname: string): Promise<Asset | null> {
    return await assetRepository.findByHostname(hostname);
  }

  /**
   * List assets with pagination and filters
   */
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<Asset>> {
    return await assetRepository.list(filters);
  }

  /**
   * List assets by type
   */
  async listByType(type: string): Promise<Asset[]> {
    return await assetRepository.findByType(type);
  }

  /**
   * List assets by criticality
   */
  async listByCriticality(criticality: string): Promise<Asset[]> {
    return await assetRepository.findByCriticality(criticality);
  }

  /**
   * List critical assets
   */
  async listCritical(): Promise<Asset[]> {
    return await assetRepository.findCritical();
  }

  /**
   * List assets by owner
   */
  async listByOwner(owner: string): Promise<Asset[]> {
    return await assetRepository.findByOwner(owner);
  }

  /**
   * List assets by location
   */
  async listByLocation(location: string): Promise<Asset[]> {
    return await assetRepository.findByLocation(location);
  }

  /**
   * List assets by environment
   */
  async listByEnvironment(environment: string): Promise<Asset[]> {
    return await assetRepository.findByEnvironment(environment);
  }

  /**
   * List assets by tags
   */
  async listByTags(tags: string[]): Promise<Asset[]> {
    return await assetRepository.findByTags(tags);
  }

  /**
   * Update asset
   */
  async update(id: string, updates: Partial<Asset>): Promise<Asset> {
    return await assetRepository.update(id, updates);
  }

  /**
   * Delete asset
   */
  async delete(id: string): Promise<void> {
    return await assetRepository.delete(id);
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
    return await assetRepository.getStatistics();
  }

  /**
   * Check if asset exists
   */
  async exists(id: string): Promise<boolean> {
    return await assetRepository.exists(id);
  }
}

// Export singleton instance
export const assetService = new AssetService();
export default assetService;
