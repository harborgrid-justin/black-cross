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
 * Provides comprehensive methods for managing threat hunting hypotheses, queries,
 * findings, campaigns, playbooks, and data sources. All methods return promises
 * and handle errors appropriately.
 *
 * @namespace huntingService
 * @example
 * ```typescript
 * // Get all hunting hypotheses with filters
 * const hypotheses = await huntingService.getHypotheses({
 *   status: 'active',
 *   priority: 'high'
 * });
 *
 * // Execute a hunting query
 * const result = await huntingService.executeQuery('hypothesis-id', 'query-id');
 * ```
 */
export const huntingService = {
  /**
   * Retrieves all hunting hypotheses with optional filtering and pagination.
   *
   * @async
   * @param {FilterOptions} [filters] - Optional filter criteria including status, priority, category
   * @returns {Promise<PaginatedResponse<HuntingHypothesis>>} Paginated list of hunting hypotheses
   * @throws {Error} When the API request fails or network error occurs
   *
   * @example
   * ```typescript
   * const hypotheses = await huntingService.getHypotheses({
   *   status: 'active',
   *   priority: 'critical',
   *   page: 1,
   *   perPage: 20
   * });
   * ```
   */
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

  /**
   * Retrieves a single hunting hypothesis by its unique identifier.
   *
   * @async
   * @param {string} id - The hypothesis ID
   * @returns {Promise<ApiResponse<HuntingHypothesis>>} The hypothesis data with queries and findings
   * @throws {Error} When the hypothesis is not found or request fails
   *
   * @example
   * ```typescript
   * const hypothesis = await huntingService.getHypothesis('hyp-123');
   * ```
   */
  async getHypothesis(id: string): Promise<ApiResponse<HuntingHypothesis>> {
    return apiClient.get<ApiResponse<HuntingHypothesis>>(`/threat-hunting/hypotheses/${id}`);
  },

  /**
   * Creates a new hunting hypothesis.
   *
   * @async
   * @param {Partial<HuntingHypothesis>} data - The hypothesis data including title, description, category, priority
   * @returns {Promise<ApiResponse<HuntingHypothesis>>} The created hypothesis
   * @throws {Error} When hypothesis creation fails or validation errors occur
   *
   * @example
   * ```typescript
   * const hypothesis = await huntingService.createHypothesis({
   *   title: 'Suspicious lateral movement',
   *   description: 'Detecting potential lateral movement patterns',
   *   category: 'lateral-movement',
   *   priority: 'high',
   *   mitreTactics: ['TA0008']
   * });
   * ```
   */
  async createHypothesis(data: Partial<HuntingHypothesis>): Promise<ApiResponse<HuntingHypothesis>> {
    return apiClient.post<ApiResponse<HuntingHypothesis>>('/threat-hunting/hypotheses', data);
  },

  /**
   * Updates an existing hunting hypothesis.
   *
   * @async
   * @param {string} id - The hypothesis ID
   * @param {Partial<HuntingHypothesis>} data - Fields to update
   * @returns {Promise<ApiResponse<HuntingHypothesis>>} The updated hypothesis
   * @throws {Error} When update fails or hypothesis not found
   *
   * @example
   * ```typescript
   * await huntingService.updateHypothesis('hyp-123', {
   *   status: 'validated',
   *   priority: 'critical'
   * });
   * ```
   */
  async updateHypothesis(id: string, data: Partial<HuntingHypothesis>): Promise<ApiResponse<HuntingHypothesis>> {
    return apiClient.put<ApiResponse<HuntingHypothesis>>(`/threat-hunting/hypotheses/${id}`, data);
  },

  /**
   * Deletes a hunting hypothesis permanently.
   *
   * @async
   * @param {string} id - The hypothesis ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When deletion fails or hypothesis is referenced by active campaigns
   *
   * @example
   * ```typescript
   * await huntingService.deleteHypothesis('hyp-123');
   * ```
   */
  async deleteHypothesis(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-hunting/hypotheses/${id}`);
  },

  // Queries
  /**
   * Retrieves hunting queries for a hypothesis or all queries.
   *
   * @async
   * @param {string} [hypothesisId] - Optional hypothesis ID to filter queries
   * @returns {Promise<ApiResponse<HuntingQuery[]>>} List of hunting queries
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * // Get all queries for a specific hypothesis
   * const queries = await huntingService.getQueries('hyp-123');
   *
   * // Get all queries across all hypotheses
   * const allQueries = await huntingService.getQueries();
   * ```
   */
  async getQueries(hypothesisId?: string): Promise<ApiResponse<HuntingQuery[]>> {
    const url = hypothesisId
      ? `/threat-hunting/hypotheses/${hypothesisId}/queries`
      : '/threat-hunting/queries';
    return apiClient.get<ApiResponse<HuntingQuery[]>>(url);
  },

  /**
   * Retrieves a single hunting query by ID.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} queryId - The query ID
   * @returns {Promise<ApiResponse<HuntingQuery>>} The query data with results
   * @throws {Error} When query not found or request fails
   *
   * @example
   * ```typescript
   * const query = await huntingService.getQuery('hyp-123', 'qry-456');
   * ```
   */
  async getQuery(hypothesisId: string, queryId: string): Promise<ApiResponse<HuntingQuery>> {
    return apiClient.get<ApiResponse<HuntingQuery>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}`
    );
  },

  /**
   * Creates a new hunting query for a hypothesis.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {Partial<HuntingQuery>} data - Query data including query language, query string, data source
   * @returns {Promise<ApiResponse<HuntingQuery>>} The created query
   * @throws {Error} When query creation fails or validation errors occur
   *
   * @example
   * ```typescript
   * const query = await huntingService.createQuery('hyp-123', {
   *   name: 'Check failed logins',
   *   queryLanguage: 'kql',
   *   query: 'SecurityEvent | where EventID == 4625',
   *   dataSource: 'windows-security-logs'
   * });
   * ```
   */
  async createQuery(hypothesisId: string, data: Partial<HuntingQuery>): Promise<ApiResponse<HuntingQuery>> {
    return apiClient.post<ApiResponse<HuntingQuery>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries`,
      data
    );
  },

  /**
   * Updates an existing hunting query.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} queryId - The query ID
   * @param {Partial<HuntingQuery>} data - Fields to update
   * @returns {Promise<ApiResponse<HuntingQuery>>} The updated query
   * @throws {Error} When update fails
   *
   * @example
   * ```typescript
   * await huntingService.updateQuery('hyp-123', 'qry-456', {
   *   status: 'executed',
   *   description: 'Updated query description'
   * });
   * ```
   */
  async updateQuery(hypothesisId: string, queryId: string, data: Partial<HuntingQuery>): Promise<ApiResponse<HuntingQuery>> {
    return apiClient.put<ApiResponse<HuntingQuery>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}`,
      data
    );
  },

  /**
   * Deletes a hunting query permanently.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} queryId - The query ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When deletion fails
   *
   * @example
   * ```typescript
   * await huntingService.deleteQuery('hyp-123', 'qry-456');
   * ```
   */
  async deleteQuery(hypothesisId: string, queryId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}`
    );
  },

  /**
   * Executes a hunting query against its configured data source.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} queryId - The query ID
   * @returns {Promise<ApiResponse<QueryResult>>} Query execution results with events and aggregations
   * @throws {Error} When query execution fails or data source is unavailable
   *
   * @example
   * ```typescript
   * const result = await huntingService.executeQuery('hyp-123', 'qry-456');
   * console.log(`Found ${result.data.totalHits} events in ${result.data.executionTime}ms`);
   * ```
   */
  async executeQuery(hypothesisId: string, queryId: string): Promise<ApiResponse<QueryResult>> {
    return apiClient.post<ApiResponse<QueryResult>>(
      `/threat-hunting/hypotheses/${hypothesisId}/queries/${queryId}/execute`
    );
  },

  /**
   * Executes an ad-hoc hunting query without saving it.
   *
   * Useful for testing queries before creating a formal hypothesis query.
   *
   * @async
   * @param {Partial<HuntingQuery>} query - Query specification including query language and string
   * @returns {Promise<ApiResponse<QueryResult>>} Query execution results
   * @throws {Error} When query execution fails or syntax is invalid
   *
   * @example
   * ```typescript
   * const result = await huntingService.executeAdHocQuery({
   *   queryLanguage: 'kql',
   *   query: 'SecurityEvent | where EventID == 4625 | take 100',
   *   dataSource: 'windows-security-logs'
   * });
   * ```
   */
  async executeAdHocQuery(query: Partial<HuntingQuery>): Promise<ApiResponse<QueryResult>> {
    return apiClient.post<ApiResponse<QueryResult>>('/threat-hunting/queries/execute', query);
  },

  // Findings
  /**
   * Retrieves hunting findings with optional filtering.
   *
   * @async
   * @param {string} [hypothesisId] - Optional hypothesis ID to filter findings
   * @param {FilterOptions} [filters] - Optional filter criteria
   * @returns {Promise<PaginatedResponse<HuntingFinding>>} Paginated list of findings
   * @throws {Error} When the API request fails
   */
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

  /**
   * Retrieves a single finding by ID.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} findingId - The finding ID
   * @returns {Promise<ApiResponse<HuntingFinding>>} The finding data
   * @throws {Error} When finding not found
   */
  async getFinding(hypothesisId: string, findingId: string): Promise<ApiResponse<HuntingFinding>> {
    return apiClient.get<ApiResponse<HuntingFinding>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}`
    );
  },

  /**
   * Creates a new hunting finding.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {Partial<HuntingFinding>} data - Finding data
   * @returns {Promise<ApiResponse<HuntingFinding>>} The created finding
   * @throws {Error} When finding creation fails
   */
  async createFinding(hypothesisId: string, data: Partial<HuntingFinding>): Promise<ApiResponse<HuntingFinding>> {
    return apiClient.post<ApiResponse<HuntingFinding>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings`,
      data
    );
  },

  /**
   * Updates an existing finding.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} findingId - The finding ID
   * @param {Partial<HuntingFinding>} data - Fields to update
   * @returns {Promise<ApiResponse<HuntingFinding>>} The updated finding
   * @throws {Error} When update fails
   */
  async updateFinding(hypothesisId: string, findingId: string, data: Partial<HuntingFinding>): Promise<ApiResponse<HuntingFinding>> {
    return apiClient.put<ApiResponse<HuntingFinding>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}`,
      data
    );
  },

  /**
   * Deletes a finding permanently.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} findingId - The finding ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When deletion fails
   */
  async deleteFinding(hypothesisId: string, findingId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}`
    );
  },

  /**
   * Adds evidence to a finding.
   *
   * @async
   * @param {string} hypothesisId - The hypothesis ID
   * @param {string} findingId - The finding ID
   * @param {Partial<Evidence>} evidence - Evidence data
   * @returns {Promise<ApiResponse<Evidence>>} The created evidence
   * @throws {Error} When adding evidence fails
   */
  async addEvidence(hypothesisId: string, findingId: string, evidence: Partial<Evidence>): Promise<ApiResponse<Evidence>> {
    return apiClient.post<ApiResponse<Evidence>>(
      `/threat-hunting/hypotheses/${hypothesisId}/findings/${findingId}/evidence`,
      evidence
    );
  },

  // Campaigns
  /**
   * Retrieves all hunting campaigns with optional filtering.
   *
   * @async
   * @param {FilterOptions} [filters] - Optional filter criteria
   * @returns {Promise<PaginatedResponse<HuntingCampaign>>} Paginated list of campaigns
   * @throws {Error} When the API request fails
   */
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
