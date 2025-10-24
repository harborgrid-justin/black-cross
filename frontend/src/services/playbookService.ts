/**
 * @fileoverview Automation Playbook API service.
 * 
 * Provides methods for playbook management, execution, and workflow automation.
 * 
 * @module services/playbookService
 */

import { apiClient } from './api';
import type { ApiResponse } from '@/types';

interface Playbook {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  executions: number;
  lastRun: string;
  createdAt: string;
  updatedAt: string;
}

interface PlaybookExecution {
  id: string;
  playbookId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
}

/**
 * Service for handling automation playbook API operations.
 *
 * Provides comprehensive methods for managing security automation playbooks including
 * creation, execution, monitoring, and analytics. All methods return promises and
 * handle errors appropriately.
 *
 * @namespace playbookService
 * @example
 * ```typescript
 * // List all playbooks
 * const playbooks = await playbookService.listPlaybooks();
 *
 * // Execute a playbook with context
 * const execution = await playbookService.executePlaybook('pb-123', {
 *   incidentId: 'inc-456',
 *   severity: 'high'
 * });
 * ```
 */
export const playbookService = {
  /**
   * Retrieves all automation playbooks.
   *
   * @async
   * @returns {Promise<ApiResponse<Playbook[]>>} List of all playbooks
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const playbooks = await playbookService.listPlaybooks();
   * ```
   */
  async listPlaybooks(): Promise<ApiResponse<Playbook[]>> {
    return apiClient.get<ApiResponse<Playbook[]>>('/automation/playbooks');
  },

  /**
   * Retrieves a single playbook by its unique identifier.
   *
   * @async
   * @param {string} id - The playbook ID
   * @returns {Promise<ApiResponse<Playbook>>} The playbook data with workflow details
   * @throws {Error} When the playbook is not found or request fails
   *
   * @example
   * ```typescript
   * const playbook = await playbookService.getPlaybook('pb-123');
   * ```
   */
  async getPlaybook(id: string): Promise<ApiResponse<Playbook>> {
    return apiClient.get<ApiResponse<Playbook>>(`/automation/playbooks/${id}`);
  },

  /**
   * Creates a new automation playbook.
   *
   * @async
   * @param {Partial<Playbook>} data - The playbook data including name, description, and workflow steps
   * @returns {Promise<ApiResponse<Playbook>>} The created playbook
   * @throws {Error} When playbook creation fails or validation errors occur
   *
   * @example
   * ```typescript
   * const playbook = await playbookService.createPlaybook({
   *   name: 'Incident Response Workflow',
   *   description: 'Automated incident triage and containment',
   *   status: 'active'
   * });
   * ```
   */
  async createPlaybook(data: Partial<Playbook>): Promise<ApiResponse<Playbook>> {
    return apiClient.post<ApiResponse<Playbook>>('/automation/playbooks', data);
  },

  /**
   * Updates an existing playbook.
   *
   * @async
   * @param {string} id - The playbook ID
   * @param {Partial<Playbook>} data - Fields to update
   * @returns {Promise<ApiResponse<Playbook>>} The updated playbook
   * @throws {Error} When update fails
   *
   * @example
   * ```typescript
   * await playbookService.updatePlaybook('pb-123', {
   *   status: 'inactive',
   *   description: 'Updated workflow description'
   * });
   * ```
   */
  async updatePlaybook(id: string, data: Partial<Playbook>): Promise<ApiResponse<Playbook>> {
    return apiClient.put<ApiResponse<Playbook>>(`/automation/playbooks/${id}`, data);
  },

  /**
   * Deletes a playbook permanently.
   *
   * @async
   * @param {string} id - The playbook ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When deletion fails or playbook has active executions
   *
   * @example
   * ```typescript
   * await playbookService.deletePlaybook('pb-123');
   * ```
   */
  async deletePlaybook(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/automation/playbooks/${id}`);
  },

  /**
   * Executes a playbook with optional context data.
   *
   * Triggers an automated workflow execution. Context data is passed to playbook
   * steps and can include incident IDs, threat data, or other relevant information.
   *
   * @async
   * @param {string} id - The playbook ID
   * @param {unknown} [context] - Optional context data for the playbook execution
   * @returns {Promise<ApiResponse<PlaybookExecution>>} The execution details with tracking ID
   * @throws {Error} When execution fails to start or playbook is inactive
   *
   * @example
   * ```typescript
   * const execution = await playbookService.executePlaybook('pb-123', {
   *   incidentId: 'inc-456',
   *   severity: 'critical',
   *   affectedAssets: ['server-1', 'server-2']
   * });
   * ```
   */
  async executePlaybook(id: string, context?: unknown): Promise<ApiResponse<PlaybookExecution>> {
    return apiClient.post<ApiResponse<PlaybookExecution>>(
      `/automation/playbooks/${id}/execute`,
      { context }
    );
  },

  /**
   * Retrieves all playbook executions.
   *
   * @async
   * @returns {Promise<ApiResponse<PlaybookExecution[]>>} List of all playbook executions
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const executions = await playbookService.listExecutions();
   * ```
   */
  async listExecutions(): Promise<ApiResponse<PlaybookExecution[]>> {
    return apiClient.get<ApiResponse<PlaybookExecution[]>>('/automation/playbooks/executions');
  },

  /**
   * Retrieves details of a specific playbook execution.
   *
   * @async
   * @param {string} id - The execution ID
   * @returns {Promise<ApiResponse<PlaybookExecution>>} Execution details with step results
   * @throws {Error} When execution not found
   *
   * @example
   * ```typescript
   * const execution = await playbookService.getExecution('exec-789');
   * console.log(`Status: ${execution.data.status}`);
   * ```
   */
  async getExecution(id: string): Promise<ApiResponse<PlaybookExecution>> {
    return apiClient.get<ApiResponse<PlaybookExecution>>(`/automation/playbooks/executions/${id}`);
  },

  /**
   * Cancels a running playbook execution.
   *
   * Attempts to gracefully stop a running playbook execution. Some steps may complete
   * before the cancellation takes effect.
   *
   * @async
   * @param {string} id - The execution ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When cancellation fails or execution already completed
   *
   * @example
   * ```typescript
   * await playbookService.cancelExecution('exec-789');
   * ```
   */
  async cancelExecution(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/automation/playbooks/executions/${id}/cancel`);
  },

  /**
   * Retrieves the playbook library with pre-built workflows.
   *
   * Returns a collection of ready-to-use playbook templates for common security scenarios.
   *
   * @async
   * @returns {Promise<ApiResponse<Playbook[]>>} List of library playbooks
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const templates = await playbookService.getLibrary();
   * ```
   */
  async getLibrary(): Promise<ApiResponse<Playbook[]>> {
    return apiClient.get<ApiResponse<Playbook[]>>('/automation/playbooks/library');
  },

  /**
   * Retrieves playbook analytics and execution statistics.
   *
   * Provides metrics on playbook usage, success rates, execution times, and trends.
   *
   * @async
   * @returns {Promise<ApiResponse<unknown>>} Analytics data
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const analytics = await playbookService.getAnalytics();
   * ```
   */
  async getAnalytics(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/automation/playbooks/analytics');
  },
};
