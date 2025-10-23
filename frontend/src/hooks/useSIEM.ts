/**
 * @fileoverview Custom React hook for SIEM feature. Provides state management and operations for SIEM.
 * 
 * @module hooks/useSIEM
 */

import { useState, useCallback } from 'react';
import { siemService } from '@/services/siemService';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Custom hook for SIEM queries
 */
export function useSIEMQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLogs = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.getLogs(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch logs';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAlerts = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.getAlerts(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alerts';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAlert = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.getAlert(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alert';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRules = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.getRules(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rules';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRule = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.getRule(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rule';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCorrelationRules = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.getCorrelationRules();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch correlation rules';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getLogs,
    getAlerts,
    getAlert,
    getRules,
    getRule,
    getCorrelationRules,
    loading,
    error,
  };
}

/**
 * Custom hook for SIEM mutations
 */
export function useSIEMMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAlert = useCallback(async (id: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.updateAlert(id, data as any);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update alert';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.acknowledgeAlert(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to acknowledge alert';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (id: string, resolution: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.resolveAlert(id, resolution);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve alert';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = useCallback(async (ruleData: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.createRule(ruleData);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create rule';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRule = useCallback(async (id: string, ruleData: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.updateRule(id, ruleData);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update rule';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRule = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await siemService.deleteRule(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete rule';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRule = useCallback(async (id: string, enabled: boolean): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.toggleRule(id, enabled);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle rule';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCorrelationRule = useCallback(async (ruleData: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.createCorrelationRule(ruleData);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create correlation rule';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateAlert,
    acknowledgeAlert,
    resolveAlert,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    createCorrelationRule,
    loading,
    error,
  };
}

/**
 * Custom hook for composite SIEM operations
 */
export function useSIEMComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLogs = useCallback(async (query: string, filters?: FilterOptions): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.searchLogs(query, filters);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search logs';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCorrelation = useCallback(async (correlationId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await siemService.getCorrelation(correlationId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get correlation';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const investigateAlert = useCallback(async (alertId: string): Promise<{
    alert: ApiResponse<unknown> | null;
    relatedLogs: PaginatedResponse<unknown> | null;
  }> => {
    try {
      setLoading(true);
      setError(null);
      
      const [alert, relatedLogs] = await Promise.all([
        siemService.getAlert(alertId),
        siemService.getLogs(),
      ]);
      
      return { alert, relatedLogs };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to investigate alert';
      setError(message);
      return { alert: null, relatedLogs: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchLogs,
    getCorrelation,
    investigateAlert,
    loading,
    error,
  };
}

/**
 * Main hook that combines all SIEM operations
 */
export function useSIEM() {
  const queries = useSIEMQuery();
  const mutations = useSIEMMutation();
  const composites = useSIEMComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
