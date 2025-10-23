/**
 * @fileoverview Redux slice for managing actor state. Handles state management, reducers, and async thunks.
 * 
 * @module store/slices/actorSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { actorService } from '@/services/actorService';
import type { ThreatActor, FilterOptions } from '@/types';

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
