/**
 * @fileoverview Redux slice for SIEM module state management.
 *
 * Manages state for Security Information and Event Management including:
 * - Security event logs from multiple sources
 * - Correlated security alerts with status tracking
 * - Event statistics and monitoring metrics
 * - Async operations for fetching logs and alerts from API
 *
 * Uses Redux Toolkit with createAsyncThunk for async operations and
 * createSlice for reducer logic with Immer-powered immutable updates.
 *
 * @module pages/siem/store/siemSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { siemService } from '@/services/siemService';

/**
 * Represents a security log entry from monitoring sources.
 *
 * @interface LogEntry
 * @property {string} id - Unique log identifier
 * @property {string} timestamp - ISO timestamp of the event
 * @property {string} source - Source system (firewall, web-server, etc.)
 * @property {string} severity - Event severity level
 * @property {string} event - Event classification
 * @property {string} message - Detailed event message
 */
interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  severity: string;
  event: string;
  message: string;
}

/**
 * Represents a correlated security alert with full metadata.
 *
 * @interface SecurityAlert
 * @property {string} id - Unique alert identifier
 * @property {string} title - Alert title/summary
 * @property {string} description - Detailed alert description
 * @property {'critical'|'high'|'medium'|'low'} severity - Alert severity level
 * @property {'active'|'investigating'|'resolved'|'false-positive'} status - Current alert status
 * @property {string} ruleId - ID of the correlation rule that triggered this alert
 * @property {string} ruleName - Name of the correlation rule
 * @property {string[]} events - Array of event IDs included in this alert
 * @property {number} correlatedEvents - Count of correlated events
 * @property {number} confidence - Alert confidence score (0-100)
 * @property {string} [assignedTo] - User ID of assigned analyst
 * @property {string} triggeredAt - ISO timestamp when alert triggered
 * @property {string} [acknowledgedAt] - ISO timestamp when acknowledged
 * @property {string} [resolvedAt] - ISO timestamp when resolved
 * @property {string} createdAt - ISO timestamp of creation
 */
interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'false-positive';
  ruleId: string;
  ruleName: string;
  events: string[];
  correlatedEvents: number;
  confidence: number;
  assignedTo?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

/**
 * Redux state structure for the SIEM module.
 *
 * @interface SIEMState
 * @property {LogEntry[]} logs - Array of security log entries
 * @property {SecurityAlert[]} alerts - Array of correlated security alerts
 * @property {boolean} loading - Loading state for async operations
 * @property {string|null} error - Error message if operation failed
 * @property {Object} stats - SIEM statistics
 * @property {number} stats.totalEvents - Total event count
 * @property {number} stats.criticalAlerts - Critical alert count
 * @property {number} stats.activeThreats - Active threat count
 */
interface SIEMState {
  logs: LogEntry[];
  alerts: SecurityAlert[];
  loading: boolean;
  error: string | null;
  stats: {
    totalEvents: number;
    criticalAlerts: number;
    activeThreats: number;
  };
}

const initialState: SIEMState = {
  logs: [],
  alerts: [],
  loading: false,
  error: null,
  stats: {
    totalEvents: 0,
    criticalAlerts: 0,
    activeThreats: 0,
  },
};

/**
 * Async thunk to fetch security event logs from the API.
 *
 * Retrieves log entries from monitored security sources with optional filtering.
 * Supports search filtering for event content. Updates Redux store with logs
 * or sets an error state on failure.
 *
 * @async
 * @function fetchSIEMLogs
 * @param {Object} [filters] - Optional filter parameters
 * @param {string} [filters.search] - Search term to filter logs
 * @returns {Promise<LogEntry[]>} Promise resolving to array of log entries
 * @throws {Error} When API call fails or returns unsuccessful response
 *
 * @example
 * ```ts
 * // Fetch all logs
 * dispatch(fetchSIEMLogs());
 *
 * // Fetch logs with search filter
 * dispatch(fetchSIEMLogs({ search: 'firewall' }));
 * ```
 */
export const fetchSIEMLogs = createAsyncThunk(
  'siem/fetchLogs',
  async (filters?: { search?: string }) => {
    const response = await siemService.getLogs(filters);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch SIEM logs');
  }
);

/**
 * Async thunk to fetch correlated security alerts from the API.
 *
 * Retrieves security alerts generated from event correlation rules.
 * Updates Redux store with alerts or sets an error state on failure.
 *
 * @async
 * @function fetchSIEMAlerts
 * @returns {Promise<SecurityAlert[]>} Promise resolving to array of security alerts
 * @throws {Error} When API call fails or returns unsuccessful response
 *
 * @example
 * ```ts
 * // In a component
 * const dispatch = useDispatch();
 * dispatch(fetchSIEMAlerts());
 * ```
 */
export const fetchSIEMAlerts = createAsyncThunk(
  'siem/fetchAlerts',
  async () => {
    const response = await siemService.getAlerts();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch SIEM alerts');
  }
);

/**
 * Redux slice for SIEM module.
 *
 * Manages state and actions for security logs, alerts, and statistics.
 * Includes synchronous reducers for error handling and stats updates,
 * and extraReducers for async thunk handling.
 *
 * Reducers:
 * - `clearError`: Clears any error messages
 * - `updateStats`: Updates SIEM statistics
 *
 * Extra Reducers (Async):
 * - Handles pending, fulfilled, and rejected states for fetchSIEMLogs
 * - Handles fulfilled state for fetchSIEMAlerts
 *
 * @constant
 * @type {Slice}
 */
const siemSlice = createSlice({
  name: 'siem',
  initialState,
  reducers: {
    /**
     * Clears any error message from state.
     *
     * @param {SIEMState} state - Current state
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * Updates SIEM statistics.
     *
     * @param {SIEMState} state - Current state
     * @param {PayloadAction<Object>} action - Action with stats payload
     */
    updateStats: (state, action) => {
      state.stats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSIEMLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSIEMLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchSIEMLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch SIEM logs';
      })
      .addCase(fetchSIEMAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      });
  },
});

/**
 * Action creators generated from the slice.
 * @type {Object}
 */
export const { clearError, updateStats } = siemSlice.actions;

/**
 * Reducer function for the SIEM module.
 * @type {Reducer<SIEMState>}
 */
export default siemSlice.reducer;
