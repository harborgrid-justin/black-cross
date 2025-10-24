/**
 * @fileoverview Redux slice for managing Indicators of Compromise (IoC) state.
 *
 * Handles state management for IoCs including IP addresses, domains, file hashes,
 * URLs, and other threat indicators. Supports CRUD operations, filtering, and pagination.
 *
 * @module store/slices/iocSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { iocService } from '@/services/iocService';
import type { IoC, FilterOptions } from '@/types';

/**
 * State shape for IoC management.
 *
 * @interface IoCState
 * @property {IoC[]} iocs - Array of all indicators of compromise
 * @property {IoC | null} selectedIoC - Currently selected IoC for detail view
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string | null} error - Error message from failed operations
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page number (1-based)
 * @property {number} pagination.perPage - Items per page
 * @property {number} pagination.total - Total number of IoCs
 * @property {number} pagination.pages - Total number of pages
 * @property {FilterOptions} filters - Current filter/search criteria
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
 * Async thunk for fetching IoCs with optional filtering and pagination.
 *
 * Retrieves a paginated list of indicators of compromise. Supports filtering by
 * type (IP, domain, hash, URL), threat level, source, and date range.
 *
 * @async
 * @param {FilterOptions} [filters] - Optional filter and pagination criteria
 * @returns {Promise<{data: IoC[], pagination: Object}>} IoCs and pagination metadata
 * @throws {Error} When the fetch operation fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchIoCs } from '@/store/slices/iocSlice';
 *
 * function IoCList() {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     // Fetch all IoCs
 *     dispatch(fetchIoCs());
 *
 *     // Fetch with filters
 *     dispatch(fetchIoCs({
 *       type: 'ip',
 *       threatLevel: 'high'
 *     }));
 *   }, [dispatch]);
 * }
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
 * Async thunk for fetching a single IoC by ID.
 *
 * Retrieves detailed information about a specific indicator of compromise
 * including related threats, sightings, and enrichment data.
 *
 * @async
 * @param {string} id - Unique identifier of the IoC
 * @returns {Promise<IoC>} Detailed IoC data
 * @throws {Error} When the IoC cannot be found or fetch fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchIoCById } from '@/store/slices/iocSlice';
 *
 * function IoCDetail({ iocId }: { iocId: string }) {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     dispatch(fetchIoCById(iocId));
 *   }, [dispatch, iocId]);
 * }
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
 * Async thunk for creating a new indicator of compromise.
 *
 * Creates a new IoC record in the system. Validates the indicator format
 * based on its type and checks for duplicates.
 *
 * @async
 * @param {Partial<IoC>} data - IoC data (ID and timestamps auto-generated)
 * @returns {Promise<IoC>} The newly created IoC with full data
 * @throws {Error} When IoC creation fails or validation errors occur
 *
 * @example
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { createIoC } from '@/store/slices/iocSlice';
 *
 * function IoCForm() {
 *   const dispatch = useAppDispatch();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await dispatch(createIoC({
 *         type: 'ip',
 *         value: '192.168.1.100',
 *         threatLevel: 'high',
 *         description: 'Malicious C2 server'
 *       })).unwrap();
 *     } catch (error) {
 *       console.error('Failed to create IoC:', error);
 *     }
 *   };
 * }
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
 * IoC slice containing reducers and actions for IoC state management.
 *
 * Manages indicators of compromise including creation, listing, filtering,
 * and detailed viewing. Supports pagination for large IoC datasets.
 */
const iocSlice = createSlice({
  name: 'iocs',
  initialState,
  reducers: {
    /**
     * Updates the filter criteria for IoC list.
     *
     * Sets new filter options for subsequent fetch operations. Common filters
     * include type, threat level, source, and date range.
     *
     * @param {IoCState} state - Current IoC state
     * @param {PayloadAction<FilterOptions>} action - Action containing new filter options
     *
     * @example
     * ```typescript
     * import { useAppDispatch } from '@/store/hooks';
     * import { setFilters } from '@/store/slices/iocSlice';
     *
     * function IoCFilters() {
     *   const dispatch = useAppDispatch();
     *
     *   dispatch(setFilters({
     *     type: 'hash',
     *     threatLevel: 'critical'
     *   }));
     * }
     * ```
     */
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    /**
     * Clears the currently selected IoC.
     *
     * @param {IoCState} state - Current IoC state
     */
    clearSelectedIoC: (state) => {
      state.selectedIoC = null;
    },
    /**
     * Clears any error messages from the state.
     *
     * @param {IoCState} state - Current IoC state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch IoCs lifecycle
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
      // Fetch IoC by ID lifecycle
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
      // Create IoC - optimistically add to list
      .addCase(createIoC.fulfilled, (state, action) => {
        state.iocs.unshift(action.payload);
      });
  },
});

export const { setFilters, clearSelectedIoC, clearError } = iocSlice.actions;
export default iocSlice.reducer;
