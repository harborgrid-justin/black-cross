import { useState, useCallback } from 'react';
import { collaborationService } from '@/services/collaborationService';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

/**
 * Custom hook for collaboration queries
 */
export function useCollaborationQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWorkspaces = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.getWorkspaces(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspaces';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkspace = useCallback(async (id: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.getWorkspace(id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspace';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasks = useCallback(async (workspaceId: string, filters?: FilterOptions): Promise<PaginatedResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.getTasks(workspaceId, filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTask = useCallback(async (workspaceId: string, taskId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.getTask(workspaceId, taskId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch task';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWikiPages = useCallback(async (workspaceId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.getWikiPages(workspaceId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch wiki pages';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWikiPage = useCallback(async (workspaceId: string, pageId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.getWikiPage(workspaceId, pageId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch wiki page';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getWorkspaces,
    getWorkspace,
    getTasks,
    getTask,
    getWikiPages,
    getWikiPage,
    loading,
    error,
  };
}

/**
 * Custom hook for collaboration mutations
 */
export function useCollaborationMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkspace = useCallback(async (data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.createWorkspace(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workspace';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkspace = useCallback(async (id: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.updateWorkspace(id, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update workspace';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWorkspace = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await collaborationService.deleteWorkspace(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete workspace';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (workspaceId: string, userId: string, role: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.addMember(workspaceId, userId, role);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add member';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (workspaceId: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await collaborationService.removeMember(workspaceId, userId);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove member';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (workspaceId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.createTask(workspaceId, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (workspaceId: string, taskId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.updateTask(workspaceId, taskId, data as any);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (workspaceId: string, taskId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await collaborationService.deleteTask(workspaceId, taskId);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (workspaceId: string, taskId: string, content: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.addComment(workspaceId, taskId, content);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add comment';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWikiPage = useCallback(async (workspaceId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.createWikiPage(workspaceId, data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create wiki page';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWikiPage = useCallback(async (workspaceId: string, pageId: string, data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await collaborationService.updateWikiPage(workspaceId, pageId, data as any);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update wiki page';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    removeMember,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    createWikiPage,
    updateWikiPage,
    loading,
    error,
  };
}

/**
 * Custom hook for composite collaboration operations
 */
export function useCollaborationComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkspaceWithMembers = useCallback(async (
    workspaceData: unknown,
    members: Array<{ userId: string; role: string }>
  ): Promise<{ workspace: ApiResponse<unknown> | null; addedMembers: ApiResponse<unknown>[] }> => {
    try {
      setLoading(true);
      setError(null);
      
      const workspace = await collaborationService.createWorkspace(workspaceData as any);
      if (!workspace.data?.id) {
        throw new Error('Failed to create workspace');
      }
      
      const addedMembers = await Promise.all(
        members.map(member => collaborationService.addMember(workspace.data.id, member.userId, member.role))
      );
      
      return { workspace, addedMembers };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workspace with members';
      setError(message);
      return { workspace: null, addedMembers: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createWorkspaceWithMembers,
    loading,
    error,
  };
}

/**
 * Main hook that combines all collaboration operations
 */
export function useCollaboration() {
  const queries = useCollaborationQuery();
  const mutations = useCollaborationMutation();
  const composites = useCollaborationComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
