import { apiClient } from './api';
import type { ApiResponse } from '@/types';

interface ThreatFeed {
  id: string;
  name: string;
  status: boolean;
  lastUpdate: string;
  type: string;
  reliability: number;
}

export const feedService = {
  // Get all threat feeds
  async getFeeds(): Promise<ApiResponse<ThreatFeed[]>> {
    return apiClient.get<ApiResponse<ThreatFeed[]>>('/threat-feeds');
  },

  // Get single feed by ID
  async getFeed(id: string): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.get<ApiResponse<ThreatFeed>>(`/threat-feeds/${id}`);
  },

  // Create feed
  async createFeed(data: Partial<ThreatFeed>): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.post<ApiResponse<ThreatFeed>>('/threat-feeds', data);
  },

  // Update feed
  async updateFeed(id: string, data: Partial<ThreatFeed>): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.put<ApiResponse<ThreatFeed>>(`/threat-feeds/${id}`, data);
  },

  // Delete feed
  async deleteFeed(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-feeds/${id}`);
  },

  // Enable/disable feed
  async toggleFeed(id: string, enabled: boolean): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.patch<ApiResponse<ThreatFeed>>(`/threat-feeds/${id}/toggle`, { enabled });
  },

  // Refresh feed
  async refreshFeed(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(`/threat-feeds/${id}/refresh`);
  },

  // Get feed statistics
  async getFeedStats(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/threat-feeds/${id}/stats`);
  },
};
