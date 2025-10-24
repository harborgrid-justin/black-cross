/**
 * @fileoverview Threat Feed API service.
 *
 * Provides methods for managing threat intelligence feeds and their synchronization.
 * Supports integration with external threat intelligence sources and automated feed updates.
 *
 * Authentication: All methods require a valid bearer token.
 *
 * @module services/feedService
 */

import { apiClient } from './api';
import type { ApiResponse } from '@/types';

/**
 * Threat intelligence feed structure.
 */
interface ThreatFeed {
  id: string;
  name: string;
  status: boolean;
  lastUpdate: string;
  type: string;
  reliability: number;
}

/**
 * Service for handling threat feed API operations.
 *
 * Provides methods for managing threat intelligence feeds including creation,
 * configuration, synchronization, and monitoring. Supports various feed types
 * such as STIX, TAXII, CSV, and custom formats.
 *
 * Authentication: All endpoints require authentication via bearer token.
 *
 * @namespace feedService
 *
 * @example
 * ```typescript
 * import { feedService } from './services/feedService';
 *
 * // Get all feeds
 * const feeds = await feedService.getFeeds();
 *
 * // Refresh a specific feed
 * await feedService.refreshFeed('feed-123');
 * ```
 */
export const feedService = {
  /**
   * Retrieves all configured threat intelligence feeds.
   *
   * Returns a list of all threat feeds with their current status,
   * last update time, type, and reliability score.
   *
   * @async
   * @returns {Promise<ApiResponse<ThreatFeed[]>>} List of all threat feeds
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const response = await feedService.getFeeds();
   * response.data.forEach(feed => {
   *   console.log(`${feed.name}: ${feed.status ? 'Active' : 'Inactive'}`);
   *   console.log(`Reliability: ${feed.reliability}/10`);
   *   console.log(`Last updated: ${feed.lastUpdate}`);
   * });
   * ```
   */
  async getFeeds(): Promise<ApiResponse<ThreatFeed[]>> {
    return apiClient.get<ApiResponse<ThreatFeed[]>>('/threat-feeds');
  },

  /**
   * Retrieves a single threat feed by ID.
   *
   * Returns detailed information about a specific threat feed including
   * configuration, update schedule, and recent activity.
   *
   * @async
   * @param {string} id - The threat feed ID
   * @returns {Promise<ApiResponse<ThreatFeed>>} The threat feed details
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if feed doesn't exist
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const feed = await feedService.getFeed('feed-123');
   * console.log(feed.data.name); // "MISP Threat Feed"
   * console.log(feed.data.type); // "STIX 2.1"
   * ```
   */
  async getFeed(id: string): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.get<ApiResponse<ThreatFeed>>(`/threat-feeds/${id}`);
  },

  /**
   * Creates a new threat intelligence feed.
   *
   * Configures a new threat feed with specified name, type, and settings.
   * The feed will be inactive by default and must be enabled via toggleFeed().
   *
   * @async
   * @param {Partial<ThreatFeed>} data - Threat feed configuration (requires at least name and type)
   * @returns {Promise<ApiResponse<ThreatFeed>>} The created threat feed
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 400 Bad Request if validation fails (missing name/type)
   * @throws {Error} 403 Forbidden if user lacks create permissions
   * @throws {Error} 409 Conflict if feed with same name already exists
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const newFeed = await feedService.createFeed({
   *   name: "AlienVault OTX",
   *   type: "STIX 2.1",
   *   reliability: 8,
   *   status: false
   * });
   * console.log(`Created feed: ${newFeed.data.id}`);
   * ```
   */
  async createFeed(data: Partial<ThreatFeed>): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.post<ApiResponse<ThreatFeed>>('/threat-feeds', data);
  },

  /**
   * Updates an existing threat feed configuration.
   *
   * Performs a partial update of the feed settings. Only provided fields
   * will be updated. Use toggleFeed() to enable/disable the feed.
   *
   * @async
   * @param {string} id - The threat feed ID
   * @param {Partial<ThreatFeed>} data - Fields to update
   * @returns {Promise<ApiResponse<ThreatFeed>>} The updated threat feed
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if feed doesn't exist
   * @throws {Error} 400 Bad Request if validation fails
   * @throws {Error} 403 Forbidden if user lacks update permissions
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const updated = await feedService.updateFeed('feed-123', {
   *   reliability: 9,
   *   name: "AlienVault OTX (Premium)"
   * });
   * console.log(updated.data.reliability); // 9
   * ```
   */
  async updateFeed(id: string, data: Partial<ThreatFeed>): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.put<ApiResponse<ThreatFeed>>(`/threat-feeds/${id}`, data);
  },

  /**
   * Deletes a threat feed.
   *
   * Permanently removes the feed configuration. Historical data from this
   * feed may be preserved based on retention policies.
   *
   * @async
   * @param {string} id - The threat feed ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if feed doesn't exist
   * @throws {Error} 403 Forbidden if user lacks delete permissions
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * await feedService.deleteFeed('feed-123');
   * // Feed deleted successfully
   * ```
   */
  async deleteFeed(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-feeds/${id}`);
  },

  /**
   * Enables or disables a threat feed.
   *
   * Toggles the feed's active status. When disabled, the feed will not
   * fetch new data during scheduled updates.
   *
   * @async
   * @param {string} id - The threat feed ID
   * @param {boolean} enabled - True to enable, false to disable
   * @returns {Promise<ApiResponse<ThreatFeed>>} The updated threat feed
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if feed doesn't exist
   * @throws {Error} 403 Forbidden if user lacks update permissions
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * // Enable a feed
   * await feedService.toggleFeed('feed-123', true);
   * console.log('Feed enabled and will fetch updates');
   *
   * // Disable a feed
   * await feedService.toggleFeed('feed-123', false);
   * console.log('Feed disabled, no updates will be fetched');
   * ```
   */
  async toggleFeed(id: string, enabled: boolean): Promise<ApiResponse<ThreatFeed>> {
    return apiClient.patch<ApiResponse<ThreatFeed>>(`/threat-feeds/${id}/toggle`, { enabled });
  },

  /**
   * Manually triggers a feed refresh.
   *
   * Forces an immediate synchronization with the external threat feed source.
   * This operation may take several minutes depending on feed size.
   *
   * @async
   * @param {string} id - The threat feed ID
   * @returns {Promise<ApiResponse<unknown>>} Refresh operation status
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if feed doesn't exist
   * @throws {Error} 409 Conflict if feed is already refreshing
   * @throws {Error} 503 Service Unavailable if external feed source is unreachable
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * try {
   *   const result = await feedService.refreshFeed('feed-123');
   *   console.log('Feed refresh initiated');
   *   // Check feed status periodically to monitor completion
   * } catch (error) {
   *   if (error.response?.status === 409) {
   *     console.error('Feed is already being refreshed');
   *   }
   * }
   * ```
   */
  async refreshFeed(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(`/threat-feeds/${id}/refresh`);
  },

  /**
   * Retrieves statistics for a threat feed.
   *
   * Returns metrics including total indicators fetched, last update time,
   * error rate, and data quality metrics.
   *
   * @async
   * @param {string} id - The threat feed ID
   * @returns {Promise<ApiResponse<unknown>>} Feed statistics and metrics
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if feed doesn't exist
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const stats = await feedService.getFeedStats('feed-123');
   * console.log(`Total indicators: ${stats.data.totalIndicators}`);
   * console.log(`Last successful fetch: ${stats.data.lastSuccessfulFetch}`);
   * console.log(`Error rate: ${stats.data.errorRate}%`);
   * ```
   */
  async getFeedStats(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/threat-feeds/${id}/stats`);
  },
};
