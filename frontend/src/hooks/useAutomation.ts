/**
 * @fileoverview Custom React hook for Automation feature. Provides state management and operations for Automation.
 * 
 * @module hooks/useAutomation
 */

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
 * Custom hook for automation/playbook query operations.
 *
 * Provides read-only operations for retrieving playbook and execution data
 * from the automation backend service. Manages loading and error states
 * automatically for each operation.
 *
 * @returns {Object} Query operations and state
 * @returns {Function} returns.listPlaybooks - Fetch all playbooks
 * @returns {Function} returns.getPlaybook - Fetch single playbook by ID
 * @returns {Function} returns.listExecutions - Fetch all playbook executions
 * @returns {Function} returns.getExecution - Fetch single execution by ID
 * @returns {Function} returns.getLibrary - Fetch playbook library/templates
 * @returns {Function} returns.getAnalytics - Fetch automation analytics data
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {string | null} returns.error - Error message if operation failed
 *
 * @example
 * ```tsx
 * function PlaybookList() {
 *   const { listPlaybooks, loading, error } = useAutomationQuery();
 *
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       const playbooks = await listPlaybooks();
 *       console.log(playbooks);
 *     };
 *     fetchData();
 *   }, []);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   return <div>Playbooks loaded</div>;
 * }
 * ```
 */
export function useAutomationQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Retrieves all available playbooks from the automation service.
   *
   * @returns {Promise<Playbook[] | null>} Array of playbooks or null on error
   *
   * @example
   * ```tsx
   * const playbooks = await listPlaybooks();
   * if (playbooks) {
   *   console.log(`Found ${playbooks.length} playbooks`);
   * }
   * ```
   */
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

  /**
   * Retrieves a specific playbook by its unique identifier.
   *
   * @param {string} id - The unique identifier of the playbook
   * @returns {Promise<Playbook | null>} The playbook object or null on error
   *
   * @example
   * ```tsx
   * const playbook = await getPlaybook('playbook-123');
   * if (playbook) {
   *   console.log(`Playbook: ${playbook.name}, Status: ${playbook.status}`);
   * }
   * ```
   */
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

  /**
   * Retrieves all playbook execution records.
   *
   * Fetches the history of all playbook executions including their status,
   * timestamps, and associated playbook IDs.
   *
   * @returns {Promise<PlaybookExecution[] | null>} Array of executions or null on error
   *
   * @example
   * ```tsx
   * const executions = await listExecutions();
   * const runningCount = executions?.filter(e => e.status === 'running').length;
   * ```
   */
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

  /**
   * Retrieves a specific playbook execution by its unique identifier.
   *
   * @param {string} id - The unique identifier of the execution
   * @returns {Promise<PlaybookExecution | null>} The execution object or null on error
   *
   * @example
   * ```tsx
   * const execution = await getExecution('exec-456');
   * if (execution && execution.status === 'completed') {
   *   console.log('Execution finished successfully');
   * }
   * ```
   */
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

  /**
   * Retrieves available playbook templates from the library.
   *
   * Fetches pre-configured playbook templates that can be used as starting
   * points for creating new playbooks.
   *
   * @returns {Promise<Playbook[] | null>} Array of template playbooks or null on error
   *
   * @example
   * ```tsx
   * const templates = await getLibrary();
   * const incidentResponseTemplates = templates?.filter(t =>
   *   t.description.includes('incident response')
   * );
   * ```
   */
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

  /**
   * Retrieves automation analytics and metrics data.
   *
   * Fetches statistical data about playbook performance, execution success rates,
   * and other automation-related metrics.
   *
   * @returns {Promise<ApiResponse<unknown> | null>} Analytics data response or null on error
   *
   * @example
   * ```tsx
   * const analytics = await getAnalytics();
   * if (analytics?.success) {
   *   console.log('Analytics:', analytics.data);
   * }
   * ```
   */
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
 * Custom hook for automation/playbook mutation operations.
 *
 * Provides write operations for creating, updating, deleting, and executing
 * playbooks. Manages loading and error states automatically for each operation.
 *
 * @returns {Object} Mutation operations and state
 * @returns {Function} returns.createPlaybook - Create a new playbook
 * @returns {Function} returns.updatePlaybook - Update existing playbook
 * @returns {Function} returns.deletePlaybook - Delete a playbook
 * @returns {Function} returns.executePlaybook - Execute a playbook
 * @returns {Function} returns.cancelExecution - Cancel running execution
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {string | null} returns.error - Error message if operation failed
 *
 * @example
 * ```tsx
 * function CreatePlaybook() {
 *   const { createPlaybook, loading, error } = useAutomationMutation();
 *
 *   const handleCreate = async () => {
 *     const result = await createPlaybook({
 *       name: 'Incident Response',
 *       description: 'Automated incident response workflow',
 *       status: 'active'
 *     });
 *     if (result) {
 *       console.log('Playbook created:', result.id);
 *     }
 *   };
 *
 *   return <button onClick={handleCreate} disabled={loading}>Create</button>;
 * }
 * ```
 */
