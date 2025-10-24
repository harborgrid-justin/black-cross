/**
 * @fileoverview Indicator of Compromise (IOC) API service.
 * 
 * Provides methods for IOC management, checking, and bulk importing.
 * 
 * @module services/iocService
 */

import { apiClient } from './api';
import type { IoC, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Service for handling Indicator of Compromise (IOC) API operations.
 *
 * Provides comprehensive methods for managing IOCs including retrieval, creation,
 * bulk import/export, and threat feed checking. All methods return promises and
 * handle errors appropriately.
 *
 * @namespace iocService
 * @example
 * ```typescript
 * // Get all IOCs
 * const iocs = await iocService.getIoCs({ type: 'ip', status: 'active' });
 *
 * // Check an IOC against threat feeds
 * const result = await iocService.checkIoC('192.168.1.1', 'ip');
 * ```
 */
export const iocService = {
  /**
   * Retrieves all IOCs with optional filtering and pagination.
   *
   * @async
   * @param {FilterOptions} [filters] - Optional filter criteria including type, status, source
   * @returns {Promise<PaginatedResponse<IoC>>} Paginated list of IOCs
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const iocs = await iocService.getIoCs({
   *   type: 'domain',
   *   status: 'active',
   *   page: 1,
   *   perPage: 50
   * });
   * ```
   */
  async getIoCs(filters?: FilterOptions): Promise<PaginatedResponse<IoC>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<IoC>>(
      `/iocs?${params.toString()}`
    );
  },

  /**
   * Retrieves a single IOC by its unique identifier.
   *
   * @async
   * @param {string} id - The IOC ID
   * @returns {Promise<ApiResponse<IoC>>} The IOC data
   * @throws {Error} When the IOC is not found or request fails
   *
   * @example
   * ```typescript
   * const ioc = await iocService.getIoC('ioc-123');
   * ```
   */
  async getIoC(id: string): Promise<ApiResponse<IoC>> {
    return apiClient.get<ApiResponse<IoC>>(`/iocs/${id}`);
  },

  /**
   * Creates a new IOC.
   *
   * @async
   * @param {Partial<IoC>} data - The IOC data including type, value, confidence, and source
   * @returns {Promise<ApiResponse<IoC>>} The created IOC
   * @throws {Error} When IOC creation fails or validation errors occur
   *
   * @example
   * ```typescript
   * const ioc = await iocService.createIoC({
   *   type: 'domain',
   *   value: 'malicious-domain.com',
   *   confidence: 95,
   *   source: 'threat-feed-x'
   * });
   * ```
   */
  async createIoC(data: Partial<IoC>): Promise<ApiResponse<IoC>> {
    return apiClient.post<ApiResponse<IoC>>('/iocs', data);
  },

  /**
   * Updates an existing IOC.
   *
   * @async
   * @param {string} id - The IOC ID
   * @param {Partial<IoC>} data - Fields to update
   * @returns {Promise<ApiResponse<IoC>>} The updated IOC
   * @throws {Error} When update fails
   *
   * @example
   * ```typescript
   * await iocService.updateIoC('ioc-123', {
   *   confidence: 100,
   *   status: 'confirmed'
   * });
   * ```
   */
  async updateIoC(id: string, data: Partial<IoC>): Promise<ApiResponse<IoC>> {
    return apiClient.put<ApiResponse<IoC>>(`/iocs/${id}`, data);
  },

  /**
   * Deletes an IOC permanently.
   *
   * @async
   * @param {string} id - The IOC ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When deletion fails
   *
   * @example
   * ```typescript
   * await iocService.deleteIoC('ioc-123');
   * ```
   */
  async deleteIoC(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/iocs/${id}`);
  },

  /**
   * Bulk imports multiple IOCs.
   *
   * Allows efficient import of large numbers of IOCs from feeds or files.
   *
   * @async
   * @param {Partial<IoC>[]} iocs - Array of IOC data objects
   * @returns {Promise<ApiResponse<unknown>>} Import results with success/failure counts
   * @throws {Error} When bulk import fails
   *
   * @example
   * ```typescript
   * const result = await iocService.bulkImport([
   *   { type: 'ip', value: '1.2.3.4', confidence: 90, source: 'feed-a' },
   *   { type: 'hash', value: 'abc123...', confidence: 85, source: 'feed-a' }
   * ]);
   * ```
   */
  async bulkImport(iocs: Partial<IoC>[]): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/iocs/bulk', { iocs });
  },

  /**
   * Exports IOCs in specified format.
   *
   * Supports JSON for programmatic use, CSV for spreadsheets, and STIX for threat intelligence platforms.
   *
   * @async
   * @param {'json' | 'csv' | 'stix'} format - Export format
   * @returns {Promise<ApiResponse<unknown>>} Exported IOC data
   * @throws {Error} When export fails
   *
   * @example
   * ```typescript
   * const stixData = await iocService.exportIoCs('stix');
   * ```
   */
  async exportIoCs(format: 'json' | 'csv' | 'stix'): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/iocs/export?format=${format}`);
  },

  /**
   * Checks an IOC value against threat intelligence feeds.
   *
   * Queries external threat feeds to determine if the IOC is known malicious.
   *
   * @async
   * @param {string} value - The IOC value to check
   * @param {string} type - The IOC type (ip, domain, url, hash, email)
   * @returns {Promise<ApiResponse<unknown>>} Check results with threat intelligence data
   * @throws {Error} When check fails or IOC type is invalid
   *
   * @example
   * ```typescript
   * const result = await iocService.checkIoC('192.168.1.1', 'ip');
   * if (result.data.isMalicious) {
   *   console.log('Threat detected!');
   * }
   * ```
   */
  async checkIoC(value: string, type: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/iocs/check', { value, type });
  },
};
