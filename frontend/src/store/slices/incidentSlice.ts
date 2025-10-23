/**
 * @fileoverview Redux slice for managing incident state. Handles state management, reducers, and async thunks.
 * 
 * @module store/slices/incidentSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { incidentService } from '@/services/incidentService';
import type { Incident, FilterOptions } from '@/types';

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

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    clearSelectedIncident: (state) => {
      state.selectedIncident = null;
    },
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
