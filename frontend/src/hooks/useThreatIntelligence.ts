import { useState, useCallback } from 'react';
import { threatService } from '@/services/threatService';
import type { Threat, FilterOptions, ApiResponse, PaginatedResponse } from '@/types';

/**
 * Custom hook for threat intelligence queries
 */
export function useThreatQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getThreats = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<Threat> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.getThreats(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch threats';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getThreat = useCallback(async (id: string): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.getThreat(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEnrichedThreat = useCallback(async (id: string): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.getEnrichedThreat(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch enriched threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getThreats,
    getThreat,
    getEnrichedThreat,
    loading,
    error,
  };
}

/**
 * Custom hook for threat intelligence mutations
 */
export function useThreatMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectThreat = useCallback(async (data: Partial<Threat>): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.collectThreat(data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to collect threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const categorizeThreat = useCallback(async (id: string, categories: string[]): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.categorizeThreat(id, categories);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to categorize threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveThreat = useCallback(async (id: string): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.archiveThreat(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const enrichThreat = useCallback(async (id: string): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.enrichThreat(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enrich threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateThreat = useCallback(async (id: string, data: Partial<Threat>): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.updateThreat(id, data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteThreat = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await threatService.deleteThreat(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete threat';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    collectThreat,
    categorizeThreat,
    archiveThreat,
    enrichThreat,
    updateThreat,
    deleteThreat,
    loading,
    error,
  };
}

/**
 * Custom hook for composite threat intelligence operations
 */
export function useThreatComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const correlateThreats = useCallback(async (threatIds: string[]): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.correlateThreats({ threatIds });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to correlate threats';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeThreat = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await threatService.analyzeThreat(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const collectAndEnrich = useCallback(async (data: Partial<Threat>): Promise<Threat | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // First collect the threat
      const collectResponse = await threatService.collectThreat(data);
      if (!collectResponse.data?.id) {
        throw new Error('Failed to collect threat');
      }
      
      // Then enrich it
      const enrichResponse = await threatService.enrichThreat(collectResponse.data.id);
      return enrichResponse.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to collect and enrich threat';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    correlateThreats,
    analyzeThreat,
    collectAndEnrich,
    loading,
    error,
  };
}

/**
 * Main hook that combines all threat intelligence operations
 */
export function useThreatIntelligence() {
  const queries = useThreatQuery();
  const mutations = useThreatMutation();
  const composites = useThreatComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
