/**
 * @fileoverview Redux slice for IoC Management state management.
 *
 * This module manages the state for Indicators of Compromise (IoC) including
 * list view, detail view, filtering, and pagination. It provides async thunks
 * for fetching and creating IoCs, and reducers for managing local state.
 *
 * @module pages/ioc-management/store/iocSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { iocService } from '@/services/iocService';
import type { IoC, FilterOptions } from '@/types';

/**
 * State shape for the IoC Management slice.
 *
 * @interface IoCState
 * @property {IoC[]} iocs - Array of IoC records currently loaded
 * @property {IoC | null} selectedIoC - Currently selected IoC for detail view
 * @property {boolean} loading - Indicates if an async operation is in progress
 * @property {string | null} error - Error message from failed operations
 * @property {Object} pagination - Pagination metadata for the IoC list
 * @property {number} pagination.page - Current page number (1-indexed)
 * @property {number} pagination.perPage - Number of items per page
 * @property {number} pagination.total - Total number of IoCs available
 * @property {number} pagination.pages - Total number of pages
 * @property {FilterOptions} filters - Active filter criteria for IoC list
 */
interface IoCState {
  iocs: IoC[];
  selectedIoC: IoC | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
  };
  filters: FilterOptions;
}

/**
 * Initial state for the IoC Management slice.
 *
 * @constant
 */
const initialState: IoCState = {
  iocs: [],
  selectedIoC: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    pages: 0,
  },
  filters: {},
};

/**
 * Async thunk to fetch a paginated list of IoCs with optional filters.
 *
 * Retrieves IoCs from the backend API and updates the state with both
 * the data and pagination metadata. Supports filtering by type, status,
 * confidence level, and other criteria.
 *
 * @async
 * @function fetchIoCs
 * @param {FilterOptions} [filters] - Optional filter criteria to apply
 * @returns {Promise<{data: IoC[], pagination: Object}>} IoC list with pagination metadata
 * @throws {Error} When the API request fails or returns unsuccessful response
 *
 * @example
 * ```typescript
 * dispatch(fetchIoCs({ type: 'ip', status: 'active' }));
 * ```
 */
export const fetchIoCs = createAsyncThunk(
  'iocs/fetchIoCs',
  async (filters?: FilterOptions) => {
    const response = await iocService.getIoCs(filters);
    if (response.success && response.data) {
      return { data: response.data, pagination: response.pagination };
    }
    throw new Error('Failed to fetch IoCs');
  }
);

/**
 * Async thunk to fetch a single IoC by its unique identifier.
 *
 * Retrieves detailed information for a specific IoC and stores it
 * in the selectedIoC state property. Used for the detail view page.
 *
 * @async
 * @function fetchIoCById
 * @param {string} id - Unique identifier of the IoC to fetch
 * @returns {Promise<IoC>} The requested IoC record
 * @throws {Error} When the IoC is not found or the API request fails
 *
 * @example
 * ```typescript
 * dispatch(fetchIoCById('abc123'));
 * ```
 */
export const fetchIoCById = createAsyncThunk(
  'iocs/fetchIoCById',
  async (id: string) => {
    const response = await iocService.getIoC(id);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch IoC');
  }
);

/**
 * Async thunk to create a new IoC record.
 *
 * Submits a new IoC to the backend API and adds it to the top of
 * the local state list upon successful creation. The new IoC appears
 * at the beginning of the list for immediate visibility.
 *
 * @async
 * @function createIoC
 * @param {Partial<IoC>} data - IoC data to create (partial object with required fields)
 * @returns {Promise<IoC>} The newly created IoC with server-generated fields
 * @throws {Error} When creation fails due to validation errors or API issues
 *
 * @example
 * ```typescript
 * dispatch(createIoC({
 *   type: 'ip',
 *   value: '192.168.1.1',
 *   confidence: 85,
 *   status: 'active'
 * }));
 * ```
 */
export const createIoC = createAsyncThunk(
  'iocs/createIoC',
  async (data: Partial<IoC>) => {
    const response = await iocService.createIoC(data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create IoC');
  }
);

/**
 * Redux slice for IoC Management state.
 *
 * Manages state for IoC list, detail view, filtering, and pagination.
 * Includes synchronous reducers for local state updates and extra reducers
 * for handling async thunk lifecycle events.
 */
const iocSlice = createSlice({
  name: 'iocs',
  initialState,
  reducers: {
    /**
     * Updates the active filter criteria for the IoC list.
     *
     * @param {IoCState} state - Current state
     * @param {PayloadAction<FilterOptions>} action - Filter options to apply
     */
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    /**
     * Clears the currently selected IoC from state.
     *
     * Used when navigating away from the detail view to clean up state.
     *
     * @param {IoCState} state - Current state
     */
    clearSelectedIoC: (state) => {
      state.selectedIoC = null;
    },
    /**
     * Clears any error message from state.
     *
     * Useful for dismissing error alerts after user acknowledgment.
     *
     * @param {IoCState} state - Current state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchIoCs lifecycle
      .addCase(fetchIoCs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIoCs.fulfilled, (state, action) => {
        state.loading = false;
        state.iocs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchIoCs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch IoCs';
      })
      // fetchIoCById lifecycle
      .addCase(fetchIoCById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIoCById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIoC = action.payload;
      })
      .addCase(fetchIoCById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch IoC';
      })
      // createIoC lifecycle
      .addCase(createIoC.fulfilled, (state, action) => {
        state.iocs.unshift(action.payload);
      });
  },
});

export const { setFilters, clearSelectedIoC, clearError } = iocSlice.actions;
export default iocSlice.reducer;
