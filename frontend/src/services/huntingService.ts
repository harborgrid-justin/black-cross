/**
 * @fileoverview Threat Hunting API service.
 * 
 * Provides methods for threat hunting sessions, queries, and results analysis.
 * 
 * @module services/huntingService
 */

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export interface HuntingHypothesis {
  id: string;
  title: string;
  description: string;
  category: 'malware' | 'insider-threat' | 'apt' | 'data-exfiltration' | 'lateral-movement' | 'privilege-escalation' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'active' | 'validated' | 'disproven' | 'archived';
  queries: HuntingQuery[];
  findings: HuntingFinding[];
  mitreTactics?: string[];
  mitreTechniques?: string[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HuntingQuery {
  id: string;
  hypothesisId: string;
  name: string;
  description?: string;
  queryLanguage: 'kql' | 'spl' | 'sql' | 'lucene';
  query: string;
  dataSource: string;
  timeRange?: {
    start: string;
    end: string;
  };
  results?: QueryResult;
  status: 'draft' | 'executed' | 'scheduled';
  createdAt: string;
  executedAt?: string;
}

export interface QueryResult {
  totalHits: number;
  events: Array<Record<string, unknown>>;
  aggregations?: Record<string, unknown>;
  executionTime: number;
  executedAt: string;
}

export interface HuntingFinding {
  id: string;
  hypothesisId: string;
  queryId?: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  status: 'new' | 'investigating' | 'confirmed' | 'false-positive' | 'resolved';
  evidence: Evidence[];
  iocs: Array<{ type: string; value: string }>;
  affectedAssets: string[];
  recommendations: string[];
  assignedTo?: string;
  discoveredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  type: 'log' | 'file' | 'network' | 'screenshot' | 'note';
  description: string;
  data?: Record<string, unknown>;
  fileUrl?: string;
  collectedAt: string;
}

export interface HuntingCampaign {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  hypotheses: string[];
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  teamMembers: string[];
  findings: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'logs' | 'network' | 'endpoint' | 'cloud' | 'application';
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastIngestion?: string;
  eventCount?: number;
  retentionDays: number;
  config: Record<string, unknown>;
}

export interface HuntingPlaybook {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: PlaybookStep[];
  queries: HuntingQuery[];
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface PlaybookStep {
  order: number;
  title: string;
  description: string;
  queryIds?: string[];
  expectedOutcome: string;
  nextSteps: string[];
}

export interface HuntingStatistics {
  totalHypotheses: number;
  activeHypotheses: number;
  validatedHypotheses: number;
  totalFindings: number;
  criticalFindings: number;
  activeCampaigns: number;
  topCategories: Array<{ category: string; count: number }>;
  findingsTrend: Array<{ date: string; count: number }>;
}

/**
 * Service for handling hunting API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace huntingService
 */
export const huntingService = {
  // Hypotheses
  async getHypotheses(filters?: FilterOptions): Promise<PaginatedResponse<HuntingHypothesis>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<HuntingHypothesis>>(
      `/threat-hunting/hypotheses?${params.toString()}`
    );
  },

  async getHypothesis(id: string): Promise<ApiResponse<HuntingHypothesis>> {
    return apiClient.get<ApiResponse<HuntingHypothesis>>(`/threat-hunting/hypotheses/${id}`);
  },

  async createHypothesis(data: Partial<HuntingHypothesis>): Promise<ApiResponse<HuntingHypothesis>> {
    return apiClient.post<ApiResponse<HuntingHypothesis>>('/threat-hunting/hypotheses', data);
  },

  async updateHypothesis(id: string, data: Partial<HuntingHypothesis>): Promise<ApiResponse<HuntingHypothesis>> {
    return apiClient.put<ApiResponse<HuntingHypothesis>>(`/threat-hunting/hypotheses/${id}`, data);
  },

  async deleteHypothesis(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-hunting/hypotheses/${id}`);
  },

  // Queries
  async getQueries(hypothesisId?: string): Promise<ApiResponse<HuntingQuery[]>> {
    const url = hypothesisId
      ? `/threat-hunting/hypotheses/${hypothesisId}/queries`
      : '/threat-hunting/queries';
    return apiClient.get<ApiResponse<HuntingQuery[]>>(url);
  },

  async getQuery(hypothesisId: string, queryId: string): Promise<ApiResponse<HuntingQuery>> {
    return apiClient.get<ApiResponse<HuntingQuery>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}`
    );
  },

  async createQuery(hypothesisId: string, data: Partial<HuntingQuery>): Promise<ApiResponse<HuntingQuery>> {
    return apiClient.post<ApiResponse<HuntingQuery>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries`,
      data
    );
  },

  async updateQuery(hypothesisId: string, queryId: string, data: Partial<HuntingQuery>): Promise<ApiResponse<HuntingQuery>> {
    return apiClient.put<ApiResponse<HuntingQuery>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}`,
      data
    );
  },

  async deleteQuery(hypothesisId: string, queryId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}`
    );
  },

  async executeQuery(hypothesisId: string, queryId: string): Promise<ApiResponse<QueryResult>> {
    return apiClient.post<ApiResponse<QueryResult>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}/execute`
    );
  },

  async executeAdHocQuery(query: Partial<HuntingQuery>): Promise<ApiResponse<QueryResult>> {
    return apiClient.post<ApiResponse<QueryResult>>('/threat-hunting/queries/execute', query);
  },

  // Findings
  async getFindings(hypothesisId?: string, filters?: FilterOptions): Promise<PaginatedResponse<HuntingFinding>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const url = hypothesisId
      ? `/threat-hunting/hypotheses/${hypothesisId}/findings?${params.toString()}`
      : `/threat-hunting/findings?${params.toString()}`;
    return apiClient.get<PaginatedResponse<HuntingFinding>>(url);
  },

  async getFinding(hypothesisId: string, findingId: string): Promise<ApiResponse<HuntingFinding>> {
    return apiClient.get<ApiResponse<HuntingFinding>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}`
    );
  },

  async createFinding(hypothesisId: string, data: Partial<HuntingFinding>): Promise<ApiResponse<HuntingFinding>> {
    return apiClient.post<ApiResponse<HuntingFinding>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings`,
      data
    );
  },

  async updateFinding(hypothesisId: string, findingId: string, data: Partial<HuntingFinding>): Promise<ApiResponse<HuntingFinding>> {
    return apiClient.put<ApiResponse<HuntingFinding>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}`,
      data
    );
  },

  async deleteFinding(hypothesisId: string, findingId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}`
    );
  },

  async addEvidence(hypothesisId: string, findingId: string, evidence: Partial<Evidence>): Promise<ApiResponse<Evidence>> {
    return apiClient.post<ApiResponse<Evidence>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}/evidence`,
      evidence
    );
  },

  // Campaigns
  async getCampaigns(filters?: FilterOptions): Promise<PaginatedResponse<HuntingCampaign>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<HuntingCampaign>>(
      `/threat-hunting/campaigns?${params.toString()}`
    );
  },

  async getCampaign(id: string): Promise<ApiResponse<HuntingCampaign>> {
    return apiClient.get<ApiResponse<HuntingCampaign>>(`/threat-hunting/campaigns/${id}`);
  },

  async createCampaign(data: Partial<HuntingCampaign>): Promise<ApiResponse<HuntingCampaign>> {
    return apiClient.post<ApiResponse<HuntingCampaign>>('/threat-hunting/campaigns', data);
  },

  async updateCampaign(id: string, data: Partial<HuntingCampaign>): Promise<ApiResponse<HuntingCampaign>> {
    return apiClient.put<ApiResponse<HuntingCampaign>>(`/threat-hunting/campaigns/${id}`, data);
  },

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-hunting/campaigns/${id}`);
  },

  // Data Sources
  async getDataSources(): Promise<ApiResponse<DataSource[]>> {
    return apiClient.get<ApiResponse<DataSource[]>>('/threat-hunting/data-sources');
  },

  async getDataSource(id: string): Promise<ApiResponse<DataSource>> {
    return apiClient.get<ApiResponse<DataSource>>(`/threat-hunting/data-sources/${id}`);
  },

  async testDataSource(id: string): Promise<ApiResponse<{ status: string; message: string }>> {
    return apiClient.post<ApiResponse<{ status: string; message: string }>>(
      `/threat-hunting/data-sources/${id}/test`
    );
  },

  // Playbooks
  async getPlaybooks(category?: string): Promise<ApiResponse<HuntingPlaybook[]>> {
    const url = category
      ? `/threat-hunting/playbooks?category=${category}`
      : '/threat-hunting/playbooks';
    return apiClient.get<ApiResponse<HuntingPlaybook[]>>(url);
  },

  async getPlaybook(id: string): Promise<ApiResponse<HuntingPlaybook>> {
    return apiClient.get<ApiResponse<HuntingPlaybook>>(`/threat-hunting/playbooks/${id}`);
  },

  async createPlaybook(data: Partial<HuntingPlaybook>): Promise<ApiResponse<HuntingPlaybook>> {
    return apiClient.post<ApiResponse<HuntingPlaybook>>('/threat-hunting/playbooks', data);
  },

  async updatePlaybook(id: string, data: Partial<HuntingPlaybook>): Promise<ApiResponse<HuntingPlaybook>> {
    return apiClient.put<ApiResponse<HuntingPlaybook>>(`/threat-hunting/playbooks/${id}`, data);
  },

  async deletePlaybook(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-hunting/playbooks/${id}`);
  },

  async executePlaybook(id: string): Promise<ApiResponse<{ hypothesisId: string }>> {
    return apiClient.post<ApiResponse<{ hypothesisId: string }>>(
      `/threat-hunting/playbooks/${id}/execute`
    );
  },

  // Statistics
  async getStatistics(): Promise<ApiResponse<HuntingStatistics>> {
    return apiClient.get<ApiResponse<HuntingStatistics>>('/threat-hunting/statistics');
  },

  // Export
  async exportHypothesis(id: string, format: 'pdf' | 'json' | 'md'): Promise<Blob> {
    return apiClient.get<Blob>(`/threat-hunting/hypotheses/${id}/export?format=${format}`);
  },

  async exportFindings(filters: FilterOptions, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    return apiClient.post<Blob>('/threat-hunting/findings/export', { filters, format });
  },
};
