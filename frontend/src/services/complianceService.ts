/**
 * @fileoverview Compliance Management API service.
 * 
 * Provides methods for compliance framework management, audits, and reporting.
 * 
 * @module services/complianceService
 */

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  totalControls: number;
  implementedControls: number;
  complianceScore: number;
  status: 'active' | 'draft' | 'archived';
  lastAssessment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  name: string;
  description: string;
  category: string;
  implemented: boolean;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-assessed';
  evidence: Evidence[];
  notes?: string;
  lastReviewed?: string;
}

export interface Evidence {
  id: string;
  type: string;
  description: string;
  fileUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ComplianceGap {
  controlId: string;
  controlName: string;
  framework: string;
  currentState: string;
  requiredState: string;
  gap: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
}

export interface ComplianceReport {
  id: string;
  frameworkId: string;
  frameworkName: string;
  reportDate: string;
  complianceScore: number;
  compliantControls: number;
  totalControls: number;
  gaps: ComplianceGap[];
  summary: string;
  generatedBy: string;
}

/**
 * Service for handling compliance API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace complianceService
 */
export const complianceService = {
  // Frameworks
  async getFrameworks(filters?: FilterOptions): Promise<PaginatedResponse<ComplianceFramework>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<ComplianceFramework>>(
      `/compliance/frameworks?${params.toString()}`
    );
  },

  async getFramework(id: string): Promise<ApiResponse<ComplianceFramework>> {
    return apiClient.get<ApiResponse<ComplianceFramework>>(`/compliance/frameworks/${id}`);
  },

  async createFramework(data: Partial<ComplianceFramework>): Promise<ApiResponse<ComplianceFramework>> {
    return apiClient.post<ApiResponse<ComplianceFramework>>('/compliance/frameworks', data);
  },

  async updateFramework(id: string, data: Partial<ComplianceFramework>): Promise<ApiResponse<ComplianceFramework>> {
    return apiClient.put<ApiResponse<ComplianceFramework>>(`/compliance/frameworks/${id}`, data);
  },

  async deleteFramework(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/compliance/frameworks/${id}`);
  },

  // Controls
  async getControls(frameworkId: string, filters?: FilterOptions): Promise<PaginatedResponse<ComplianceControl>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<ComplianceControl>>(
      `/compliance/frameworks/${frameworkId}/controls?${params.toString()}`
    );
  },

  async updateControl(frameworkId: string, controlId: string, data: Partial<ComplianceControl>): Promise<ApiResponse<ComplianceControl>> {
    return apiClient.put<ApiResponse<ComplianceControl>>(
      `/compliance/frameworks/${frameworkId}/controls/${controlId}`,
      data
    );
  },

  // Gap Analysis
  async analyzeGaps(frameworkId: string): Promise<ApiResponse<ComplianceGap[]>> {
    return apiClient.post<ApiResponse<ComplianceGap[]>>(
      `/compliance/frameworks/${frameworkId}/analyze-gaps`
    );
  },

  async getGaps(frameworkId: string): Promise<ApiResponse<ComplianceGap[]>> {
    return apiClient.get<ApiResponse<ComplianceGap[]>>(
      `/compliance/frameworks/${frameworkId}/gaps`
    );
  },

  // Audit Logs
  async getAuditLogs(filters?: FilterOptions): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<AuditLog>>(
      `/compliance/audit-logs?${params.toString()}`
    );
  },

  // Reports
  async generateReport(frameworkId: string): Promise<ApiResponse<ComplianceReport>> {
    return apiClient.post<ApiResponse<ComplianceReport>>(
      `/compliance/frameworks/${frameworkId}/reports`
    );
  },

  async getReports(frameworkId?: string): Promise<PaginatedResponse<ComplianceReport>> {
    const url = frameworkId 
      ? `/compliance/frameworks/${frameworkId}/reports`
      : '/compliance/reports';
    return apiClient.get<PaginatedResponse<ComplianceReport>>(url);
  },

  async exportReport(reportId: string, format: 'pdf' | 'docx' | 'csv'): Promise<ApiResponse<Blob>> {
    return apiClient.get<ApiResponse<Blob>>(
      `/compliance/reports/${reportId}/export?format=${format}`
    );
  },

  // Evidence Management
  async uploadEvidence(
    frameworkId: string,
    controlId: string,
    file: File,
    description: string
  ): Promise<ApiResponse<Evidence>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    return apiClient.post<ApiResponse<Evidence>>(
      `/compliance/frameworks/${frameworkId}/controls/${controlId}/evidence`,
      formData
    );
  },

  async deleteEvidence(
    frameworkId: string,
    controlId: string,
    evidenceId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/compliance/frameworks/${frameworkId}/controls/${controlId}/evidence/${evidenceId}`
    );
  },
};
