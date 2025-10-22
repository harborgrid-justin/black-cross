import { useState, useCallback } from 'react';
import { iocService } from '@/services/iocService';
import type { IoC, FilterOptions, PaginatedResponse, ApiResponse } from '@/types';

/**
 * Custom hook for IoC management queries
 */
export function useIoCQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIoCs = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<IoC> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await iocService.getIoCs(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch IoCs';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getIoC = useCallback(async (id: string): Promise<IoC | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await iocService.getIoC(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch IoC';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getIoCs,
    getIoC,
    loading,
    error,
  };
}

/**
 * Custom hook for IoC management mutations
 */
export function useIoCMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIoC = useCallback(async (data: Partial<IoC>): Promise<IoC | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await iocService.createIoC(data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create IoC';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIoC = useCallback(async (id: string, data: Partial<IoC>): Promise<IoC | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await iocService.updateIoC(id, data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update IoC';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIoC = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await iocService.deleteIoC(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete IoC';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkImport = useCallback(async (iocs: Partial<IoC>[]): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await iocService.bulkImport(iocs);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bulk import IoCs';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportIoCs = useCallback(async (format: 'json' | 'csv' | 'stix'): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await iocService.exportIoCs(format);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export IoCs';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createIoC,
    updateIoC,
    deleteIoC,
    bulkImport,
    exportIoCs,
    loading,
    error,
  };
}

/**
 * Custom hook for composite IoC management operations
 */
export function useIoCComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIoC = useCallback(async (value: string, type: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await iocService.checkIoC(value, type);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check IoC';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const importAndCheck = useCallback(async (iocs: Partial<IoC>[]): Promise<{
    imported: ApiResponse<unknown> | null;
    checks: (ApiResponse<unknown> | null)[];
  }> => {
    try {
      setLoading(true);
      setError(null);
      
      // First import IoCs
      const imported = await iocService.bulkImport(iocs);
      
      // Then check each IoC against threat feeds
      const checks = await Promise.all(
        iocs.map(ioc => 
          ioc.value && ioc.type 
            ? iocService.checkIoC(ioc.value, ioc.type)
            : Promise.resolve(null)
        )
      );
      
      return { imported, checks };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import and check IoCs';
      setError(message);
      return { imported: null, checks: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkIoC,
    importAndCheck,
    loading,
    error,
  };
}

/**
 * Main hook that combines all IoC management operations
 */
export function useIoCManagement() {
  const queries = useIoCQuery();
  const mutations = useIoCMutation();
  const composites = useIoCComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
