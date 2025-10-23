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
 * Service for handling playbook API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace playbookService
 */
export const playbookService = {
  // List playbooks
  async listPlaybooks(): Promise<ApiResponse<Playbook[]>> {
    return apiClient.get<ApiResponse<Playbook[]>>('/automation/playbooks');
  },

  // Get playbook by ID
  async getPlaybook(id: string): Promise<ApiResponse<Playbook>> {
    return apiClient.get<ApiResponse<Playbook>>(`/automation/playbooks/${id}`);
  },

  // Create playbook
  async createPlaybook(data: Partial<Playbook>): Promise<ApiResponse<Playbook>> {
    return apiClient.post<ApiResponse<Playbook>>('/automation/playbooks', data);
  },

  // Update playbook
  async updatePlaybook(id: string, data: Partial<Playbook>): Promise<ApiResponse<Playbook>> {
    return apiClient.put<ApiResponse<Playbook>>(`/automation/playbooks/${id}`, data);
  },

  // Delete playbook
  async deletePlaybook(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/automation/playbooks/${id}`);
  },

  // Execute playbook
  async executePlaybook(id: string, context?: unknown): Promise<ApiResponse<PlaybookExecution>> {
    return apiClient.post<ApiResponse<PlaybookExecution>>(
      `/automation/playbooks/${id}/execute`,
      { context }
    );
  },

  // List executions
  async listExecutions(): Promise<ApiResponse<PlaybookExecution[]>> {
    return apiClient.get<ApiResponse<PlaybookExecution[]>>('/automation/playbooks/executions');
  },

  // Get execution details
  async getExecution(id: string): Promise<ApiResponse<PlaybookExecution>> {
    return apiClient.get<ApiResponse<PlaybookExecution>>(`/automation/playbooks/executions/${id}`);
  },

  // Cancel execution
  async cancelExecution(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/automation/playbooks/executions/${id}/cancel`);
  },

  // Get playbook library
  async getLibrary(): Promise<ApiResponse<Playbook[]>> {
    return apiClient.get<ApiResponse<Playbook[]>>('/automation/playbooks/library');
  },

  // Get analytics
  async getAnalytics(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/automation/playbooks/analytics');
  },
};
