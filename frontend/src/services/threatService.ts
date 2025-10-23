/**
 * @fileoverview Threat Intelligence API service.
 * 
 * Provides methods for managing threat intelligence data including collection,
 * categorization, enrichment, correlation, and analysis of threats.
 * 
 * @module services/threatService
 */

import { apiClient } from './api';
import type { Threat, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Service for handling threat intelligence API operations.
 * 
 * Provides comprehensive methods for CRUD operations on threat data,
 * along with specialized functions for threat enrichment, correlation,
 * and analysis. All methods return promises and handle errors appropriately.
 * 
 * @namespace threatService
 * @example
 * ```typescript
 * // Fetch all threats with filters
 * const threats = await threatService.getThreats({ severity: 'high' });
 * 
 * // Enrich a specific threat
 * await threatService.enrichThreat('threat-id-123');
 * ```
 */
export const threatService = {
  /**
   * Retrieves all threats with optional filtering and pagination.
   * 
   * @async
   * @param {FilterOptions} [filters] - Optional filter criteria
   * @returns {Promise<PaginatedResponse<Threat>>} Paginated list of threats
   * @throws {Error} When the API request fails
   * @example
   * ```typescript
   * const threats = await threatService.getThreats({
   *   severity: 'high',
   *   status: 'active',
   *   page: 1,
   *   perPage: 20
   * });
   * ```
   */
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

  /**
   * Retrieves a single threat by its unique identifier.
   * 
   * @async
   * @param {string} id - The threat ID
   * @returns {Promise<ApiResponse<Threat>>} The threat data
   * @throws {Error} When the threat is not found or request fails
   */
  async getThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.get<ApiResponse<Threat>>(`/threat-intelligence/threats/${id}`);
  },

  /**
   * Collects and creates a new threat intelligence entry.
   * 
   * @async
   * @param {Partial<Threat>} data - The threat data to collect
   * @returns {Promise<ApiResponse<Threat>>} The created threat
   * @throws {Error} When threat creation fails
   */
  async collectThreat(data: Partial<Threat>): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>('/threat-intelligence/threats/collect', data);
  },

  /**
   * Categorizes a threat with specified categories.
   * 
   * @async
   * @param {string} id - The threat ID
   * @param {string[]} categories - Array of category names
   * @returns {Promise<ApiResponse<Threat>>} The updated threat
   * @throws {Error} When categorization fails
   */
  async categorizeThreat(id: string, categories: string[]): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/categorize`,
      { categories }
    );
  },

  /**
   * Archives a threat, marking it as inactive.
   * 
   * @async
   * @param {string} id - The threat ID
   * @returns {Promise<ApiResponse<Threat>>} The archived threat
   * @throws {Error} When archiving fails
   */
  async archiveThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/archive`
    );
  },

  /**
   * Enriches a threat with data from external sources.
   * 
   * Triggers enrichment from OSINT, geolocation, reputation, and DNS sources.
   * 
   * @async
   * @param {string} id - The threat ID
   * @returns {Promise<ApiResponse<Threat>>} The enriched threat
   * @throws {Error} When enrichment fails
   */
  async enrichThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.post<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/enrich`
    );
  },

  /**
   * Retrieves enriched data for a threat.
   * 
   * @async
   * @param {string} id - The threat ID
   * @returns {Promise<ApiResponse<Threat>>} The threat with enrichment data
   * @throws {Error} When retrieval fails
   */
  async getEnrichedThreat(id: string): Promise<ApiResponse<Threat>> {
    return apiClient.get<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}/enriched`
    );
  },

  /**
   * Correlates multiple threats to identify relationships.
   * 
   * @async
   * @param {Object} data - Correlation parameters
   * @param {string[]} data.threatIds - Array of threat IDs to correlate
   * @returns {Promise<ApiResponse<unknown>>} Correlation results
   * @throws {Error} When correlation fails
   */
  async correlateThreats(data: { threatIds: string[] }): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      '/threat-intelligence/threats/correlate',
      data
    );
  },

  /**
   * Analyzes threat context and generates insights.
   * 
   * @async
   * @param {string} id - The threat ID
   * @returns {Promise<ApiResponse<unknown>>} Analysis results
   * @throws {Error} When analysis fails
   */
  async analyzeThreat(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/threat-intelligence/threats/${id}/analyze`
    );
  },

  /**
   * Updates an existing threat.
   * 
   * @async
   * @param {string} id - The threat ID
   * @param {Partial<Threat>} data - Fields to update
   * @returns {Promise<ApiResponse<Threat>>} The updated threat
   * @throws {Error} When update fails
   */
  async updateThreat(id: string, data: Partial<Threat>): Promise<ApiResponse<Threat>> {
    return apiClient.put<ApiResponse<Threat>>(
      `/threat-intelligence/threats/${id}`,
      data
    );
  },

  /**
   * Deletes a threat permanently.
   * 
   * @async
   * @param {string} id - The threat ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When deletion fails
   */
  async deleteThreat(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-intelligence/threats/${id}`);
  },
};
