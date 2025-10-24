/**
 * @fileoverview Redux slice for Dark Web module state management.
 *
 * Manages global state for the dark web monitoring module including findings collection,
 * selected finding details, loading states, and error handling. Implements async thunks
 * for data fetching and provides reducers for state manipulation.
 *
 * @module pages/dark-web/store/darkWebSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { darkWebService } from '@/services/darkWebService';

/**
 * Interface representing a dark web finding.
 *
 * @interface DarkWebFinding
 * @property {string} id - Unique identifier for the finding
 * @property {'credential-leak' | 'brand-mention' | 'data-breach' | 'threat-actor' | 'malware' | 'marketplace'} type - Type of finding
 * @property {'critical' | 'high' | 'medium' | 'low'} severity - Severity level of the threat
 * @property {'new' | 'investigating' | 'validated' | 'false-positive' | 'resolved'} status - Current investigation status
 * @property {string} source - Dark web source where finding was discovered
 * @property {string} [sourceUrl] - Optional URL to the source (handle with caution)
 * @property {string} title - Brief title describing the finding
 * @property {string} description - Detailed description of the finding
 * @property {string} [content] - Full content or excerpt from the source
 * @property {string[]} keywords - Keywords that triggered this finding
 * @property {string[]} [affectedAssets] - Assets or systems potentially affected
 * @property {string} discoveredAt - ISO timestamp when finding was discovered
 * @property {string} updatedAt - ISO timestamp of last update
 */
interface DarkWebFinding {
  id: string;
  type: 'credential-leak' | 'brand-mention' | 'data-breach' | 'threat-actor' | 'malware' | 'marketplace';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'investigating' | 'validated' | 'false-positive' | 'resolved';
  source: string;
  sourceUrl?: string;
  title: string;
  description: string;
  content?: string;
  keywords: string[];
  affectedAssets?: string[];
  discoveredAt: string;
  updatedAt: string;
}

/**
 * Interface for the dark web Redux state slice.
 *
 * @interface DarkWebState
 * @property {DarkWebFinding[]} listings - Array of all dark web findings
 * @property {DarkWebFinding | null} selectedListing - Currently selected finding for detail view
 * @property {boolean} loading - Loading state for async operations
 * @property {string | null} error - Error message if an operation failed
 */
interface DarkWebState {
  listings: DarkWebFinding[];
  selectedListing: DarkWebFinding | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state for the dark web slice.
 *
 * @type {DarkWebState}
 */
const initialState: DarkWebState = {
  listings: [],
  selectedListing: null,
  loading: false,
  error: null,
};

/**
 * Async thunk for fetching dark web findings from the backend.
 *
 * Calls the dark web service to retrieve all findings and updates the Redux store
 * with the results. Handles both success and error cases through Redux Toolkit's
 * built-in state management.
 *
 * @async
 * @function fetchDarkWebListings
 * @returns {Promise<DarkWebFinding[]>} Array of dark web findings
 * @throws {Error} If the API call fails or returns an unsuccessful response
 *
 * @example
 * ```tsx
 * // In a component
 * const dispatch = useAppDispatch();
 * useEffect(() => {
 *   dispatch(fetchDarkWebListings());
 * }, [dispatch]);
 * ```
 */
export const fetchDarkWebListings = createAsyncThunk(
  'darkWeb/fetchListings',
  async () => {
    const response = await darkWebService.getFindings();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch dark web listings');
  }
);

/**
 * Dark Web Redux slice.
 *
 * Manages state for dark web monitoring including findings, loading states, and errors.
 * Provides synchronous reducers for state manipulation and handles async thunk actions
 * through extraReducers.
 *
 * @constant
 * @type {Slice<DarkWebState>}
 */
const darkWebSlice = createSlice({
  name: 'darkWeb',
  initialState,
  reducers: {
    /**
     * Clears the currently selected finding.
     *
     * Used when navigating away from detail view or closing dialogs.
     *
     * @param {DarkWebState} state - Current state
     * @returns {void}
     */
    clearSelectedListing: (state) => {
      state.selectedListing = null;
    },
    /**
     * Clears any error messages from the state.
     *
     * Used after displaying error to user or when retrying operations.
     *
     * @param {DarkWebState} state - Current state
     * @returns {void}
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDarkWebListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDarkWebListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload;
      })
      .addCase(fetchDarkWebListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dark web listings';
      });
  },
});

export const { clearSelectedListing, clearError } = darkWebSlice.actions;
export default darkWebSlice.reducer;
