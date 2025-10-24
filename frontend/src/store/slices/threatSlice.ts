/**
 * @fileoverview Redux slice for managing threat intelligence state.
 *
 * Handles state management for threat data including APT campaigns, malware families,
 * attack techniques, and intelligence reports. Supports CRUD operations, filtering, and pagination.
 *
 * @module store/slices/threatSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { threatService } from '@/services/threatService';
import type { Threat, FilterOptions } from '@/types';

/**
 * State shape for threat intelligence management.
 *
 * @interface ThreatState
 * @property {Threat[]} threats - Array of all threat intelligence items
 * @property {Threat | null} selectedThreat - Currently selected threat for detail view
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string | null} error - Error message from failed operations
 * @property {Object} pagination - Pagination metadata
 * @property {FilterOptions} filters - Current filter/search criteria
 */
interface ThreatState {
  threats: Threat[];
  selectedThreat: Threat | null;
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

const initialState: ThreatState = {
  threats: [],
  selectedThreat: null,
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
 * Async thunk for fetching threats with optional filtering and pagination.
 *
 * Retrieves threat intelligence data including campaigns, malware, and attack patterns.
 * Supports filtering by type, severity, source, and date range.
 *
 * @async
 * @param {FilterOptions} [filters] - Optional filter and pagination criteria
 * @returns {Promise<{data: Threat[], pagination: Object}>} Threats and pagination metadata
 * @throws {Error} When the fetch operation fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchThreats } from '@/store/slices/threatSlice';
 *
 * function ThreatList() {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     dispatch(fetchThreats({ severity: 'critical', type: 'apt' }));
 *   }, [dispatch]);
 * }
 * ```
 */
export const fetchThreats = createAsyncThunk(
  'threats/fetchThreats',
  async (filters?: FilterOptions) => {
    const response = await threatService.getThreats(filters);
    return response;
  }
);

/**
 * Async thunk for fetching a single threat by ID.
 *
 * Retrieves detailed threat intelligence including TTPs, IoCs, related campaigns,
 * and mitigation recommendations.
 *
 * @async
 * @param {string} id - Unique identifier of the threat
 * @returns {Promise<Threat>} Detailed threat intelligence data
 * @throws {Error} When the threat cannot be found or fetch fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchThreatById } from '@/store/slices/threatSlice';
 *
 * function ThreatDetail({ threatId }: { threatId: string }) {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     dispatch(fetchThreatById(threatId));
 *   }, [dispatch, threatId]);
 * }
 * ```
 */
export const fetchThreatById = createAsyncThunk(
  'threats/fetchThreatById',
  async (id: string) => {
    const response = await threatService.getThreat(id);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch threat');
  }
);

/**
 * Async thunk for creating a new threat intelligence entry.
 *
 * Creates a new threat record from intelligence collection. Automatically
 * enriches the threat with related data and assigns unique identifier.
 *
 * @async
 * @param {Partial<Threat>} data - Threat data (ID and timestamps auto-generated)
 * @returns {Promise<Threat>} The newly created threat with full data
 * @throws {Error} When threat creation fails or validation errors occur
 *
 * @example
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { createThreat } from '@/store/slices/threatSlice';
 *
 * function ThreatForm() {
 *   const dispatch = useAppDispatch();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await dispatch(createThreat({
 *         name: 'APT29 Campaign',
 *         type: 'apt',
 *         severity: 'critical',
 *         description: 'Advanced persistent threat targeting government'
 *       })).unwrap();
 *     } catch (error) {
 *       console.error('Failed to create threat:', error);
 *     }
 *   };
 * }
 * ```
 */
export const createThreat = createAsyncThunk(
  'threats/createThreat',
  async (data: Partial<Threat>) => {
    const response = await threatService.collectThreat(data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create threat');
  }
);

/**
 * Threat slice containing reducers and actions for threat intelligence state management.
 *
 * Manages threat intelligence data including campaigns, malware, and attack patterns.
 * Supports full CRUD operations with filtering and pagination.
 */
const threatSlice = createSlice({
  name: 'threats',
  initialState,
  reducers: {
    /**
     * Updates the filter criteria for threat list.
     *
     * @param {ThreatState} state - Current threat state
     * @param {PayloadAction<FilterOptions>} action - Action containing new filter options
     */
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    /**
     * Clears the currently selected threat.
     *
     * @param {ThreatState} state - Current threat state
     */
    clearSelectedThreat: (state) => {
      state.selectedThreat = null;
    },
    /**
     * Clears any error messages from the state.
     *
     * @param {ThreatState} state - Current threat state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch threats lifecycle
      .addCase(fetchThreats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreats.fulfilled, (state, action) => {
        state.loading = false;
        state.threats = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchThreats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch threats';
      })
      // Fetch threat by ID lifecycle
      .addCase(fetchThreatById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreatById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedThreat = action.payload;
      })
      .addCase(fetchThreatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch threat';
      })
      // Create threat - optimistically add to list
      .addCase(createThreat.fulfilled, (state, action) => {
        state.threats.unshift(action.payload);
      });
  },
});

export const { setFilters, clearSelectedThreat, clearError } = threatSlice.actions;
export default threatSlice.reducer;
