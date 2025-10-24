/**
 * @fileoverview Redux slice for Reporting module state management.
 *
 * Manages state for security reports, including:
 * - Reports list with CRUD operations
 * - Report generation and status tracking
 * - Performance metrics and KPIs
 * - Async operations for fetching reports and metrics from API
 *
 * Uses Redux Toolkit with createAsyncThunk for async operations and
 * createSlice for reducer logic with Immer-powered immutable updates.
 *
 * @module pages/reporting/store/reportingSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportingService } from '@/services/reportingService';

/**
 * Represents a security report with generation metadata.
 *
 * @interface Report
 * @property {string} id - Unique report identifier
 * @property {string} title - Report title
 * @property {string} description - Report description
 * @property {'executive'|'technical'|'compliance'|'incident'|'vulnerability'|'threat'} type - Report classification
 * @property {'draft'|'generating'|'completed'|'failed'} status - Current report status
 * @property {'pdf'|'docx'|'html'|'csv'|'json'} format - Output format
 * @property {string} generatedBy - User ID who generated the report
 * @property {string} [generatedAt] - ISO timestamp when report was generated
 * @property {string} createdAt - ISO timestamp when report was created
 * @property {string} updatedAt - ISO timestamp of last update
 */
interface Report {
  id: string;
  title: string;
  description: string;
  type: 'executive' | 'technical' | 'compliance' | 'incident' | 'vulnerability' | 'threat';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'docx' | 'html' | 'csv' | 'json';
  generatedBy: string;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a performance metric with trend information.
 *
 * @interface Metric
 * @property {string} name - Metric name (e.g., "Mean Time to Detect")
 * @property {number} value - Current metric value
 * @property {string} [unit] - Unit of measurement (e.g., "hours", "percent")
 * @property {'up'|'down'|'stable'} [trend] - Trend direction
 * @property {number} [change] - Percentage change from previous period
 */
interface Metric {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

/**
 * Redux state structure for the Reporting module.
 *
 * @interface ReportingState
 * @property {Report[]} reports - Array of all reports
 * @property {Report|null} selectedReport - Currently selected report for viewing/editing
 * @property {boolean} loading - Loading state for async operations
 * @property {string|null} error - Error message if operation failed
 * @property {Metric[]} metrics - Array of performance metrics
 */
interface ReportingState {
  reports: Report[];
  selectedReport: Report | null;
  loading: boolean;
  error: string | null;
  metrics: Metric[];
}

const initialState: ReportingState = {
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
  metrics: [],
};

/**
 * Async thunk to fetch all reports from the API.
 *
 * Makes an API call to retrieve the list of security reports.
 * Updates the Redux store with the fetched reports or sets an error state.
 *
 * @async
 * @function fetchReports
 * @returns {Promise<Report[]>} Promise resolving to array of reports
 * @throws {Error} When API call fails or returns unsuccessful response
 *
 * @example
 * ```ts
 * // In a component
 * const dispatch = useDispatch();
 * dispatch(fetchReports());
 * ```
 */
export const fetchReports = createAsyncThunk(
  'reporting/fetchReports',
  async () => {
    const response = await reportingService.getReports();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch reports');
  }
);

/**
 * Async thunk to fetch performance metrics from the API.
 *
 * Retrieves KPIs and performance metrics for the reporting dashboard.
 * Updates the Redux store with metrics or sets an error state on failure.
 *
 * @async
 * @function fetchMetrics
 * @returns {Promise<Metric[]>} Promise resolving to array of metrics
 * @throws {Error} When API call fails or returns unsuccessful response
 *
 * @example
 * ```ts
 * // In a component
 * const dispatch = useDispatch();
 * dispatch(fetchMetrics());
 * ```
 */
export const fetchMetrics = createAsyncThunk(
  'reporting/fetchMetrics',
  async () => {
    const response = await reportingService.getMetrics();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch metrics');
  }
);

/**
 * Redux slice for Reporting module.
 *
 * Manages state and actions for reports, metrics, and UI state.
 * Includes synchronous reducers for UI state and extraReducers for async thunk handling.
 *
 * Reducers:
 * - `clearSelectedReport`: Clears the currently selected report
 * - `clearError`: Clears any error messages
 *
 * Extra Reducers (Async):
 * - Handles pending, fulfilled, and rejected states for fetchReports
 * - Handles fulfilled state for fetchMetrics
 *
 * @constant
 * @type {Slice}
 */
const reportingSlice = createSlice({
  name: 'reporting',
  initialState,
  reducers: {
    /**
     * Clears the currently selected report from state.
     *
     * @param {ReportingState} state - Current state
     */
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
    /**
     * Clears any error message from state.
     *
     * @param {ReportingState} state - Current state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reports';
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      });
  },
});

/**
 * Action creators generated from the slice.
 * @type {Object}
 */
export const { clearSelectedReport, clearError } = reportingSlice.actions;

/**
 * Reducer function for the Reporting module.
 * @type {Reducer<ReportingState>}
 */
export default reportingSlice.reducer;
