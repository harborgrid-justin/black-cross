/**
 * @fileoverview Redux Slice for Threat Actors State Management.
 *
 * This Redux Toolkit slice manages the global state for the Threat Actors feature,
 * providing centralized state management for actor data, selection, loading states,
 * and filtering. Implements async thunk actions for API interactions and reducers
 * for synchronous state updates.
 *
 * State structure:
 * - actors: Array of all threat actor profiles
 * - selectedActor: Currently selected actor for detail view
 * - loading: Boolean flag for async operation status
 * - error: Error message string for failed operations
 * - filters: Active filter criteria for actor list
 *
 * Async operations:
 * - fetchActors: Retrieves all threat actors with optional filtering
 * - fetchActorById: Retrieves single actor profile by ID
 *
 * Synchronous actions:
 * - setFilters: Updates filter criteria
 * - clearSelectedActor: Resets selected actor state
 * - clearError: Clears error messages
 *
 * @module pages/threat-actors/store/actorSlice
 * @requires @reduxjs/toolkit - Redux Toolkit for slice creation
 * @requires @/services/actorService - API service for backend communication
 * @requires @/types - TypeScript type definitions
 *
 * @example
 * ```typescript
 * import { fetchActors, setFilters } from './store/actorSlice';
 *
 * // In component
 * dispatch(fetchActors({ sophistication: 'advanced' }));
 * dispatch(setFilters({ active: true }));
 * ```
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { actorService } from '@/services/actorService';
import type { ThreatActor, FilterOptions } from '@/types';

/**
 * State interface for Threat Actors Redux slice.
 *
 * Defines the structure of the threat actors state managed by Redux,
 * including actor data, UI state, and error handling.
 *
 * @interface ActorState
 * @property {ThreatActor[]} actors - Array of threat actor profiles
 * @property {ThreatActor | null} selectedActor - Currently selected actor for detail view
 * @property {boolean} loading - Loading state for async operations
 * @property {string | null} error - Error message from failed operations
 * @property {FilterOptions} filters - Active filter criteria for actor list
 */
interface ActorState {
  actors: ThreatActor[];
  selectedActor: ThreatActor | null;
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
}

/**
 * Initial state for the threat actors Redux slice.
 *
 * Provides default values for all state properties before any data is loaded.
 * Ensures predictable state structure on component mount.
 */
const initialState: ActorState = {
  actors: [],
  selectedActor: null,
  loading: false,
  error: null,
  filters: {},
};

/**
 * Async thunk for fetching all threat actors with optional filtering.
 *
 * Retrieves threat actor profiles from the backend API, optionally filtered
 * by criteria such as sophistication level, activity status, motivation, or
 * target sectors. Handles API response validation and error scenarios.
 *
 * @async
 * @function fetchActors
 * @param {FilterOptions} [filters] - Optional filter criteria for actor list
 * @returns {Promise<ThreatActor[]>} Array of threat actor profiles
 * @throws {Error} When API request fails or returns invalid data
 *
 * @example
 * ```typescript
 * // Fetch all actors
 * dispatch(fetchActors());
 *
 * // Fetch filtered actors
 * dispatch(fetchActors({ sophistication: 'advanced', active: true }));
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
 * Retrieves detailed information for a specific threat actor identified by
 * unique ID. Used for detail pages and edit operations. Handles API response
 * validation and provides detailed error messages.
 *
 * @async
 * @function fetchActorById
 * @param {string} id - Unique identifier for the threat actor
 * @returns {Promise<ThreatActor>} Complete threat actor profile object
 * @throws {Error} When actor not found or API request fails
 *
 * @example
 * ```typescript
 * // Fetch actor for detail view
 * dispatch(fetchActorById('apt28-id'));
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

const actorSlice = createSlice({
  name: 'actors',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    clearSelectedActor: (state) => {
      state.selectedActor = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
