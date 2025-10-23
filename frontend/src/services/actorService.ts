/**
 * @fileoverview Threat Actor API service.
 * 
 * Provides methods for managing threat actor profiles, campaigns, and TTPs.
 * 
 * @module services/actorService
 */

import { apiClient } from './api';
import type { ThreatActor, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Service for handling actor API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace actorService
 */
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
      `/threat-actors?${params.toString()}`
    );
  },

  // Get single threat actor by ID
  async getActor(id: string): Promise<ApiResponse<ThreatActor>> {
    return apiClient.get<ApiResponse<ThreatActor>>(`/threat-actors/${id}`);
  },

  // Create threat actor
  async createActor(data: Partial<ThreatActor>): Promise<ApiResponse<ThreatActor>> {
    return apiClient.post<ApiResponse<ThreatActor>>('/threat-actors', data);
  },

  // Update threat actor
  async updateActor(id: string, data: Partial<ThreatActor>): Promise<ApiResponse<ThreatActor>> {
    return apiClient.put<ApiResponse<ThreatActor>>(`/threat-actors/${id}`, data);
  },

  // Delete threat actor
  async deleteActor(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-actors/${id}`);
  },

  // Get actor campaigns
  async getActorCampaigns(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/threat-actors/${id}/campaigns`);
  },

  // Get actor TTPs
  async getActorTTPs(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/threat-actors/${id}/ttps`);
  },
};
