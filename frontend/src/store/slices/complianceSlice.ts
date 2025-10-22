import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complianceService } from '@/services/complianceService';

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  totalControls: number;
  implementedControls: number;
  complianceScore: number;
  status: 'active' | 'draft' | 'archived';
  lastAssessment?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplianceState {
  frameworks: ComplianceFramework[];
  selectedFramework: ComplianceFramework | null;
  loading: boolean;
  error: string | null;
}

const initialState: ComplianceState = {
  frameworks: [],
  selectedFramework: null,
  loading: false,
  error: null,
};

export const fetchComplianceFrameworks = createAsyncThunk(
  'compliance/fetchFrameworks',
  async () => {
    const response = await complianceService.getFrameworks();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch compliance frameworks');
  }
);

const complianceSlice = createSlice({
  name: 'compliance',
  initialState,
  reducers: {
    clearSelectedFramework: (state) => {
      state.selectedFramework = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplianceFrameworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplianceFrameworks.fulfilled, (state, action) => {
        state.loading = false;
        state.frameworks = action.payload;
      })
      .addCase(fetchComplianceFrameworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch compliance frameworks';
      });
  },
});

export const { clearSelectedFramework, clearError } = complianceSlice.actions;
export default complianceSlice.reducer;
