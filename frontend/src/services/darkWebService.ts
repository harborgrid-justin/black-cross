/**
 * @fileoverview Dark Web Monitoring API service.
 * 
 * Provides methods for dark web intelligence gathering, monitoring, and alerts.
 * 
 * @module services/darkWebService
 */

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export interface DarkWebFinding {
  id: string;
  type: 'credential-leak' | 'brand-mention' | 'data-breach' | 'threat-actor' | 'malware' | 'marketplace';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'investigating' | 'validated' | 'false-positive' | 'resolved';
  source: string;
  sourceUrl?: string;
  title: string;
  description: string;
  content?: string;
  keywords: string[];
  affectedAssets?: string[];
  discoveredAt: string;
  updatedAt: string;
}

export interface CredentialLeak {
  id: string;
  findingId: string;
  email: string;
  username?: string;
  password?: string;
  domain?: string;
  source: string;
  leakDate?: string;
  validated: boolean;
  discoveredAt: string;
}

export interface BrandMention {
  id: string;
  findingId: string;
  brandName: string;
  context: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
  url?: string;
  mentionedAt: string;
}

export interface MonitoringKeyword {
  id: string;
  keyword: string;
  category: string;
  active: boolean;
  priority: 'high' | 'medium' | 'low';
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DarkWebSource {
  id: string;
  name: string;
  type: 'forum' | 'marketplace' | 'paste-site' | 'chat' | 'other';
  url?: string;
  active: boolean;
  lastScanned?: string;
  totalFindings: number;
  reliability: number;
  createdAt: string;
}

export interface DarkWebAlert {
  id: string;
  findingId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  notified: boolean;
  notifiedAt?: string;
  createdAt: string;
}

/**
 * Service for handling darkWeb API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace darkWebService
 */
export const darkWebService = {
  // Findings
  async getFindings(filters?: FilterOptions): Promise<PaginatedResponse<DarkWebFinding>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<DarkWebFinding>>(
      `/dark-web/findings?${params.toString()}`
    );
  },

  async getFinding(id: string): Promise<ApiResponse<DarkWebFinding>> {
    return apiClient.get<ApiResponse<DarkWebFinding>>(`/dark-web/findings/${id}`);
  },

  async updateFinding(id: string, data: Partial<DarkWebFinding>): Promise<ApiResponse<DarkWebFinding>> {
    return apiClient.put<ApiResponse<DarkWebFinding>>(`/dark-web/findings/${id}`, data);
  },

  async deleteFinding(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/dark-web/findings/${id}`);
  },

  // Credential Leaks
  async getCredentialLeaks(filters?: FilterOptions): Promise<PaginatedResponse<CredentialLeak>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<CredentialLeak>>(
      `/dark-web/credential-leaks?${params.toString()}`
    );
  },

  async validateCredential(id: string): Promise<ApiResponse<CredentialLeak>> {
    return apiClient.post<ApiResponse<CredentialLeak>>(
      `/dark-web/credential-leaks/${id}/validate`
    );
  },

  // Brand Mentions
  async getBrandMentions(filters?: FilterOptions): Promise<PaginatedResponse<BrandMention>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<BrandMention>>(
      `/dark-web/brand-mentions?${params.toString()}`
    );
  },

  // Keywords
  async getKeywords(): Promise<ApiResponse<MonitoringKeyword[]>> {
    return apiClient.get<ApiResponse<MonitoringKeyword[]>>('/dark-web/keywords');
  },

  async createKeyword(data: Partial<MonitoringKeyword>): Promise<ApiResponse<MonitoringKeyword>> {
    return apiClient.post<ApiResponse<MonitoringKeyword>>('/dark-web/keywords', data);
  },

  async updateKeyword(id: string, data: Partial<MonitoringKeyword>): Promise<ApiResponse<MonitoringKeyword>> {
    return apiClient.put<ApiResponse<MonitoringKeyword>>(`/dark-web/keywords/${id}`, data);
  },

  async deleteKeyword(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/dark-web/keywords/${id}`);
  },

  // Sources
  async getSources(filters?: FilterOptions): Promise<PaginatedResponse<DarkWebSource>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<DarkWebSource>>(
      `/dark-web/sources?${params.toString()}`
    );
  },

  async createSource(data: Partial<DarkWebSource>): Promise<ApiResponse<DarkWebSource>> {
    return apiClient.post<ApiResponse<DarkWebSource>>('/dark-web/sources', data);
  },

  async updateSource(id: string, data: Partial<DarkWebSource>): Promise<ApiResponse<DarkWebSource>> {
    return apiClient.put<ApiResponse<DarkWebSource>>(`/dark-web/sources/${id}`, data);
  },

  async deleteSource(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/dark-web/sources/${id}`);
  },

  // Alerts
  async getAlerts(filters?: FilterOptions): Promise<PaginatedResponse<DarkWebAlert>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<DarkWebAlert>>(
      `/dark-web/alerts?${params.toString()}`
    );
  },

  // Statistics
  async getStatistics(): Promise<ApiResponse<{
    totalFindings: number;
    criticalFindings: number;
    credentialLeaks: number;
    brandMentions: number;
    activeKeywords: number;
    activeSources: number;
  }>> {
    return apiClient.get<ApiResponse<{
      totalFindings: number;
      criticalFindings: number;
      credentialLeaks: number;
      brandMentions: number;
      activeKeywords: number;
      activeSources: number;
    }>>('/dark-web/statistics');
  },
};
