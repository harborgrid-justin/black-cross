import { useState, useCallback } from 'react';
import { complianceService } from '@/services/complianceService';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Custom hook for compliance management queries
 */
export function useComplianceQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFrameworks = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.getFrameworks(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch frameworks';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFramework = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.getFramework(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch framework';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getControls = useCallback(async (frameworkId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.getControls(frameworkId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch controls';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGaps = useCallback(async (frameworkId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.getGaps(frameworkId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch gaps';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAuditLogs = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.getAuditLogs(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReports = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.getReports(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getFrameworks,
    getFramework,
    getControls,
    getGaps,
    getAuditLogs,
    getReports,
    loading,
    error,
  };
}

/**
 * Custom hook for compliance management mutations
 */
export function useComplianceMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateControl = useCallback(async (id: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.updateControl(id, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update control';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvidence = useCallback(async (controlId: string, evidence: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.addEvidence(controlId, evidence);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add evidence';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (frameworkId: string, options?: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.generateReport(frameworkId, options);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateControl,
    addEvidence,
    generateReport,
    loading,
    error,
  };
}

/**
 * Custom hook for composite compliance operations
 */
export function useComplianceComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessFramework = useCallback(async (frameworkId: string): Promise<{
    framework: ApiResponse<unknown> | null;
    controls: ApiResponse<unknown> | null;
    gaps: ApiResponse<unknown> | null;
  }> => {
    try {
      setLoading(true);
      setError(null);
      
      const [framework, controls, gaps] = await Promise.all([
        complianceService.getFramework(frameworkId),
        complianceService.getControls(frameworkId),
        complianceService.getGaps(frameworkId),
      ]);
      
      return { framework, controls, gaps };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assess framework';
      setError(message);
      return { framework: null, controls: null, gaps: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assessFramework,
    loading,
    error,
  };
}

/**
 * Main hook that combines all compliance operations
 */
export function useCompliance() {
  const queries = useComplianceQuery();
  const mutations = useComplianceMutation();
  const composites = useComplianceComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