export function useAutomationMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a new playbook with the provided configuration.
   *
   * @param {Partial<Playbook>} data - Playbook configuration data
   * @param {string} data.name - Name of the playbook
   * @param {string} data.description - Description of what the playbook does
   * @param {'active' | 'inactive'} [data.status] - Initial status of the playbook
   * @returns {Promise<Playbook | null>} Created playbook or null on error
   *
   * @example
   * ```tsx
   * const newPlaybook = await createPlaybook({
   *   name: 'Malware Response',
   *   description: 'Automated malware containment and analysis',
   *   status: 'active'
   * });
   * ```
   */
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

  /**
   * Updates an existing playbook with new configuration data.
   *
   * @param {string} id - The unique identifier of the playbook to update
   * @param {Partial<Playbook>} data - Updated playbook data (partial update supported)
   * @returns {Promise<Playbook | null>} Updated playbook or null on error
   *
   * @example
   * ```tsx
   * const updated = await updatePlaybook('playbook-123', {
   *   status: 'inactive',
   *   description: 'Updated description'
   * });
   * ```
   */
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

  /**
   * Deletes a playbook permanently from the system.
   *
   * @param {string} id - The unique identifier of the playbook to delete
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   *
   * @example
   * ```tsx
   * const success = await deletePlaybook('playbook-123');
   * if (success) {
   *   console.log('Playbook deleted successfully');
   * }
   * ```
   */
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

  /**
   * Executes a playbook with optional context data.
   *
   * Initiates a new playbook execution. The execution runs asynchronously and
   * returns an execution record that can be monitored for completion status.
   *
   * @param {string} id - The unique identifier of the playbook to execute
   * @param {unknown} [context] - Optional context data to pass to the playbook
   * @returns {Promise<PlaybookExecution | null>} Execution record or null on error
   *
   * @example
   * ```tsx
   * const execution = await executePlaybook('playbook-123', {
   *   incidentId: 'inc-456',
   *   severity: 'high'
   * });
   * console.log(`Execution started: ${execution.id}, Status: ${execution.status}`);
   * ```
   */
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

  /**
   * Cancels a currently running playbook execution.
   *
   * Attempts to gracefully stop a playbook execution that is in progress.
   * May not be successful if the execution has already completed.
   *
   * @param {string} id - The unique identifier of the execution to cancel
   * @returns {Promise<boolean>} True if cancellation was successful, false otherwise
   *
   * @example
   * ```tsx
   * const cancelled = await cancelExecution('exec-789');
   * if (cancelled) {
   *   console.log('Execution cancelled successfully');
   * }
   * ```
   */
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
 * Custom hook for composite automation operations.
 *
 * Provides complex multi-step operations that combine multiple automation
 * actions into single convenient functions. Manages loading and error states
 * for the entire composite operation.
 *
 * @returns {Object} Composite operations and state
 * @returns {Function} returns.createAndExecute - Create playbook and execute it immediately
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {string | null} returns.error - Error message if operation failed
 *
 * @example
 * ```tsx
 * function QuickPlaybook() {
 *   const { createAndExecute, loading } = useAutomationComposite();
 *
 *   const handleQuickRun = async () => {
 *     const result = await createAndExecute(
 *       { name: 'Quick Response', description: 'Emergency response' },
 *       { incidentId: 'inc-123' }
 *     );
 *     if (result.playbook && result.execution) {
 *       console.log('Created and started execution');
 *     }
 *   };
 *
 *   return <button onClick={handleQuickRun} disabled={loading}>Quick Run</button>;
 * }
 * ```
 */
export function useAutomationComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a new playbook and immediately executes it.
   *
   * This is a convenience function for the common workflow of creating a
   * playbook and running it right away. If playbook creation fails, execution
   * is not attempted.
   *
   * @param {Partial<Playbook>} data - Playbook configuration data
   * @param {unknown} [context] - Optional execution context data
   * @returns {Promise<{playbook: Playbook | null; execution: PlaybookExecution | null}>} Object containing created playbook and execution
   *
   * @example
   * ```tsx
   * const { playbook, execution } = await createAndExecute(
   *   {
   *     name: 'Emergency Isolation',
   *     description: 'Isolate compromised host',
   *     status: 'active'
   *   },
   *   { hostId: 'host-456', reason: 'malware detected' }
   * );
   * ```
   */
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
 * Main hook that combines all automation operations.
 *
 * Provides a unified interface to all automation-related operations including
 * queries (read), mutations (write), and composite operations (multi-step).
 * This is the primary hook for most components working with automation features.
 *
 * @returns {Object} All automation operations organized by category
 * @returns {Object} returns.queries - Query operations (listPlaybooks, getPlaybook, etc.)
 * @returns {Object} returns.mutations - Mutation operations (createPlaybook, updatePlaybook, etc.)
 * @returns {Object} returns.composites - Composite operations (createAndExecute)
 *
 * @example
 * ```tsx
 * function AutomationDashboard() {
 *   const { queries, mutations, composites } = useAutomation();
 *   const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
 *
 *   useEffect(() => {
 *     const loadPlaybooks = async () => {
 *       const data = await queries.listPlaybooks();
 *       if (data) setPlaybooks(data);
 *     };
 *     loadPlaybooks();
 *   }, [queries]);
 *
 *   const handleExecute = async (id: string) => {
 *     const execution = await mutations.executePlaybook(id);
 *     if (execution) {
 *       console.log('Started execution:', execution.id);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {queries.loading && <div>Loading...</div>}
 *       {queries.error && <div>Error: {queries.error}</div>}
 *       {playbooks.map(p => (
 *         <div key={p.id}>
 *           {p.name}
 *           <button onClick={() => handleExecute(p.id)}>Execute</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
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
