/**
 * @fileoverview Redux slice for managing automation state. Handles state management, reducers, and async thunks.
 * 
 * @module store/slices/automationSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playbookService } from '@/services/playbookService';

interface Playbook {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  executions: number;
  lastRun: string;
  createdAt: string;
  updatedAt: string;
}

interface AutomationState {
  playbooks: Playbook[];
  selectedPlaybook: Playbook | null;
  loading: boolean;
  error: string | null;
}

const initialState: AutomationState = {
  playbooks: [],
  selectedPlaybook: null,
  loading: false,
  error: null,
};

export const fetchPlaybooks = createAsyncThunk(
  'automation/fetchPlaybooks',
  async () => {
    const response = await playbookService.listPlaybooks();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch playbooks');
  }
);

export const executePlaybook = createAsyncThunk(
  'automation/executePlaybook',
  async (playbookId: string) => {
    const response = await playbookService.executePlaybook(playbookId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to execute playbook');
  }
);

const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    clearSelectedPlaybook: (state) => {
      state.selectedPlaybook = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaybooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaybooks.fulfilled, (state, action) => {
        state.loading = false;
        state.playbooks = action.payload;
      })
      .addCase(fetchPlaybooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch playbooks';
      })
      .addCase(executePlaybook.pending, (state) => {
        state.loading = true;
      })
      .addCase(executePlaybook.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(executePlaybook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to execute playbook';
      });
  },
});

export const { clearSelectedPlaybook, clearError } = automationSlice.actions;
export default automationSlice.reducer;
