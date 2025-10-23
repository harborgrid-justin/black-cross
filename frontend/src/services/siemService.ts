/**
 * @fileoverview SIEM (Security Information and Event Management) API service.
 * 
 * Provides methods for event management, alerting, and security monitoring.
 * 
 * @module services/siemService
 */

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  sourceType: 'firewall' | 'ids' | 'web-server' | 'auth' | 'endpoint' | 'network' | 'application';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  event: string;
  eventType: string;
  message: string;
  rawLog?: string;
  normalized: Record<string, unknown>;
  tags: string[];
  correlationId?: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'false-positive';
  ruleId: string;
  ruleName: string;
  events: string[];
  correlatedEvents: number;
  confidence: number;
  assignedTo?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  ruleType: 'threshold' | 'correlation' | 'anomaly' | 'pattern';
  conditions: RuleCondition[];
  actions: RuleAction[];
  tags: string[];
  mitreTactics?: string[];
  mitreTechniques?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[];
  timeWindow?: number;
  threshold?: number;
}

export interface RuleAction {
  type: 'alert' | 'notify' | 'block' | 'log';
  config: Record<string, unknown>;
}

export interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  eventTypes: string[];
  timeWindow: number;
  threshold: number;
  conditions: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EventCorrelation {
  id: string;
  ruleId: string;
  ruleName: string;
  events: LogEntry[];
  confidence: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface ForensicQuery {
  id: string;
  name?: string;
  query: string;
  timeRange: {
    start: string;
    end: string;
  };
  filters?: Record<string, unknown>;
  savedBy?: string;
  createdAt?: string;
}

export interface ForensicResult {
  query: string;
  totalHits: number;
  results: LogEntry[];
  aggregations?: Record<string, unknown>;
  executionTime: number;
}

export interface SIEMStatistics {
  totalEvents: number;
  eventsToday: number;
  activeAlerts: number;
  criticalAlerts: number;
  activeRules: number;
  topSources: Array<{ source: string; count: number }>;
  topEventTypes: Array<{ eventType: string; count: number }>;
  severityDistribution: Record<string, number>;
  alertTrend: Array<{ timestamp: string; count: number }>;
}

/**
 * Service for handling siem API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace siemService
 */
export const siemService = {
  // Log Management
  async getLogs(filters?: FilterOptions): Promise<PaginatedResponse<LogEntry>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<LogEntry>>(
      `/siem/logs?${params.toString()}`
    );
  },

  async getLog(id: string): Promise<ApiResponse<LogEntry>> {
    return apiClient.get<ApiResponse<LogEntry>>(`/siem/logs/${id}`);
  },

  async searchLogs(query: string, filters?: FilterOptions): Promise<ApiResponse<LogEntry[]>> {
    return apiClient.post<ApiResponse<LogEntry[]>>('/siem/logs/search', {
      query,
      filters,
    });
  },

  // Alerts
  async getAlerts(filters?: FilterOptions): Promise<PaginatedResponse<SecurityAlert>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<SecurityAlert>>(
      `/siem/alerts?${params.toString()}`
    );
  },

  async getAlert(id: string): Promise<ApiResponse<SecurityAlert>> {
    return apiClient.get<ApiResponse<SecurityAlert>>(`/siem/alerts/${id}`);
  },

  async updateAlert(id: string, data: Partial<SecurityAlert>): Promise<ApiResponse<SecurityAlert>> {
    return apiClient.put<ApiResponse<SecurityAlert>>(`/siem/alerts/${id}`, data);
  },

  async acknowledgeAlert(id: string): Promise<ApiResponse<SecurityAlert>> {
    return apiClient.post<ApiResponse<SecurityAlert>>(`/siem/alerts/${id}/acknowledge`);
  },

  async resolveAlert(id: string, resolution: string): Promise<ApiResponse<SecurityAlert>> {
    return apiClient.post<ApiResponse<SecurityAlert>>(`/siem/alerts/${id}/resolve`, {
      resolution,
    });
  },

  async tuneAlert(id: string, tuning: Record<string, unknown>): Promise<ApiResponse<SecurityAlert>> {
    return apiClient.post<ApiResponse<SecurityAlert>>(`/siem/alerts/${id}/tune`, tuning);
  },

  // Detection Rules
  async getRules(filters?: FilterOptions): Promise<PaginatedResponse<DetectionRule>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<DetectionRule>>(
      `/siem/rules?${params.toString()}`
    );
  },

  async getRule(id: string): Promise<ApiResponse<DetectionRule>> {
    return apiClient.get<ApiResponse<DetectionRule>>(`/siem/rules/${id}`);
  },

  async createRule(data: Partial<DetectionRule>): Promise<ApiResponse<DetectionRule>> {
    return apiClient.post<ApiResponse<DetectionRule>>('/siem/rules', data);
  },

  async updateRule(id: string, data: Partial<DetectionRule>): Promise<ApiResponse<DetectionRule>> {
    return apiClient.put<ApiResponse<DetectionRule>>(`/siem/rules/${id}`, data);
  },

  async deleteRule(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/siem/rules/${id}`);
  },

  async toggleRule(id: string, enabled: boolean): Promise<ApiResponse<DetectionRule>> {
    return apiClient.put<ApiResponse<DetectionRule>>(`/siem/rules/${id}/toggle`, {
      enabled,
    });
  },

  async testRule(ruleId: string, testData?: Record<string, unknown>): Promise<ApiResponse<{
    matched: boolean;
    events: LogEntry[];
    message: string;
  }>> {
    return apiClient.post<ApiResponse<{
      matched: boolean;
      events: LogEntry[];
      message: string;
    }>>(`/siem/rules/${ruleId}/test`, testData);
  },

  // Event Correlation
  async getCorrelations(filters?: FilterOptions): Promise<PaginatedResponse<EventCorrelation>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<EventCorrelation>>(
      `/siem/correlations?${params.toString()}`
    );
  },

  async getCorrelation(id: string): Promise<ApiResponse<EventCorrelation>> {
    return apiClient.get<ApiResponse<EventCorrelation>>(`/siem/correlations/${id}`);
  },

  async getCorrelationRules(): Promise<ApiResponse<CorrelationRule[]>> {
    return apiClient.get<ApiResponse<CorrelationRule[]>>('/siem/correlation-rules');
  },

  async createCorrelationRule(data: Partial<CorrelationRule>): Promise<ApiResponse<CorrelationRule>> {
    return apiClient.post<ApiResponse<CorrelationRule>>('/siem/correlation-rules', data);
  },

  // Forensics
  async executeForensicQuery(query: ForensicQuery): Promise<ApiResponse<ForensicResult>> {
    return apiClient.post<ApiResponse<ForensicResult>>('/siem/forensics/query', query);
  },

  async getSavedQueries(): Promise<ApiResponse<ForensicQuery[]>> {
    return apiClient.get<ApiResponse<ForensicQuery[]>>('/siem/forensics/queries');
  },

  async saveQuery(query: ForensicQuery): Promise<ApiResponse<ForensicQuery>> {
    return apiClient.post<ApiResponse<ForensicQuery>>('/siem/forensics/queries', query);
  },

  async deleteQuery(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/siem/forensics/queries/${id}`);
  },

  // Statistics & Dashboard
  async getStatistics(timeRange?: string): Promise<ApiResponse<SIEMStatistics>> {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return apiClient.get<ApiResponse<SIEMStatistics>>(`/siem/statistics${params}`);
  },

  async getEventTimeline(
    timeRange: { start: string; end: string },
    interval: string
  ): Promise<ApiResponse<Array<{ timestamp: string; count: number; severity: Record<string, number> }>>> {
    return apiClient.post<ApiResponse<Array<{ timestamp: string; count: number; severity: Record<string, number> }>>>(
      '/siem/timeline',
      { timeRange, interval }
    );
  },

  // Export
  async exportLogs(filters: FilterOptions, format: 'csv' | 'json'): Promise<Blob> {
    return apiClient.post<Blob>('/siem/logs/export', { filters, format });
  },

  async exportAlerts(filters: FilterOptions, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    return apiClient.post<Blob>('/siem/alerts/export', { filters, format });
  },
};
