/**
 * @fileoverview Redux slice for Risk Assessment module state management.
 *
 * Manages state for risk assessments and risk scoring including:
 * - Risk assessments list with filtering capabilities
 * - Selected assessment for detailed view
 * - Filter state for assessment queries
 * - Async operations for fetching risk data from API
 *
 * Uses Redux Toolkit with createAsyncThunk for async operations and
 * createSlice for reducer logic with Immer-powered immutable updates.
 *
 * @module pages/risk-assessment/store/riskSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { riskService } from '@/services/riskService';
import type { RiskAssessment, FilterOptions } from '@/types';

/**
 * Redux state structure for the Risk Assessment module.
 *
 * @interface RiskState
 * @property {RiskAssessment[]} assessments - Array of all risk assessments
 * @property {RiskAssessment|null} selectedAssessment - Currently selected assessment for viewing/editing
 * @property {boolean} loading - Loading state for async operations
 * @property {string|null} error - Error message if operation failed
 * @property {FilterOptions} filters - Current filter settings for assessment queries
 */
interface RiskState {
  assessments: RiskAssessment[];
  selectedAssessment: RiskAssessment | null;
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
}

const initialState: RiskState = {
  assessments: [],
  selectedAssessment: null,
  loading: false,
  error: null,
  filters: {},
};

/**
 * Async thunk to fetch risk assessments from the API.
 *
 * Retrieves risk assessment data including risk scores, threat levels,
 * and vulnerability metrics. Updates Redux store with fetched assessments
 * or sets an error state on failure.
 *
 * @async
 * @function fetchRiskAssessments
 * @returns {Promise<RiskAssessment[]>} Promise resolving to array of risk assessments
 * @throws {Error} When API call fails or returns unsuccessful response
 *
 * @example
 * ```ts
 * // In a component
 * const dispatch = useDispatch();
 * dispatch(fetchRiskAssessments());
 * ```
 */
export const fetchRiskAssessments = createAsyncThunk(
  'risk/fetchRiskAssessments',
  async () => {
    const response = await riskService.getRiskScores();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch risk assessments');
  }
);

/**
 * Redux slice for Risk Assessment module.
 *
 * Manages state and actions for risk assessments, filtering, and UI state.
 * Includes synchronous reducers for filters and UI state, and extraReducers
 * for async thunk handling.
 *
 * Reducers:
 * - `setFilters`: Updates filter options for assessment queries
 * - `clearSelectedAssessment`: Clears the currently selected assessment
 * - `clearError`: Clears any error messages
 *
 * Extra Reducers (Async):
 * - Handles pending, fulfilled, and rejected states for fetchRiskAssessments
 *
 * @constant
 * @type {Slice}
 */
const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    /**
     * Updates filter options for risk assessment queries.
     *
     * @param {RiskState} state - Current state
     * @param {PayloadAction<FilterOptions>} action - Action with filter payload
     */
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    /**
     * Clears the currently selected assessment from state.
     *
     * @param {RiskState} state - Current state
     */
    clearSelectedAssessment: (state) => {
      state.selectedAssessment = null;
    },
    /**
     * Clears any error message from state.
     *
     * @param {RiskState} state - Current state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiskAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiskAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchRiskAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch risk assessments';
      })

  },
});

/**
 * Action creators generated from the slice.
 * @type {Object}
 */
export const { setFilters, clearSelectedAssessment, clearError } = riskSlice.actions;

/**
 * Reducer function for the Risk Assessment module.
 * @type {Reducer<RiskState>}
 */
export default riskSlice.reducer;
