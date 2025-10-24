/**
 * @fileoverview Redux slice for managing security incident state.
 *
 * Handles state management for security incidents, including creation, updates,
 * filtering, and pagination. Supports the full incident response lifecycle from
 * detection through resolution.
 *
 * @module store/slices/incidentSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { incidentService } from '@/services/incidentService';
import type { Incident, FilterOptions } from '@/types';

/**
 * State shape for incident management.
 *
 * @interface IncidentState
 * @property {Incident[]} incidents - Array of all incidents
 * @property {Incident | null} selectedIncident - Currently selected incident for detail view
 * @property {boolean} loading - Whether an async operation is in progress
 * @property {string | null} error - Error message from failed operations
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page number (1-based)
 * @property {number} pagination.perPage - Items per page
 * @property {number} pagination.total - Total number of incidents
 * @property {number} pagination.pages - Total number of pages
 * @property {FilterOptions} filters - Current filter/search criteria
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
 * Async thunk for fetching incidents with optional filtering and pagination.
 *
 * Retrieves a paginated list of security incidents. Supports filtering by severity,
 * status, assignee, date range, and other criteria.
 *
 * @async
 * @param {FilterOptions} [filters] - Optional filter and pagination criteria
 * @returns {Promise<{data: Incident[], pagination: Object}>} Incidents and pagination metadata
 * @throws {Error} When the fetch operation fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchIncidents } from '@/store/slices/incidentSlice';
 *
 * function IncidentList() {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     // Fetch all incidents
 *     dispatch(fetchIncidents());
 *
 *     // Fetch with filters
 *     dispatch(fetchIncidents({
 *       severity: 'critical',
 *       status: 'open',
 *       page: 1,
 *       perPage: 20
 *     }));
 *   }, [dispatch]);
 * }
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
 * Retrieves detailed information about a specific security incident including
 * timeline, affected assets, related threats, response actions, and notes.
 *
 * @async
 * @param {string} id - Unique identifier of the incident
 * @returns {Promise<Incident>} Detailed incident data
 * @throws {Error} When the incident cannot be found or fetch fails
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchIncidentById } from '@/store/slices/incidentSlice';
 *
 * function IncidentDetail({ incidentId }: { incidentId: string }) {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     dispatch(fetchIncidentById(incidentId));
 *   }, [dispatch, incidentId]);
 * }
 * ```
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
 * Async thunk for creating a new security incident.
 *
 * Creates a new incident record in the system. The incident will be assigned
 * a unique ID and timestamp. Automatically adds the new incident to the state.
 *
 * @async
 * @param {Partial<Incident>} data - Incident data (ID and timestamps auto-generated)
 * @returns {Promise<Incident>} The newly created incident with full data
 * @throws {Error} When incident creation fails or validation errors occur
 *
 * @example
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { createIncident } from '@/store/slices/incidentSlice';
 *
 * function IncidentForm() {
 *   const dispatch = useAppDispatch();
 *
 *   const handleSubmit = async (formData: Partial<Incident>) => {
 *     try {
 *       const result = await dispatch(createIncident({
 *         title: 'Ransomware Attack on File Server',
 *         severity: 'critical',
 *         status: 'open',
 *         description: 'Ransomware detected on primary file server'
 *       })).unwrap();
 *       console.log('Created incident:', result);
 *     } catch (error) {
 *       console.error('Failed to create incident:', error);
 *     }
 *   };
 * }
 * ```
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
 * Updates incident data such as status, severity, assignee, or notes.
 * The updated incident will replace the old version in both the list and
 * selected incident if applicable.
 *
 * @async
 * @param {Object} params - Update parameters
 * @param {string} params.id - ID of the incident to update
 * @param {Partial<Incident>} params.data - Fields to update
 * @returns {Promise<Incident>} The updated incident with full data
 * @throws {Error} When the update fails or incident is not found
 *
 * @example
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { updateIncident } from '@/store/slices/incidentSlice';
 *
 * function IncidentStatusUpdate({ incidentId }: { incidentId: string }) {
 *   const dispatch = useAppDispatch();
 *
 *   const handleStatusChange = async (newStatus: string) => {
 *     try {
 *       await dispatch(updateIncident({
 *         id: incidentId,
 *         data: { status: newStatus }
 *       })).unwrap();
 *     } catch (error) {
 *       console.error('Failed to update incident:', error);
 *     }
 *   };
 * }
 * ```
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
 * Incident slice containing reducers and actions for incident state management.
 *
 * Manages the full incident response lifecycle including creation, updates,
 * filtering, and viewing. Supports pagination for large incident lists.
 */
const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    /**
     * Updates the filter criteria for incident list.
     *
     * Sets new filter options for subsequent fetch operations. Common filters
     * include severity, status, assignee, date range, and affected assets.
     *
     * @param {IncidentState} state - Current incident state
     * @param {PayloadAction<FilterOptions>} action - Action containing new filter options
     *
     * @example
     * ```typescript
     * import { useAppDispatch } from '@/store/hooks';
     * import { setFilters } from '@/store/slices/incidentSlice';
     *
     * function IncidentFilters() {
     *   const dispatch = useAppDispatch();
     *
     *   const handleFilterChange = () => {
     *     dispatch(setFilters({
     *       severity: 'critical',
     *       status: 'open'
     *     }));
     *   };
     * }
     * ```
     */
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    /**
     * Clears the currently selected incident.
     *
     * Resets selectedIncident to null, typically used when navigating away from
     * the incident detail view or closing a modal.
     *
     * @param {IncidentState} state - Current incident state
     */
    clearSelectedIncident: (state) => {
      state.selectedIncident = null;
    },
    /**
     * Clears any error messages from the state.
     *
     * Resets the error field to null, typically called after displaying
     * an error message to the user or before retrying a failed operation.
     *
     * @param {IncidentState} state - Current incident state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch incidents lifecycle
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
      // Fetch incident by ID lifecycle
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
      // Create incident - optimistically add to list
      .addCase(createIncident.fulfilled, (state, action) => {
        state.incidents.unshift(action.payload);
      })
      // Update incident - update in list and selected if applicable
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
