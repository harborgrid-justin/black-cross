/**
 * @fileoverview Threat Actor API service.
 *
 * Provides methods for managing threat actor profiles, campaigns, and TTPs (Tactics, Techniques, and Procedures).
 * Supports CRUD operations and specialized queries for threat actor intelligence.
 *
 * Authentication: All methods require a valid bearer token.
 *
 * @module services/actorService
 */

import { apiClient } from './api';
import type { ThreatActor, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Service for handling threat actor API operations.
 *
 * Provides methods for CRUD operations and specialized functionality for threat actor intelligence.
 * All methods return promises and handle errors appropriately via the underlying apiClient.
 *
 * Authentication: All endpoints require authentication via bearer token.
 *
 * @namespace actorService
 *
 * @example
 * ```typescript
 * import { actorService } from './services/actorService';
 *
 * // Get all threat actors
 * const actors = await actorService.getActors({ page: 1, limit: 10 });
 *
 * // Get specific actor
 * const actor = await actorService.getActor('actor-123');
 * console.log(actor.data.name); // "APT28"
 * ```
 */
export const actorService = {
  /**
   * Retrieves all threat actors with optional filtering and pagination.
   *
   * Supports filtering by various criteria including name, country, motivation, and sophistication level.
   * Results are paginated and can be sorted.
   *
   * @async
   * @param {FilterOptions} [filters] - Optional filters and pagination parameters
   * @param {number} [filters.page] - Page number for pagination
   * @param {number} [filters.limit] - Number of items per page
   * @param {string} [filters.sortBy] - Field to sort by
   * @param {string} [filters.sortOrder] - Sort order (asc/desc)
   * @returns {Promise<PaginatedResponse<ThreatActor>>} Paginated list of threat actors
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 403 Forbidden if user lacks read permissions
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * // Get first page with 20 items
   * const response = await actorService.getActors({ page: 1, limit: 20 });
   * console.log(response.data); // Array of ThreatActor objects
   * console.log(response.pagination); // { total, page, limit, pages }
   *
   * // Filter by specific criteria
   * const filtered = await actorService.getActors({
   *   country: 'Russia',
   *   sophistication: 'high'
   * });
   * ```
   */
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

  /**
   * Retrieves a single threat actor by ID.
   *
   * Returns complete threat actor profile including aliases, known campaigns,
   * TTPs, targeted industries, and attribution information.
   *
   * @async
   * @param {string} id - The threat actor ID
   * @returns {Promise<ApiResponse<ThreatActor>>} The threat actor details
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if threat actor doesn't exist
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const actor = await actorService.getActor('actor-123');
   * console.log(actor.data.name); // "APT28"
   * console.log(actor.data.aliases); // ["Fancy Bear", "Sofacy"]
   * console.log(actor.data.country); // "Russia"
   * ```
   */
  async getActor(id: string): Promise<ApiResponse<ThreatActor>> {
    return apiClient.get<ApiResponse<ThreatActor>>(`/threat-actors/${id}`);
  },

  /**
   * Creates a new threat actor profile.
   *
   * Requires at minimum a name for the threat actor. Additional fields like
   * aliases, country, motivation, and sophistication can be provided.
   *
   * @async
   * @param {Partial<ThreatActor>} data - Threat actor data (requires at least name)
   * @returns {Promise<ApiResponse<ThreatActor>>} The created threat actor
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 400 Bad Request if validation fails (e.g., missing required fields)
   * @throws {Error} 403 Forbidden if user lacks create permissions
   * @throws {Error} 409 Conflict if threat actor with same name already exists
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const newActor = await actorService.createActor({
   *   name: "APT99",
   *   aliases: ["Advanced Threat"],
   *   country: "Unknown",
   *   motivation: "Espionage",
   *   sophistication: "high",
   *   description: "Newly identified threat actor targeting financial sector"
   * });
   * console.log(newActor.data.id); // "actor-456"
   * ```
   */
  async createActor(data: Partial<ThreatActor>): Promise<ApiResponse<ThreatActor>> {
    return apiClient.post<ApiResponse<ThreatActor>>('/threat-actors', data);
  },

  /**
   * Updates an existing threat actor profile.
   *
   * Performs a partial update of the threat actor. Only provided fields will be updated.
   * Useful for adding new campaigns, TTPs, or updating attribution information.
   *
   * @async
   * @param {string} id - The threat actor ID
   * @param {Partial<ThreatActor>} data - Fields to update
   * @returns {Promise<ApiResponse<ThreatActor>>} The updated threat actor
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if threat actor doesn't exist
   * @throws {Error} 400 Bad Request if validation fails
   * @throws {Error} 403 Forbidden if user lacks update permissions
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const updated = await actorService.updateActor('actor-123', {
   *   sophistication: 'very_high',
   *   description: 'Updated with new intelligence findings'
   * });
   * console.log(updated.data.sophistication); // "very_high"
   * ```
   */
  async updateActor(id: string, data: Partial<ThreatActor>): Promise<ApiResponse<ThreatActor>> {
    return apiClient.put<ApiResponse<ThreatActor>>(`/threat-actors/${id}`, data);
  },

  /**
   * Deletes a threat actor profile.
   *
   * Permanently removes the threat actor and associated metadata.
   * Warning: This action cannot be undone.
   *
   * @async
   * @param {string} id - The threat actor ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if threat actor doesn't exist
   * @throws {Error} 403 Forbidden if user lacks delete permissions
   * @throws {Error} 409 Conflict if actor is referenced by other entities
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * await actorService.deleteActor('actor-123');
   * // Threat actor deleted successfully
   * ```
   */
  async deleteActor(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/threat-actors/${id}`);
  },

  /**
   * Retrieves all campaigns associated with a threat actor.
   *
   * Returns a list of campaigns attributed to this threat actor, including
   * campaign names, timeframes, targets, and objectives.
   *
   * @async
   * @param {string} id - The threat actor ID
   * @returns {Promise<ApiResponse<unknown>>} List of campaigns
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if threat actor doesn't exist
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const campaigns = await actorService.getActorCampaigns('actor-123');
   * console.log(campaigns.data); // Array of campaign objects
   * ```
   */
  async getActorCampaigns(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/threat-actors/${id}/campaigns`);
  },

  /**
   * Retrieves TTPs (Tactics, Techniques, and Procedures) for a threat actor.
   *
   * Returns MITRE ATT&CK framework mappings showing the tactics, techniques,
   * and procedures commonly used by this threat actor.
   *
   * @async
   * @param {string} id - The threat actor ID
   * @returns {Promise<ApiResponse<unknown>>} TTPs mapped to MITRE ATT&CK framework
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired
   * @throws {Error} 404 Not Found if threat actor doesn't exist
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const ttps = await actorService.getActorTTPs('actor-123');
   * console.log(ttps.data); // Array of MITRE ATT&CK technique IDs and descriptions
   * // Example: [{ id: "T1566", name: "Phishing", tactic: "Initial Access" }]
   * ```
   */
  async getActorTTPs(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/threat-actors/${id}/ttps`);
  },
};
