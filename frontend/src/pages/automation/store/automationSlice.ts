/**
 * @fileoverview Redux slice for Automation module state management.
 *
 * Manages automation playbook state including loading, error handling, and
 * async operations for fetching and executing playbooks. Provides actions
 * and reducers for the automation module's data flow.
 *
 * **State Structure:**
 * - playbooks: Array of playbook objects
 * - selectedPlaybook: Currently selected/viewed playbook
 * - loading: Async operation status
 * - error: Error message string
 *
 * **Async Thunks:**
 * - fetchPlaybooks: Retrieves all playbooks from backend
 * - executePlaybook: Triggers playbook execution by ID
 *
 * **Actions:**
 * - clearSelectedPlaybook: Resets selected playbook to null
 * - clearError: Clears error state
 *
 * @module pages/automation/store/automationSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playbookService } from '@/services/playbookService';

/**
 * Playbook interface representing an automation playbook entity.
 *
 * @interface Playbook
 */
interface Playbook {
  /** Unique identifier for the playbook */
  id: string;
  /** Human-readable playbook name */
  name: string;
  /** Detailed description of playbook purpose and actions */
  description: string;
  /** Current status determining if playbook can be executed */
  status: 'active' | 'inactive';
  /** Total number of times this playbook has been executed */
  executions: number;
  /** ISO timestamp of the last execution */
  lastRun: string;
  /** ISO timestamp of playbook creation */
  createdAt: string;
  /** ISO timestamp of last modification */
  updatedAt: string;
}

/**
 * AutomationState interface defining the shape of automation Redux state.
 *
 * @interface AutomationState
 */
interface AutomationState {
  /** Array of all playbooks loaded from the backend */
  playbooks: Playbook[];
  /** Currently selected playbook for detail view (null if none selected) */
  selectedPlaybook: Playbook | null;
  /** Loading status for async operations */
  loading: boolean;
  /** Error message from failed operations (null if no error) */
  error: string | null;
}

/**
 * Initial state for the automation slice.
 *
 * @const {AutomationState}
 */
const initialState: AutomationState = {
  playbooks: [],
  selectedPlaybook: null,
  loading: false,
  error: null,
};

/**
 * Async thunk for fetching all playbooks from the backend.
 *
 * Calls the playbook service to retrieve the complete list of automation
 * playbooks. Updates Redux state with playbooks data on success.
 *
 * @async
 * @function fetchPlaybooks
 * @returns {Promise<Playbook[]>} Array of playbook objects
 * @throws {Error} When API call fails or returns unsuccessful response
 *
 * @example
 * ```tsx
 * const dispatch = useAppDispatch();
 * await dispatch(fetchPlaybooks());
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
 * Async thunk for executing a specific playbook.
 *
 * Triggers playbook execution via the backend service. The playbook must be
 * in 'active' status to execute successfully. Updates execution count and
 * last run timestamp after successful execution.
 *
 * @async
 * @function executePlaybook
 * @param {string} playbookId - The unique identifier of the playbook to execute
 * @returns {Promise<unknown>} Execution result data from backend
 * @throws {Error} When execution fails or playbook is inactive
 *
 * @example
 * ```tsx
 * const dispatch = useAppDispatch();
 * await dispatch(executePlaybook('playbook-123'));
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
 * Automation Redux slice configuration.
 *
 * Defines the slice name, initial state, synchronous reducers, and async
 * thunk handlers for the automation module.
 *
 * **Synchronous Actions:**
 * - clearSelectedPlaybook: Resets selectedPlaybook to null
 * - clearError: Clears error message
 *
 * **Async Action Handlers:**
 * - fetchPlaybooks.pending: Sets loading true
 * - fetchPlaybooks.fulfilled: Updates playbooks array
 * - fetchPlaybooks.rejected: Sets error message
 * - executePlaybook.pending: Sets loading true
 * - executePlaybook.fulfilled: Clears loading
 * - executePlaybook.rejected: Sets error message
 *
 * @const {Slice}
 */
const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    /**
     * Clears the currently selected playbook.
     *
     * Resets selectedPlaybook to null, typically used when navigating
     * away from playbook detail view.
     *
     * @param {AutomationState} state - Current state
     */
    clearSelectedPlaybook: (state) => {
      state.selectedPlaybook = null;
    },
    /**
     * Clears the error state.
     *
     * Resets error message to null, typically used after displaying
     * error to user or retrying failed operation.
     *
     * @param {AutomationState} state - Current state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
