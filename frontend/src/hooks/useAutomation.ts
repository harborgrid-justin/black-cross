import { useState, useCallback } from 'react';
import { playbookService } from '@/services/playbookService';
import type { ApiResponse } from '@/types';

interface Playbook {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  executions: number;
  lastRun: string;
  createdAt: string;
  updatedAt: string;
}

interface PlaybookExecution {
  id: string;
  playbookId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
}

/**
 * Custom hook for automation/playbook queries
 */
export function useAutomationQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listPlaybooks = useCallback(async (): Promise<Playbook[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.listPlaybooks();
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playbooks';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlaybook = useCallback(async (id: string): Promise<Playbook | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.getPlaybook(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playbook';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listExecutions = useCallback(async (): Promise<PlaybookExecution[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.listExecutions();
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch executions';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getExecution = useCallback(async (id: string): Promise<PlaybookExecution | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.getExecution(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch execution';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLibrary = useCallback(async (): Promise<Playbook[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.getLibrary();
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch library';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.getAnalytics();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    listPlaybooks,
    getPlaybook,
    listExecutions,
    getExecution,
    getLibrary,
    getAnalytics,
    loading,
    error,
  };
}

/**
 * Custom hook for automation/playbook mutations
 */
export function useAutomationMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlaybook = useCallback(async (data: Partial<Playbook>): Promise<Playbook | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.createPlaybook(data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create playbook';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlaybook = useCallback(async (id: string, data: Partial<Playbook>): Promise<Playbook | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.updatePlaybook(id, data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update playbook';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlaybook = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await playbookService.deletePlaybook(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete playbook';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const executePlaybook = useCallback(async (id: string, context?: unknown): Promise<PlaybookExecution | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.executePlaybook(id, context);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute playbook';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelExecution = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await playbookService.cancelExecution(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel execution';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    executePlaybook,
    cancelExecution,
    loading,
    error,
  };
}

/**
 * Custom hook for composite automation operations
 */
export function useAutomationComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAndExecute = useCallback(async (
    data: Partial<Playbook>,
    context?: unknown
  ): Promise<{ playbook: Playbook | null; execution: PlaybookExecution | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      const playbookResponse = await playbookService.createPlaybook(data);
      if (!playbookResponse.data?.id) {
        throw new Error('Failed to create playbook');
      }
      
      const executionResponse = await playbookService.executePlaybook(playbookResponse.data.id, context);
      
      return {
        playbook: playbookResponse.data,
        execution: executionResponse.data || null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create and execute playbook';
      setError(message);
      return { playbook: null, execution: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createAndExecute,
    loading,
    error,
  };
}

/**
 * Main hook that combines all automation operations
 */
export function useAutomation() {
  const queries = useAutomationQuery();
  const mutations = useAutomationMutation();
  const composites = useAutomationComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
