import { apiClient } from './api';
import type { Incident, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export const incidentService = {
  // Get all incidents with optional filters
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

  // Get single incident by ID
  async getIncident(id: string): Promise<ApiResponse<Incident>> {
    return apiClient.get<ApiResponse<Incident>>(`/incident-response/${id}`);
  },

  // Create incident
  async createIncident(data: Partial<Incident>): Promise<ApiResponse<Incident>> {
    return apiClient.post<ApiResponse<Incident>>('/incident-response', data);
  },

  // Update incident
  async updateIncident(id: string, data: Partial<Incident>): Promise<ApiResponse<Incident>> {
    return apiClient.put<ApiResponse<Incident>>(`/incident-response/${id}`, data);
  },

  // Delete incident
  async deleteIncident(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/incident-response/${id}`);
  },

  // Update incident status
  async updateStatus(id: string, status: string): Promise<ApiResponse<Incident>> {
    return apiClient.patch<ApiResponse<Incident>>(`/incident-response/${id}/status`, { status });
  },

  // Assign incident
  async assignIncident(id: string, assignedTo: string): Promise<ApiResponse<Incident>> {
    return apiClient.patch<ApiResponse<Incident>>(`/incident-response/${id}/assign`, { assignedTo });
  },

  // Add timeline event
  async addTimelineEvent(id: string, event: unknown): Promise<ApiResponse<Incident>> {
    return apiClient.post<ApiResponse<Incident>>(`/incident-response/${id}/timeline`, event);
  },

  // Add evidence
  async addEvidence(id: string, evidence: unknown): Promise<ApiResponse<Incident>> {
    return apiClient.post<ApiResponse<Incident>>(`/incident-response/${id}/evidence`, evidence);
  },
};
