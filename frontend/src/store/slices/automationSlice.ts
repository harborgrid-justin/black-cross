/**
 * @fileoverview Redux slice for managing security automation state.
 *
 * Handles state management for security playbooks, automated response workflows,
 * and orchestration tasks. Supports playbook creation, execution, and monitoring.
 *
 * @module store/slices/automationSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playbookService } from '@/services/playbookService';

/**
 * Playbook definition for security automation.
 *
 * @interface Playbook
 * @property {string} id - Unique identifier
 * @property {string} name - Playbook name
 * @property {string} description - Detailed description
 * @property {'active' | 'inactive'} status - Current status
 * @property {number} executions - Total number of executions
 * @property {string} lastRun - ISO timestamp of last execution
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 */
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

/**
 * State shape for automation management.
 *
 * @interface AutomationState
 * @property {Playbook[]} playbooks - Array of all security playbooks
 * @property {Playbook | null} selectedPlaybook - Currently selected playbook
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string | null} error - Error message from failed operations
 */
interface AutomationState {
  playbooks: Playbook[];
  selectedPlaybook: Playbook | null;
  loading: boolean;
  error: string | null;
}

const initialState: AutomationState = {
  playbooks: [],
  selectedPlaybook: null,
  loading: false,
  error: null,
};

/**
 * Async thunk for fetching all security playbooks.
 *
 * Retrieves the list of available security playbooks including their
 * execution history and current status.
 *
 * @async
 * @returns {Promise<Playbook[]>} Array of playbooks
 * @throws {Error} When the fetch operation fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchPlaybooks } from '@/store/slices/automationSlice';
 *
 * function PlaybookList() {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     dispatch(fetchPlaybooks());
 *   }, [dispatch]);
 * }
 * ```
 */
export const fetchPlaybooks = createAsyncThunk(
  'automation/fetchPlaybooks',
  async () => {
    const response = await playbookService.listPlaybooks();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch playbooks');
  }
);

/**
 * Async thunk for executing a security playbook.
 *
 * Triggers execution of an automated security workflow. The playbook
 * runs asynchronously and its status can be monitored through the API.
 *
 * @async
 * @param {string} playbookId - ID of the playbook to execute
 * @returns {Promise<any>} Execution result data
 * @throws {Error} When execution fails
 *
 * @example
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { executePlaybook } from '@/store/slices/automationSlice';
 *
 * function ExecuteButton({ playbookId }: { playbookId: string }) {
 *   const dispatch = useAppDispatch();
 *
 *   const handleExecute = async () => {
 *     try {
 *       await dispatch(executePlaybook(playbookId)).unwrap();
 *       alert('Playbook executed successfully');
 *     } catch (error) {
 *       console.error('Execution failed:', error);
 *     }
 *   };
 *
 *   return <button onClick={handleExecute}>Execute</button>;
 * }
 * ```
 */
export const executePlaybook = createAsyncThunk(
  'automation/executePlaybook',
  async (playbookId: string) => {
    const response = await playbookService.executePlaybook(playbookId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to execute playbook');
  }
);

/**
 * Automation slice containing reducers and actions for playbook state management.
 *
 * Manages security automation workflows including playbook listing and execution.
 */
const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    /**
     * Clears the currently selected playbook.
     *
     * @param {AutomationState} state - Current automation state
     */
    clearSelectedPlaybook: (state) => {
      state.selectedPlaybook = null;
    },
    /**
     * Clears any error messages from the state.
     *
     * @param {AutomationState} state - Current automation state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch playbooks lifecycle
      .addCase(fetchPlaybooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaybooks.fulfilled, (state, action) => {
        state.loading = false;
        state.playbooks = action.payload;
      })
      .addCase(fetchPlaybooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch playbooks';
      })
      // Execute playbook lifecycle
      .addCase(executePlaybook.pending, (state) => {
        state.loading = true;
      })
      .addCase(executePlaybook.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(executePlaybook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to execute playbook';
      });
  },
});

export const { clearSelectedPlaybook, clearError } = automationSlice.actions;
export default automationSlice.reducer;
