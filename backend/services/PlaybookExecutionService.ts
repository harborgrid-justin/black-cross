/**
 * PlaybookExecution Service
 * Production-grade service using Sequelize repository pattern
 */

import { playbookExecutionRepository } from '../repositories';
import type { PlaybookExecution, ListFilters, PaginatedResponse } from '../repositories';

export class PlaybookExecutionService {
  /**
   * Create a new playbook execution
   */
  async create(data: {
    playbookId: string;
    playbookName: string;
    status?: string;
    triggeredBy: string;
    startedAt?: Date;
    metadata?: any;
  }): Promise<PlaybookExecution> {
    // Set defaults
    if (!data.status) {
      data.status = 'pending';
    }
    if (!data.startedAt) {
      data.startedAt = new Date();
    }

    return await playbookExecutionRepository.create(data);
  }

  /**
   * Start a playbook execution
   * Convenience method
   */
  async start(
    playbookId: string,
    playbookName: string,
    triggeredBy: string,
    metadata?: any
  ): Promise<PlaybookExecution> {
    return await this.create({
      playbookId,
      playbookName,
      status: 'running',
      triggeredBy,
      startedAt: new Date(),
      metadata,
    });
  }

  /**
   * Get playbook execution by ID
   */
  async getById(id: string): Promise<PlaybookExecution> {
    return await playbookExecutionRepository.findByIdOrThrow(id);
  }

  /**
   * List playbook executions with pagination and filters
   */
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<PlaybookExecution>> {
    return await playbookExecutionRepository.list(filters);
  }

  /**
   * List executions by playbook ID
   */
  async listByPlaybookId(playbookId: string): Promise<PlaybookExecution[]> {
    return await playbookExecutionRepository.findByPlaybookId(playbookId);
  }

  /**
   * List executions by status
   */
  async listByStatus(status: string): Promise<PlaybookExecution[]> {
    return await playbookExecutionRepository.findByStatus(status);
  }

  /**
   * List running executions
   */
  async listRunning(): Promise<PlaybookExecution[]> {
    return await playbookExecutionRepository.findRunning();
  }

  /**
   * List failed executions
   */
  async listFailed(): Promise<PlaybookExecution[]> {
    return await playbookExecutionRepository.findFailed();
  }

  /**
   * List successful executions
   */
  async listSuccessful(): Promise<PlaybookExecution[]> {
    return await playbookExecutionRepository.findSuccessful();
  }

  /**
   * List executions by triggered user
   */
  async listByTriggeredBy(userId: string): Promise<PlaybookExecution[]> {
    return await playbookExecutionRepository.findByTriggeredBy(userId);
  }

  /**
   * List recent executions
   */
  async listRecent(hours: number = 24): Promise<PlaybookExecution[]> {
    return await playbookExecutionRepository.findRecent(hours);
  }

  /**
   * Update execution
   */
  async update(id: string, updates: Partial<PlaybookExecution>): Promise<PlaybookExecution> {
    return await playbookExecutionRepository.update(id, updates);
  }

  /**
   * Update execution status
   */
  async updateStatus(
    id: string,
    status: string,
    result?: any,
    errorMessage?: string
  ): Promise<PlaybookExecution> {
    return await playbookExecutionRepository.updateStatus(id, status, result, errorMessage);
  }

  /**
   * Complete execution successfully
   */
  async completeSuccess(id: string, result?: any): Promise<PlaybookExecution> {
    return await playbookExecutionRepository.completeSuccess(id, result);
  }

  /**
   * Complete execution with failure
   */
  async completeFailed(id: string, errorMessage: string): Promise<PlaybookExecution> {
    return await playbookExecutionRepository.completeFailed(id, errorMessage);
  }

  /**
   * Cancel execution
   */
  async cancel(id: string): Promise<PlaybookExecution> {
    return await this.updateStatus(id, 'cancelled');
  }

  /**
   * Get execution statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    running: number;
    success: number;
    failed: number;
    cancelled: number;
    averageDuration: number;
    successRate: number;
  }> {
    return await playbookExecutionRepository.getStatistics();
  }

  /**
   * Get statistics by playbook
   */
  async getPlaybookStatistics(playbookId: string): Promise<{
    total: number;
    success: number;
    failed: number;
    successRate: number;
    averageDuration: number;
  }> {
    return await playbookExecutionRepository.getPlaybookStatistics(playbookId);
  }

  /**
   * Check if execution exists
   */
  async exists(id: string): Promise<boolean> {
    return await playbookExecutionRepository.exists(id);
  }
}

// Export singleton instance
export const playbookExecutionService = new PlaybookExecutionService();
export default playbookExecutionService;
