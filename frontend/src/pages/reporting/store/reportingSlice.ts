/**
 * @fileoverview Redux slice for Reporting page state. Manages local page state and interactions.
 * 
 * @module pages/reporting/store/reportingSlice.ts
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportingService } from '@/services/reportingService';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'executive' | 'technical' | 'compliance' | 'incident' | 'vulnerability' | 'threat';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'docx' | 'html' | 'csv' | 'json';
  generatedBy: string;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Metric {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

interface ReportingState {
  reports: Report[];
  selectedReport: Report | null;
  loading: boolean;
  error: string | null;
  metrics: Metric[];
}

const initialState: ReportingState = {
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
  metrics: [],
};

export const fetchReports = createAsyncThunk(
  'reporting/fetchReports',
  async () => {
    const response = await reportingService.getReports();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch reports');
  }
);

export const fetchMetrics = createAsyncThunk(
  'reporting/fetchMetrics',
  async () => {
    const response = await reportingService.getMetrics();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch metrics');
  }
);

const reportingSlice = createSlice({
  name: 'reporting',
  initialState,
  reducers: {
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reports';
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      });
  },
});

export const { clearSelectedReport, clearError } = reportingSlice.actions;
export default reportingSlice.reducer;
