import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { threatService } from '@/services/threatService';
import type { Threat, FilterOptions } from '@/types';

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

export const fetchThreats = createAsyncThunk(
  'threats/fetchThreats',
  async (filters?: FilterOptions) => {
    const response = await threatService.getThreats(filters);
    return response;
  }
);

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

const threatSlice = createSlice({
  name: 'threats',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    clearSelectedThreat: (state) => {
      state.selectedThreat = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createThreat.fulfilled, (state, action) => {
        state.threats.unshift(action.payload);
      });
  },
});

export const { setFilters, clearSelectedThreat, clearError } = threatSlice.actions;
export default threatSlice.reducer;
