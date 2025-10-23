/**
 * @fileoverview Redux slice for Ioc Management page state. Manages local page state and interactions.
 * 
 * @module pages/ioc-management/store/iocSlice.ts
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { iocService } from '@/services/iocService';
import type { IoC, FilterOptions } from '@/types';

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

const iocSlice = createSlice({
  name: 'iocs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    clearSelectedIoC: (state) => {
      state.selectedIoC = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createIoC.fulfilled, (state, action) => {
        state.iocs.unshift(action.payload);
      });
  },
});

export const { setFilters, clearSelectedIoC, clearError } = iocSlice.actions;
export default iocSlice.reducer;
