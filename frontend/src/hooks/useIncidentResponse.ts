/**
 * @fileoverview Custom React hook for IncidentResponse feature. Provides state management and operations for IncidentResponse.
 * 
 * @module hooks/useIncidentResponse
 */

import { useState, useCallback } from 'react';
import { incidentService } from '@/services/incidentService';
import type { Incident, FilterOptions, PaginatedResponse } from '@/types';

/**
 * Custom hook for incident response queries
 */
export function useIncidentQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIncidents = useCallback(async (filters?: FilterOptions): Promise<PaginatedResponse<Incident> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.getIncidents(filters);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch incidents';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getIncident = useCallback(async (id: string): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.getIncident(id);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch incident';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getIncidents,
    getIncident,
    loading,
    error,
  };
}

/**
 * Custom hook for incident response mutations
 */
export function useIncidentMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIncident = useCallback(async (data: Partial<Incident>): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.createIncident(data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create incident';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncident = useCallback(async (id: string, data: Partial<Incident>): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.updateIncident(id, data);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update incident';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIncident = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await incidentService.deleteIncident(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete incident';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.updateStatus(id, status);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update incident status';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignIncident = useCallback(async (id: string, assignedTo: string): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.assignIncident(id, assignedTo);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign incident';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTimelineEvent = useCallback(async (id: string, event: unknown): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.addTimelineEvent(id, event);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add timeline event';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvidence = useCallback(async (id: string, evidence: unknown): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentService.addEvidence(id, evidence);
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add evidence';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createIncident,
    updateIncident,
    deleteIncident,
    updateStatus,
    assignIncident,
    addTimelineEvent,
    addEvidence,
    loading,
    error,
  };
}

/**
 * Custom hook for composite incident response operations
 */
export function useIncidentComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAndAssign = useCallback(async (
    data: Partial<Incident>,
    assignedTo: string
  ): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create incident
      const createResponse = await incidentService.createIncident(data);
      if (!createResponse.data?.id) {
        throw new Error('Failed to create incident');
      }
      
      // Assign incident
      const assignResponse = await incidentService.assignIncident(createResponse.data.id, assignedTo);
      return assignResponse.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create and assign incident';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveIncident = useCallback(async (
    id: string,
    resolutionNotes: string
  ): Promise<Incident | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Add resolution notes as timeline event
      await incidentService.addTimelineEvent(id, {
        event: 'Incident Resolved',
        details: resolutionNotes,
      });
      
      // Update status to resolved
      const response = await incidentService.updateStatus(id, 'resolved');
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve incident';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createAndAssign,
    resolveIncident,
    loading,
    error,
  };
}

/**
 * Main hook that combines all incident response operations
 */
export function useIncidentResponse() {
  const queries = useIncidentQuery();
  const mutations = useIncidentMutation();
  const composites = useIncidentComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
