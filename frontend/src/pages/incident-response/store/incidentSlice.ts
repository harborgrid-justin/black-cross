/**
 * @fileoverview Redux slice for Incident Response module state management.
 *
 * Manages global state for the incident response module including incidents collection,
 * selected incident details, loading states, error handling, pagination, and filters.
 * Implements async thunks for CRUD operations and provides reducers for state manipulation.
 *
 * @module pages/incident-response/store/incidentSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { incidentService } from '@/services/incidentService';
import type { Incident, FilterOptions } from '@/types';

/**
 * Interface for the incident response Redux state slice.
 *
 * @interface IncidentState
 * @property {Incident[]} incidents - Array of all security incidents
 * @property {Incident | null} selectedIncident - Currently selected incident for detail view
 * @property {boolean} loading - Loading state for async operations
 * @property {string | null} error - Error message if an operation failed
 * @property {object} pagination - Pagination metadata for incident list
 * @property {number} pagination.page - Current page number (1-indexed)
 * @property {number} pagination.perPage - Number of incidents per page
 * @property {number} pagination.total - Total number of incidents matching filters
 * @property {number} pagination.pages - Total number of pages available
 * @property {FilterOptions} filters - Current filter criteria applied to incident list
 */
interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
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
 * Initial state for the incident response slice.
 *
 * @type {IncidentState}
 */
const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
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
 * Async thunk for fetching incidents from the backend.
 *
 * Calls the incident service to retrieve incidents with optional filtering.
 * Updates the Redux store with both incident data and pagination metadata.
 *
 * @async
 * @function fetchIncidents
 * @param {FilterOptions | undefined} filters - Optional filter criteria
 * @returns {Promise<{data: Incident[], pagination: object}>} Incidents and pagination data
 * @throws {Error} If the API call fails or returns an unsuccessful response
 *
 * @example
 * ```tsx
 * // Fetch all incidents
 * dispatch(fetchIncidents(undefined));
 *
 * // Fetch filtered incidents
 * dispatch(fetchIncidents({ severity: 'critical', status: 'open' }));
 * ```
 */
export const fetchIncidents = createAsyncThunk(
  'incidents/fetchIncidents',
  async (filters?: FilterOptions | undefined) => {
    const response = await incidentService.getIncidents(filters);
    if (response.success && response.data) {
      return { data: response.data, pagination: response.pagination };
    }
    throw new Error('Failed to fetch incidents');
  }
);

/**
 * Async thunk for fetching a single incident by ID.
 *
 * Retrieves detailed information about a specific incident for the detail view.
 *
 * @async
 * @function fetchIncidentById
 * @param {string} id - The unique identifier of the incident to fetch
 * @returns {Promise<Incident>} The incident data
 * @throws {Error} If the API call fails or incident is not found
 */
export const fetchIncidentById = createAsyncThunk(
  'incidents/fetchIncidentById',
  async (id: string) => {
    const response = await incidentService.getIncident(id);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch incident');
  }
);

/**
 * Async thunk for creating a new incident.
 *
 * Submits new incident data to the backend and adds it to the Redux store on success.
 *
 * @async
 * @function createIncident
 * @param {Partial<Incident>} data - The incident data to create
 * @returns {Promise<Incident>} The created incident with assigned ID
 * @throws {Error} If the API call fails or validation fails
 */
export const createIncident = createAsyncThunk(
  'incidents/createIncident',
  async (data: Partial<Incident>) => {
    const response = await incidentService.createIncident(data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create incident');
  }
);

/**
 * Async thunk for updating an existing incident.
 *
 * Submits modified incident data to the backend and updates the Redux store on success.
 *
 * @async
 * @function updateIncident
 * @param {object} params - Update parameters
 * @param {string} params.id - The incident ID to update
 * @param {Partial<Incident>} params.data - The incident fields to update
 * @returns {Promise<Incident>} The updated incident data
 * @throws {Error} If the API call fails or validation fails
 */
export const updateIncident = createAsyncThunk(
  'incidents/updateIncident',
  async ({ id, data }: { id: string; data: Partial<Incident> }) => {
    const response = await incidentService.updateIncident(id, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update incident');
  }
);

/**
 * Incident Response Redux slice.
 *
 * Manages state for incident response including incidents, selected incident, loading
 * states, errors, pagination, and filters. Provides synchronous reducers for state
 * manipulation and handles async thunk actions through extraReducers.
 *
 * @constant
 * @type {Slice<IncidentState>}
 */
const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    /**
     * Updates the filter criteria for the incident list.
     *
     * Used to apply search, severity, status, or other filters to the incident table.
     *
     * @param {IncidentState} state - Current state
     * @param {PayloadAction<FilterOptions>} action - Action with new filter values
     * @returns {void}
     */
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    /**
     * Clears the currently selected incident.
     *
     * Used when navigating away from detail view or closing dialogs.
     *
     * @param {IncidentState} state - Current state
     * @returns {void}
     */
    clearSelectedIncident: (state) => {
      state.selectedIncident = null;
    },
    /**
     * Clears any error messages from the state.
     *
     * Used after displaying error to user or when retrying operations.
     *
     * @param {IncidentState} state - Current state
     * @returns {void}
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch incidents';
      })
      .addCase(fetchIncidentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIncident = action.payload;
      })
      .addCase(fetchIncidentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch incident';
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.incidents.unshift(action.payload);
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        const index = state.incidents.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.selectedIncident?.id === action.payload.id) {
          state.selectedIncident = action.payload;
        }
      });
  },
});

export const { setFilters, clearSelectedIncident, clearError } = incidentSlice.actions;
export default incidentSlice.reducer;
