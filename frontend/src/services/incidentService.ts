/**
 * @fileoverview Incident Response API service.
 * 
 * Provides methods for managing security incidents including creation, updates,
 * status tracking, assignment, timeline management, and evidence collection.
 * 
 * @module services/incidentService
 */

import { apiClient } from './api';
import type { Incident, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Service for handling incident response API operations.
 * 
 * Provides comprehensive methods for incident lifecycle management from
 * creation through resolution, including timeline tracking and evidence management.
 * 
 * @namespace incidentService
 * @example
 * ```typescript
 * // Create a new incident
 * const incident = await incidentService.createIncident({
 *   title: 'Security breach detected',
 *   severity: 'high'
 * });
 * 
 * // Update incident status
 * await incidentService.updateStatus(incident.data.id, 'investigating');
 * ```
 */
export const incidentService = {
  /**
   * Retrieves all incidents with optional filtering and pagination.
   * 
   * @async
   * @param {FilterOptions} [filters] - Optional filter criteria
   * @returns {Promise<PaginatedResponse<Incident>>} Paginated list of incidents
   * @throws {Error} When the API request fails
   */
  async getIncidents(filters?: FilterOptions): Promise<PaginatedResponse<Incident>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<Incident>>(
      `/incident-response?${params.toString()}`
    );
  },

  /**
   * Retrieves a single incident by its unique identifier.
   * 
   * @async
   * @param {string} id - The incident ID
   * @returns {Promise<ApiResponse<Incident>>} The incident data
   * @throws {Error} When the incident is not found or request fails
   */
  async getIncident(id: string): Promise<ApiResponse<Incident>> {
    return apiClient.get<ApiResponse<Incident>>(`/incident-response/${id}`);
  },

  /**
   * Creates a new security incident.
   * 
   * @async
   * @param {Partial<Incident>} data - The incident data
   * @returns {Promise<ApiResponse<Incident>>} The created incident
   * @throws {Error} When incident creation fails
   */
  async createIncident(data: Partial<Incident>): Promise<ApiResponse<Incident>> {
    return apiClient.post<ApiResponse<Incident>>('/incident-response', data);
  },

  /**
   * Updates an existing incident.
   * 
   * @async
   * @param {string} id - The incident ID
   * @param {Partial<Incident>} data - Fields to update
   * @returns {Promise<ApiResponse<Incident>>} The updated incident
   * @throws {Error} When update fails
   */
  async updateIncident(id: string, data: Partial<Incident>): Promise<ApiResponse<Incident>> {
    return apiClient.put<ApiResponse<Incident>>(`/incident-response/${id}`, data);
  },

  /**
   * Deletes an incident permanently.
   * 
   * @async
   * @param {string} id - The incident ID
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} When deletion fails
   */
  async deleteIncident(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/incident-response/${id}`);
  },

  /**
   * Updates the status of an incident.
   * 
   * @async
   * @param {string} id - The incident ID
   * @param {string} status - New status (open, investigating, contained, resolved, closed)
   * @returns {Promise<ApiResponse<Incident>>} The updated incident
   * @throws {Error} When status update fails
   */
  async updateStatus(id: string, status: string): Promise<ApiResponse<Incident>> {
    return apiClient.patch<ApiResponse<Incident>>(`/incident-response/${id}/status`, { status });
  },

  /**
   * Assigns an incident to an analyst.
   * 
   * @async
   * @param {string} id - The incident ID
   * @param {string} assignedTo - User ID of the analyst
   * @returns {Promise<ApiResponse<Incident>>} The updated incident
   * @throws {Error} When assignment fails
   */
  async assignIncident(id: string, assignedTo: string): Promise<ApiResponse<Incident>> {
    return apiClient.patch<ApiResponse<Incident>>(`/incident-response/${id}/assign`, { assignedTo });
  },

  /**
   * Adds an event to the incident timeline.
   * 
   * @async
   * @param {string} id - The incident ID
   * @param {unknown} event - The timeline event data
   * @returns {Promise<ApiResponse<Incident>>} The updated incident
   * @throws {Error} When adding timeline event fails
   */
  async addTimelineEvent(id: string, event: unknown): Promise<ApiResponse<Incident>> {
    return apiClient.post<ApiResponse<Incident>>(`/incident-response/${id}/timeline`, event);
  },

  /**
   * Adds evidence to an incident.
   * 
   * @async
   * @param {string} id - The incident ID
   * @param {unknown} evidence - The evidence data
   * @returns {Promise<ApiResponse<Incident>>} The updated incident
   * @throws {Error} When adding evidence fails
   */
  async addEvidence(id: string, evidence: unknown): Promise<ApiResponse<Incident>> {
    return apiClient.post<ApiResponse<Incident>>(`/incident-response/${id}/evidence`, evidence);
  },
};
