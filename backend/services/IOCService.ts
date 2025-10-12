/**
 * IOC Service
 * Production-grade service for Indicators of Compromise using Sequelize repository pattern
 */

import { iocRepository } from '../repositories';
import type { IOC, ListFilters, PaginatedResponse } from '../repositories';

export class IOCService {
  /**
   * Create a new IOC
   */
  async create(data: {
    type: string;
    value: string;
    description?: string;
    severity: string;
    confidence?: number;
    firstSeen: Date;
    lastSeen: Date;
    tags?: string[];
    source?: string;
    isActive?: boolean;
    metadata?: any;
  }): Promise<IOC> {
    // Set defaults
    if (data.confidence === undefined) {
      data.confidence = 50;
    }
    if (!data.tags) {
      data.tags = [];
    }
    if (data.isActive === undefined) {
      data.isActive = true;
    }

    return await iocRepository.create(data);
  }

  /**
   * Get IOC by ID
   */
  async getById(id: string): Promise<IOC> {
    return await iocRepository.findByIdOrThrow(id);
  }

  /**
   * Get IOC by value
   */
  async getByValue(value: string): Promise<IOC | null> {
    return await iocRepository.findByValue(value);
  }

  /**
   * List IOCs with pagination and filters
   */
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<IOC>> {
    return await iocRepository.list(filters);
  }

  /**
   * List IOCs by type
   */
  async listByType(type: string): Promise<IOC[]> {
    return await iocRepository.findByType(type);
  }

  /**
   * List IOCs by severity
   */
  async listBySeverity(severity: string): Promise<IOC[]> {
    return await iocRepository.findBySeverity(severity);
  }

  /**
   * List active IOCs
   */
  async listActive(): Promise<IOC[]> {
    return await iocRepository.findActive();
  }

  /**
   * List IOCs by source
   */
  async listBySource(source: string): Promise<IOC[]> {
    return await iocRepository.findBySource(source);
  }

  /**
   * List IOCs by tags
   */
  async listByTags(tags: string[]): Promise<IOC[]> {
    return await iocRepository.findByTags(tags);
  }

  /**
   * List recent IOCs
   */
  async listRecent(days: number = 7): Promise<IOC[]> {
    return await iocRepository.findRecent(days);
  }

  /**
   * List high-confidence IOCs
   */
  async listHighConfidence(threshold: number = 75): Promise<IOC[]> {
    return await iocRepository.findHighConfidence(threshold);
  }

  /**
   * Update IOC
   */
  async update(id: string, updates: Partial<IOC>): Promise<IOC> {
    return await iocRepository.update(id, updates);
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(id: string): Promise<IOC> {
    return await iocRepository.updateLastSeen(id);
  }

  /**
   * Activate IOC
   */
  async activate(id: string): Promise<IOC> {
    return await iocRepository.activate(id);
  }

  /**
   * Deactivate IOC
   */
  async deactivate(id: string): Promise<IOC> {
    return await iocRepository.deactivate(id);
  }

  /**
   * Delete IOC
   */
  async delete(id: string): Promise<void> {
    return await iocRepository.delete(id);
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
    return await iocRepository.getStatistics();
  }

  /**
   * Check if IOC exists
   */
  async exists(id: string): Promise<boolean> {
    return await iocRepository.exists(id);
  }
}

// Export singleton instance
export const iocService = new IOCService();
export default iocService;
