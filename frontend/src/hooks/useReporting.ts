/**
 * @fileoverview Custom React hook for Reporting feature. Provides state management and operations for Reporting.
 * 
 * @module hooks/useReporting
 */

import { useState, useCallback } from 'react';
import { reportingService } from '@/services/reportingService';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Custom hook for reporting queries
 */
export function useReportingQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReports = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.getReports(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReport = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.getReport(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplates = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.getTemplates();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.getTemplate(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch template';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboards = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.getDashboards();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboards';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboard = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.getDashboard(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMetrics = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.getMetrics();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getReports,
    getReport,
    getTemplates,
    getTemplate,
    getDashboards,
    getDashboard,
    getMetrics,
    loading,
    error,
  };
}

/**
 * Custom hook for reporting mutations
 */
export function useReportingMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.generateReport(id);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await reportingService.deleteReport(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete report';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReport = useCallback(async (reportId: string, schedule: any): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.scheduleReport(reportId, schedule);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to schedule report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReport = useCallback(async (reportId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.downloadReport(reportId);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.createTemplate(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create template';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.updateTemplate(id, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update template';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await reportingService.deleteTemplate(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete template';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDashboard = useCallback(async (data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.createDashboard(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dashboard';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDashboard = useCallback(async (id: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportingService.updateDashboard(id, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dashboard';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDashboard = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await reportingService.deleteDashboard(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dashboard';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateReport,
    deleteReport,
    scheduleReport,
    downloadReport,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    loading,
    error,
  };
}

/**
 * Custom hook for composite reporting operations
 */
export function useReportingComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAndSchedule = useCallback(async (
    reportId: string,
    schedule: any
  ): Promise<{ report: ApiResponse<unknown> | null; scheduled: ApiResponse<unknown> | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await reportingService.generateReport(reportId);
      if (!report.data?.id) {
        throw new Error('Failed to generate report');
      }
      
      const scheduled = await reportingService.scheduleReport(report.data.id, schedule);
      
      return { report: report as any, scheduled: scheduled as any };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate and schedule report';
      setError(message);
      return { report: null, scheduled: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateAndSchedule,
    loading,
    error,
  };
}

/**
 * Main hook that combines all reporting operations
 */
export function useReporting() {
  const queries = useReportingQuery();
  const mutations = useReportingMutation();
  const composites = useReportingComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
