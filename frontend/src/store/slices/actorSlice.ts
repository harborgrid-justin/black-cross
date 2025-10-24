/**
 * @fileoverview Redux slice for managing threat actor state.
 *
 * Handles state management for threat actor profiles, including APT groups,
 * cybercrime organizations, and other malicious entities. Supports filtering,
 * searching, and detailed actor profile viewing.
 *
 * @module store/slices/actorSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { actorService } from '@/services/actorService';
import type { ThreatActor, FilterOptions } from '@/types';

/**
 * State shape for threat actor management.
 *
 * @interface ActorState
 * @property {ThreatActor[]} actors - Array of all threat actor profiles
 * @property {ThreatActor | null} selectedActor - Currently selected actor for detail view
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string | null} error - Error message from failed operations
 * @property {FilterOptions} filters - Current filter/search criteria
 */
interface ActorState {
  actors: ThreatActor[];
  selectedActor: ThreatActor | null;
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
}

const initialState: ActorState = {
  actors: [],
  selectedActor: null,
  loading: false,
  error: null,
  filters: {},
};

/**
 * Async thunk for fetching threat actors with optional filtering.
 *
 * Retrieves a list of threat actor profiles from the backend. Supports filtering
 * by various criteria such as sophistication level, origin country, activity status, etc.
 *
 * @async
 * @param {FilterOptions} [filters] - Optional filter criteria for actors
 * @returns {Promise<ThreatActor[]>} Array of threat actor profiles
 * @throws {Error} When the fetch operation fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchActors } from '@/store/slices/actorSlice';
 *
 * function ActorList() {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     // Fetch all actors
 *     dispatch(fetchActors());
 *
 *     // Or fetch with filters
 *     dispatch(fetchActors({
 *       sophistication: 'advanced',
 *       status: 'active'
 *     }));
 *   }, [dispatch]);
 * }
 * ```
 */
export const fetchActors = createAsyncThunk(
  'actors/fetchActors',
  async (filters?: FilterOptions) => {
    const response = await actorService.getActors(filters);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch threat actors');
  }
);

/**
 * Async thunk for fetching a single threat actor by ID.
 *
 * Retrieves detailed information about a specific threat actor including
 * their tactics, techniques, procedures (TTPs), known campaigns, and attribution data.
 *
 * @async
 * @param {string} id - Unique identifier of the threat actor
 * @returns {Promise<ThreatActor>} Detailed threat actor profile
 * @throws {Error} When the actor cannot be found or fetch fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchActorById } from '@/store/slices/actorSlice';
 *
 * function ActorDetail({ actorId }: { actorId: string }) {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     dispatch(fetchActorById(actorId));
 *   }, [dispatch, actorId]);
 * }
 * ```
 */
export const fetchActorById = createAsyncThunk(
  'actors/fetchActorById',
  async (id: string) => {
    const response = await actorService.getActor(id);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch threat actor');
  }
);

/**
 * Threat actor slice containing reducers and actions for actor state management.
 *
 * Manages the threat actor catalog, supporting operations like listing, filtering,
 * and viewing detailed actor profiles. All data is fetched from the backend API.
 */
const actorSlice = createSlice({
  name: 'actors',
  initialState,
  reducers: {
    /**
     * Updates the filter criteria for threat actor list.
     *
     * Sets new filter options that will be used for subsequent fetch operations.
     * Common filters include sophistication level, origin, activity status, and sectors targeted.
     *
     * @param {ActorState} state - Current actor state
     * @param {PayloadAction<FilterOptions>} action - Action containing new filter options
     *
     * @example
     * ```typescript
     * import { useAppDispatch } from '@/store/hooks';
     * import { setFilters } from '@/store/slices/actorSlice';
     *
     * function ActorFilters() {
     *   const dispatch = useAppDispatch();
     *
     *   const handleFilterChange = () => {
     *     dispatch(setFilters({
     *       sophistication: 'advanced',
     *       origin: 'state-sponsored'
     *     }));
     *   };
     * }
     * ```
     */
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    /**
     * Clears the currently selected threat actor.
     *
     * Resets selectedActor to null, typically used when navigating away from
     * the actor detail view or closing a modal.
     *
     * @param {ActorState} state - Current actor state
     *
     * @example
     * ```typescript
     * import { useAppDispatch } from '@/store/hooks';
     * import { clearSelectedActor } from '@/store/slices/actorSlice';
     *
     * function ActorModal({ onClose }: { onClose: () => void }) {
     *   const dispatch = useAppDispatch();
     *
     *   const handleClose = () => {
     *     dispatch(clearSelectedActor());
     *     onClose();
     *   };
     * }
     * ```
     */
    clearSelectedActor: (state) => {
      state.selectedActor = null;
    },
    /**
     * Clears any error messages from the state.
     *
     * Resets the error field to null, typically called after displaying
     * an error message to the user or before retrying a failed operation.
     *
     * @param {ActorState} state - Current actor state
     *
     * @example
     * ```typescript
     * import { useAppDispatch } from '@/store/hooks';
     * import { clearError } from '@/store/slices/actorSlice';
     *
     * function ErrorDisplay() {
     *   const dispatch = useAppDispatch();
     *
     *   const handleDismiss = () => {
     *     dispatch(clearError());
     *   };
     * }
     * ```
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch actors lifecycle
      .addCase(fetchActors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActors.fulfilled, (state, action) => {
        state.loading = false;
        state.actors = action.payload;
      })
      .addCase(fetchActors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch threat actors';
      })
      // Fetch actor by ID lifecycle
      .addCase(fetchActorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedActor = action.payload;
      })
      .addCase(fetchActorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch threat actor';
      });
  },
});

export const { setFilters, clearSelectedActor, clearError } = actorSlice.actions;
export default actorSlice.reducer;
