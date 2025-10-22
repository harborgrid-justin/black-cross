import { useState, useCallback } from 'react';
import { darkWebService } from '@/services/darkWebService';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Custom hook for dark web monitoring queries
 */
export function useDarkWebQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFindings = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.getFindings(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch findings';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFinding = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.getFinding(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch finding';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCredentialLeaks = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.getCredentialLeaks(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch credential leaks';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBrandMentions = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.getBrandMentions(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch brand mentions';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getKeywords = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.getKeywords();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch keywords';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSources = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.getSources();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sources';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getFindings,
    getFinding,
    getCredentialLeaks,
    getBrandMentions,
    getKeywords,
    getSources,
    loading,
    error,
  };
}

/**
 * Custom hook for dark web monitoring mutations
 */
export function useDarkWebMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFindingStatus = useCallback(async (id: string, status: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.updateFindingStatus(id, status);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update finding status';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateLeak = useCallback(async (id: string, validated: boolean): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.validateLeak(id, validated);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate leak';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addKeyword = useCallback(async (keywordData: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.addKeyword(keywordData);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add keyword';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteKeyword = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await darkWebService.deleteKeyword(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete keyword';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const startScan = useCallback(async (options?: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.startScan(options);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start scan';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateFindingStatus,
    validateLeak,
    addKeyword,
    deleteKeyword,
    startScan,
    loading,
    error,
  };
}

/**
 * Custom hook for composite dark web monitoring operations
 */
export function useDarkWebComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanAndGetFindings = useCallback(async (
    options?: unknown,
    filters?: FilterOptions
  ): Promise<{ scan: ApiResponse<unknown> | null; findings: PaginatedResponse<unknown> | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      const scan = await darkWebService.startScan(options);
      // Wait a bit for scan to produce results
      await new Promise(resolve => setTimeout(resolve, 2000));
      const findings = await darkWebService.getFindings(filters);
      
      return { scan, findings };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to scan and get findings';
      setError(message);
      return { scan: null, findings: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scanAndGetFindings,
    loading,
    error,
  };
}

/**
 * Main hook that combines all dark web monitoring operations
 */
export function useDarkWeb() {
  const queries = useDarkWebQuery();
  const mutations = useDarkWebMutation();
  const composites = useDarkWebComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
