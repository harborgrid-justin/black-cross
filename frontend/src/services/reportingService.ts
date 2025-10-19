import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'executive' | 'technical' | 'compliance' | 'incident' | 'vulnerability' | 'threat';
  templateId?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'docx' | 'html' | 'csv' | 'json';
  schedule?: ReportSchedule;
  filters?: Record<string, unknown>;
  generatedBy: string;
  generatedAt?: string;
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  lastRun?: string;
  nextRun?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'technical' | 'compliance' | 'incident' | 'vulnerability' | 'threat';
  sections: ReportSection[];
  parameters: TemplateParameter[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'chart' | 'table' | 'metric' | 'list';
  content?: string;
  dataSource?: string;
  config?: Record<string, unknown>;
  order: number;
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'select' | 'multiselect';
  label: string;
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'gauge';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval?: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex';
  shared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  changePercent?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }>;
}

export interface TrendAnalysis {
  metric: string;
  period: string;
  data: Array<{ timestamp: string; value: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast?: Array<{ timestamp: string; value: number; confidence: number }>;
}

export const reportingService = {
  // Reports
  async getReports(filters?: FilterOptions): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<Report>>(
      `/reporting/reports?${params.toString()}`
    );
  },

  async getReport(id: string): Promise<ApiResponse<Report>> {
    return apiClient.get<ApiResponse<Report>>(`/reporting/reports/${id}`);
  },

  async createReport(data: Partial<Report>): Promise<ApiResponse<Report>> {
    return apiClient.post<ApiResponse<Report>>('/reporting/reports', data);
  },

  async updateReport(id: string, data: Partial<Report>): Promise<ApiResponse<Report>> {
    return apiClient.put<ApiResponse<Report>>(`/reporting/reports/${id}`, data);
  },

  async deleteReport(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/reporting/reports/${id}`);
  },

  async generateReport(id: string): Promise<ApiResponse<Report>> {
    return apiClient.post<ApiResponse<Report>>(`/reporting/reports/${id}/generate`);
  },

  async downloadReport(id: string): Promise<Blob> {
    return apiClient.get<Blob>(`/reporting/reports/${id}/download`);
  },

  // Templates
  async getTemplates(type?: string): Promise<ApiResponse<ReportTemplate[]>> {
    const url = type
      ? `/reporting/templates?type=${type}`
      : '/reporting/templates';
    return apiClient.get<ApiResponse<ReportTemplate[]>>(url);
  },

  async getTemplate(id: string): Promise<ApiResponse<ReportTemplate>> {
    return apiClient.get<ApiResponse<ReportTemplate>>(`/reporting/templates/${id}`);
  },

  async createTemplate(data: Partial<ReportTemplate>): Promise<ApiResponse<ReportTemplate>> {
    return apiClient.post<ApiResponse<ReportTemplate>>('/reporting/templates', data);
  },

  async updateTemplate(id: string, data: Partial<ReportTemplate>): Promise<ApiResponse<ReportTemplate>> {
    return apiClient.put<ApiResponse<ReportTemplate>>(`/reporting/templates/${id}`, data);
  },

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/reporting/templates/${id}`);
  },

  // Dashboards
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    return apiClient.get<ApiResponse<Dashboard[]>>('/reporting/dashboards');
  },

  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return apiClient.get<ApiResponse<Dashboard>>(`/reporting/dashboards/${id}`);
  },

  async createDashboard(data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    return apiClient.post<ApiResponse<Dashboard>>('/reporting/dashboards', data);
  },

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    return apiClient.put<ApiResponse<Dashboard>>(`/reporting/dashboards/${id}`, data);
  },

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/reporting/dashboards/${id}`);
  },

  // Metrics
  async getMetrics(category?: string): Promise<ApiResponse<Metric[]>> {
    const url = category
      ? `/reporting/metrics?category=${category}`
      : '/reporting/metrics';
    return apiClient.get<ApiResponse<Metric[]>>(url);
  },

  async getMetricData(metricName: string, timeRange: string): Promise<ApiResponse<ChartData>> {
    return apiClient.get<ApiResponse<ChartData>>(
      `/reporting/metrics/${metricName}/data?timeRange=${timeRange}`
    );
  },

  // Trends
  async getTrendAnalysis(
    metric: string,
    period: string,
    includeForecast?: boolean
  ): Promise<ApiResponse<TrendAnalysis>> {
    const params = new URLSearchParams({
      period,
      ...(includeForecast && { forecast: 'true' }),
    });
    return apiClient.get<ApiResponse<TrendAnalysis>>(
      `/reporting/trends/${metric}?${params.toString()}`
    );
  },

  // Charts
  async getChartData(
    chartType: string,
    dataSource: string,
    config?: Record<string, unknown>
  ): Promise<ApiResponse<ChartData>> {
    return apiClient.post<ApiResponse<ChartData>>('/reporting/charts', {
      chartType,
      dataSource,
      config,
    });
  },

  // Schedule
  async scheduleReport(reportId: string, schedule: ReportSchedule): Promise<ApiResponse<Report>> {
    return apiClient.post<ApiResponse<Report>>(
      `/reporting/reports/${reportId}/schedule`,
      schedule
    );
  },

  async updateSchedule(reportId: string, schedule: ReportSchedule): Promise<ApiResponse<Report>> {
    return apiClient.put<ApiResponse<Report>>(
      `/reporting/reports/${reportId}/schedule`,
      schedule
    );
  },

  async deleteSchedule(reportId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/reporting/reports/${reportId}/schedule`);
  },

  // Export
  async exportData(
    dataSource: string,
    format: 'csv' | 'json' | 'xlsx',
    filters?: Record<string, unknown>
  ): Promise<Blob> {
    return apiClient.post<Blob>('/reporting/export', {
      dataSource,
      format,
      filters,
    });
  },
};
