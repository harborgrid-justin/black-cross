import { useState, useCallback } from 'react';
import { actorService } from '@/services/actorService';
import type { ThreatActor, FilterOptions, PaginatedResponse, ApiResponse } from '@/types';

/**
 * Custom hook for threat actor queries
 */
export function useThreatActorQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActors = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<ThreatActor> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await actorService.getActors(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch threat actors';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActor = useCallback(async (id: string): Promise<ThreatActor | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await actorService.getActor(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch threat actor';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActorCampaigns = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await actorService.getActorCampaigns(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch actor campaigns';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActorTTPs = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await actorService.getActorTTPs(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch actor TTPs';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getActors,
    getActor,
    getActorCampaigns,
    getActorTTPs,
    loading,
    error,
  };
}

/**
 * Custom hook for threat actor mutations
 */
export function useThreatActorMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createActor = useCallback(async (data: Partial<ThreatActor>): Promise<ThreatActor | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await actorService.createActor(data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create threat actor';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActor = useCallback(async (id: string, data: Partial<ThreatActor>): Promise<ThreatActor | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await actorService.updateActor(id, data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update threat actor';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteActor = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await actorService.deleteActor(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete threat actor';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createActor,
    updateActor,
    deleteActor,
    loading,
    error,
  };
}

/**
 * Custom hook for composite threat actor operations
 */
export function useThreatActorComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActorProfile = useCallback(async (id: string): Promise<{
    actor: ThreatActor | null;
    campaigns: ApiResponse<unknown> | null;
    ttps: ApiResponse<unknown> | null;
  }> => {
    try {
      setLoading(true);
      setError(null);
      
      const [actorResponse, campaignsResponse, ttpsResponse] = await Promise.all([
        actorService.getActor(id),
        actorService.getActorCampaigns(id),
        actorService.getActorTTPs(id),
      ]);
      
      return {
        actor: actorResponse.data || null,
        campaigns: campaignsResponse,
        ttps: ttpsResponse,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch actor profile';
      setError(message);
      return { actor: null, campaigns: null, ttps: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getActorProfile,
    loading,
    error,
  };
}

/**
 * Main hook that combines all threat actor operations
 */
export function useThreatActors() {
  const queries = useThreatActorQuery();
  const mutations = useThreatActorMutation();
  const composites = useThreatActorComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
