import { apiClient } from './api';
import type { ThreatActor, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export const actorService = {
  // Get all threat actors with optional filters
  async getActors(filters?: FilterOptions): Promise<PaginatedResponse<ThreatActor>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<ThreatActor>>(
      `/actors?${params.toString()}`
    );
  },

  // Get single threat actor by ID
  async getActor(id: string): Promise<ApiResponse<ThreatActor>> {
    return apiClient.get<ApiResponse<ThreatActor>>(`/actors/${id}`);
  },

  // Create threat actor
  async createActor(data: Partial<ThreatActor>): Promise<ApiResponse<ThreatActor>> {
    return apiClient.post<ApiResponse<ThreatActor>>('/actors', data);
  },

  // Update threat actor
  async updateActor(id: string, data: Partial<ThreatActor>): Promise<ApiResponse<ThreatActor>> {
    return apiClient.put<ApiResponse<ThreatActor>>(`/actors/${id}`, data);
  },

  // Delete threat actor
  async deleteActor(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/actors/${id}`);
  },

  // Get actor campaigns
  async getActorCampaigns(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/actors/${id}/campaigns`);
  },

  // Get actor TTPs
  async getActorTTPs(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/actors/${id}/ttps`);
  },
};
