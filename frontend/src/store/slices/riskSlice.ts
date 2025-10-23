/**
 * @fileoverview Redux slice for managing risk state. Handles state management, reducers, and async thunks.
 * 
 * @module store/slices/riskSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { riskService } from '@/services/riskService';
import type { RiskAssessment, FilterOptions } from '@/types';

interface RiskState {
  assessments: RiskAssessment[];
  selectedAssessment: RiskAssessment | null;
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
}

const initialState: RiskState = {
  assessments: [],
  selectedAssessment: null,
  loading: false,
  error: null,
  filters: {},
};

export const fetchRiskAssessments = createAsyncThunk(
  'risk/fetchRiskAssessments',
  async () => {
    const response = await riskService.getRiskScores();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch risk assessments');
  }
);

const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    clearSelectedAssessment: (state) => {
      state.selectedAssessment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiskAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiskAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchRiskAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch risk assessments';
      })

  },
});

export const { setFilters, clearSelectedAssessment, clearError } = riskSlice.actions;
export default riskSlice.reducer;
