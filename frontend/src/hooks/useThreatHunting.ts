import { useState, useCallback } from 'react';
import { huntingService } from '@/services/huntingService';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Custom hook for threat hunting queries
 */
export function useThreatHuntingQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHypotheses = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.getHypotheses(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch hypotheses';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHypothesis = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.getHypothesis(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch hypothesis';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQueries = useCallback(async (hypothesisId?: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.getQueries(hypothesisId);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch queries';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQuery = useCallback(async (hypothesisId: string, queryId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.getQuery(hypothesisId, queryId);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch query';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFindings = useCallback(async (hypothesisId?: string, filters?: FilterOptions): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.getFindings(hypothesisId, filters);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch findings';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFinding = useCallback(async (hypothesisId: string, findingId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.getFinding(hypothesisId, findingId);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch finding';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getHypotheses,
    getHypothesis,
    getQueries,
    getQuery,
    getFindings,
    getFinding,
    loading,
    error,
  };
}

/**
 * Custom hook for threat hunting mutations
 */
export function useThreatHuntingMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createHypothesis = useCallback(async (data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.createHypothesis(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create hypothesis';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHypothesis = useCallback(async (id: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.updateHypothesis(id, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update hypothesis';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHypothesis = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await huntingService.deleteHypothesis(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete hypothesis';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuery = useCallback(async (hypothesisId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.createQuery(hypothesisId, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create query';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuery = useCallback(async (hypothesisId: string, queryId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.updateQuery(hypothesisId, queryId, data as any);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update query';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuery = useCallback(async (hypothesisId: string, queryId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await huntingService.deleteQuery(hypothesisId, queryId);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete query';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeQuery = useCallback(async (hypothesisId: string, queryId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.executeQuery(hypothesisId, queryId);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute query';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFinding = useCallback(async (hypothesisId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.createFinding(hypothesisId, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create finding';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFinding = useCallback(async (hypothesisId: string, findingId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await huntingService.updateFinding(hypothesisId, findingId, data as any);
      return response as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update finding';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFinding = useCallback(async (hypothesisId: string, findingId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await huntingService.deleteFinding(hypothesisId, findingId);
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
    createHypothesis,
    updateHypothesis,
    deleteHypothesis,
    createQuery,
    updateQuery,
    deleteQuery,
    executeQuery,
    createFinding,
    updateFinding,
    deleteFinding,
    loading,
    error,
  };
}

/**
 * Custom hook for composite threat hunting operations
 */
export function useThreatHuntingComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createHypothesisWithQueries = useCallback(async (
    hypothesisData: unknown,
    queries: unknown[]
  ): Promise<{ hypothesis: ApiResponse<unknown> | null; createdQueries: ApiResponse<unknown>[] }> => {
    try {
      setLoading(true);
      setError(null);
      
      const hypothesis = await huntingService.createHypothesis(hypothesisData);
      if (!hypothesis.data?.id) {
        throw new Error('Failed to create hypothesis');
      }
      
      const createdQueries = await Promise.all(
        queries.map(query => huntingService.createQuery(hypothesis.data.id, query))
      );
      
      return { hypothesis, createdQueries };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create hypothesis with queries';
      setError(message);
      return { hypothesis: null, createdQueries: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const executeAndAnalyze = useCallback(async (hypothesisId: string, queryId: string): Promise<{
    execution: ApiResponse<unknown> | null;
    query: ApiResponse<unknown> | null;
  }> => {
    try {
      setLoading(true);
      setError(null);
      
      const execution = await huntingService.executeQuery(hypothesisId, queryId);
      const query = await huntingService.getQuery(hypothesisId, queryId);
      
      return { execution: execution as any, query: query as any };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute and analyze query';
      setError(message);
      return { execution: null, query: null };
    } finally {
      setLoading(false);
    }
  }, []);

  const getHypothesisDetails = useCallback(async (id: string): Promise<{
    hypothesis: ApiResponse<unknown> | null;
    queries: ApiResponse<unknown> | null;
    findings: ApiResponse<unknown> | null;
  }> => {
    try {
      setLoading(true);
      setError(null);
      
      const [hypothesis, queries, findings] = await Promise.all([
        huntingService.getHypothesis(id),
        huntingService.getQueries(id),
        huntingService.getFindings(id),
      ]);
      
      return { hypothesis: hypothesis as any, queries: queries as any, findings: findings as any };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get hypothesis details';
      setError(message);
      return { hypothesis: null, queries: null, findings: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createHypothesisWithQueries,
    executeAndAnalyze,
    getHypothesisDetails,
    loading,
    error,
  };
}

/**
 * Main hook that combines all threat hunting operations
 */
export function useThreatHunting() {
  const queries = useThreatHuntingQuery();
  const mutations = useThreatHuntingMutation();
  const composites = useThreatHuntingComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
