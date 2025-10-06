import { apiClient } from './api';
import type { IoC, ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export const iocService = {
  // Get all IoCs with optional filters
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
      `/ioc-management?${params.toString()}`
    );
  },

  // Get single IoC by ID
  async getIoC(id: string): Promise<ApiResponse<IoC>> {
    return apiClient.get<ApiResponse<IoC>>(`/ioc-management/${id}`);
  },

  // Create IoC
  async createIoC(data: Partial<IoC>): Promise<ApiResponse<IoC>> {
    return apiClient.post<ApiResponse<IoC>>('/ioc-management', data);
  },

  // Update IoC
  async updateIoC(id: string, data: Partial<IoC>): Promise<ApiResponse<IoC>> {
    return apiClient.put<ApiResponse<IoC>>(`/ioc-management/${id}`, data);
  },

  // Delete IoC
  async deleteIoC(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/ioc-management/${id}`);
  },

  // Bulk import IoCs
  async bulkImport(iocs: Partial<IoC>[]): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/ioc-management/bulk', { iocs });
  },

  // Export IoCs
  async exportIoCs(format: 'json' | 'csv' | 'stix'): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/ioc-management/export?format=${format}`);
  },

  // Check IoC against threat feeds
  async checkIoC(value: string, type: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/ioc-management/check', { value, type });
  },
};
