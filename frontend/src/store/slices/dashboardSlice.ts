/**
 * @fileoverview Redux slice for managing dashboard state. Handles state management, reducers, and async thunks.
 * 
 * @module store/slices/dashboardSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/dashboardService';

interface DashboardStats {
  activeThreats: number;
  openIncidents: number;
  vulnerabilities: number;
  riskScore: number;
  threatTrend: number;
  incidentTrend: number;
  vulnTrend: number;
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    activeThreats: 0,
    openIncidents: 0,
    vulnerabilities: 0,
    riskScore: 0,
    threatTrend: 0,
    incidentTrend: 0,
    vulnTrend: 0,
  },
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    const response = await dashboardService.getStats();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch dashboard stats');
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      });
  },
});

export const { clearError, updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
