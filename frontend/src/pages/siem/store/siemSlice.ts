/**
 * @fileoverview Redux slice for Siem page state. Manages local page state and interactions.
 * 
 * @module pages/siem/store/siemSlice.ts
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { siemService } from '@/services/siemService';

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  severity: string;
  event: string;
  message: string;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'false-positive';
  ruleId: string;
  ruleName: string;
  events: string[];
  correlatedEvents: number;
  confidence: number;
  assignedTo?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

interface SIEMState {
  logs: LogEntry[];
  alerts: SecurityAlert[];
  loading: boolean;
  error: string | null;
  stats: {
    totalEvents: number;
    criticalAlerts: number;
    activeThreats: number;
  };
}

const initialState: SIEMState = {
  logs: [],
  alerts: [],
  loading: false,
  error: null,
  stats: {
    totalEvents: 0,
    criticalAlerts: 0,
    activeThreats: 0,
  },
};

export const fetchSIEMLogs = createAsyncThunk(
  'siem/fetchLogs',
  async (filters?: { search?: string }) => {
    const response = await siemService.getLogs(filters);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch SIEM logs');
  }
);

export const fetchSIEMAlerts = createAsyncThunk(
  'siem/fetchAlerts',
  async () => {
    const response = await siemService.getAlerts();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch SIEM alerts');
  }
);

const siemSlice = createSlice({
  name: 'siem',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSIEMLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSIEMLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchSIEMLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch SIEM logs';
      })
      .addCase(fetchSIEMAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      });
  },
});

export const { clearError, updateStats } = siemSlice.actions;
export default siemSlice.reducer;
