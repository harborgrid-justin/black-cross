import { useState, useCallback } from 'react';
import { feedService } from '@/services/feedService';
import type { ApiResponse } from '@/types';

interface ThreatFeed {
  id: string;
  name: string;
  status: boolean;
  lastUpdate: string;
  type: string;
  reliability: number;
}

/**
 * Custom hook for threat feed queries
 */
export function useThreatFeedQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeeds = useCallback(async (): Promise<ThreatFeed[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.getFeeds();
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch threat feeds';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFeed = useCallback(async (id: string): Promise<ThreatFeed | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.getFeed(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch threat feed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFeedStats = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.getFeedStats(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch feed statistics';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getFeeds,
    getFeed,
    getFeedStats,
    loading,
    error,
  };
}

/**
 * Custom hook for threat feed mutations
 */
export function useThreatFeedMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFeed = useCallback(async (data: Partial<ThreatFeed>): Promise<ThreatFeed | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.createFeed(data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create threat feed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFeed = useCallback(async (id: string, data: Partial<ThreatFeed>): Promise<ThreatFeed | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.updateFeed(id, data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update threat feed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFeed = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await feedService.deleteFeed(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete threat feed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFeed = useCallback(async (id: string, enabled: boolean): Promise<ThreatFeed | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.toggleFeed(id, enabled);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle threat feed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshFeed = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.refreshFeed(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh threat feed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createFeed,
    updateFeed,
    deleteFeed,
    toggleFeed,
    refreshFeed,
    loading,
    error,
  };
}

/**
 * Custom hook for composite threat feed operations
 */
export function useThreatFeedComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAllFeeds = useCallback(async (feedIds: string[]): Promise<ApiResponse<unknown>[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.all(
        feedIds.map(id => feedService.refreshFeed(id))
      );
      
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh all feeds';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    refreshAllFeeds,
    loading,
    error,
  };
}

/**
 * Main hook that combines all threat feed operations
 */
export function useThreatFeeds() {
  const queries = useThreatFeedQuery();
  const mutations = useThreatFeedMutation();
  const composites = useThreatFeedComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
