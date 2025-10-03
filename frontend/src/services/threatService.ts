import { apiClient } from './api';
import type { Threat, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export const threatService = {
  // Get all threats with optional filters
  async getThreats(filters?: FilterOptions): Promise<PaginatedResponse<Threat>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<Threat>>(
      `/threat-intelligence/threats?${params.toString()}`
    );
  },

  // Get single threat by ID
  async getThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.get<ApiResponse<Threat>>(`/threat-intelligence/threats/${id}`);
  },

  // Collect new threat
  async collectThreat(data: Partial<Threat>): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>('/threat-intelligence/threats/collect', data);
  },

  // Categorize threat
  async categorizeThreat(id: string, categories: string[]): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/categorize`,
      { categories }
    );
  },

  // Archive threat
  async archiveThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/archive`
    );
  },

  // Enrich threat
  async enrichThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/enrich`
    );
  },

  // Get enriched threat data
  async getEnrichedThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.get<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/enriched`
    );
  },

  // Correlate threats
  async correlateThreats(data: { threatIds: string[] }): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      '/threat-intelligence/threats/correlate',
      data
    );
  },

  // Analyze threat context
  async analyzeThreat(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/threat-intelligence/threats/${id}/analyze`
    );
  },

  // Update threat
  async updateThreat(id: string, data: Partial<Threat>): Promise<ApiResponse<Threat>> {
    return apiClient.put<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}`,
      data
    );
  },

  // Delete threat
  async deleteThreat(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-intelligence/threats/${id}`);
  },
};
