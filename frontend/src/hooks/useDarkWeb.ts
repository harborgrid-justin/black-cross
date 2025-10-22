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

  const updateFinding = useCallback(async (id: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.updateFinding(id, data as any);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update finding';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCredential = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.validateCredential(id);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate credential';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createKeyword = useCallback(async (keywordData: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await darkWebService.createKeyword(keywordData as any);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create keyword';
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

  const deleteFinding = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await darkWebService.deleteFinding(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete finding';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateFinding,
    validateCredential,
    createKeyword,
    deleteKeyword,
    deleteFinding,
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

  const refreshFindings = useCallback(async (
    filters?: FilterOptions
  ): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const findings = await darkWebService.getFindings(filters);
      return findings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh findings';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    refreshFindings,
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
