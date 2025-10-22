import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { huntingService } from '@/services/huntingService';

interface HuntingHypothesis {
  id: string;
  title: string;
  description: string;
  status: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

interface HuntingState {
  hunts: HuntingHypothesis[];
  selectedHunt: HuntingHypothesis | null;
  loading: boolean;
  error: string | null;
}

const initialState: HuntingState = {
  hunts: [],
  selectedHunt: null,
  loading: false,
  error: null,
};

export const fetchHunts = createAsyncThunk(
  'hunting/fetchHunts',
  async () => {
    const response = await huntingService.getHypotheses();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch hunts');
  }
);

export const executeHunt = createAsyncThunk(
  'hunting/executeHunt',
  async ({ hypothesisId, queryId }: { hypothesisId: string; queryId: string }) => {
    const response = await huntingService.executeQuery(hypothesisId, queryId);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to execute hunt');
  }
);

const huntingSlice = createSlice({
  name: 'hunting',
  initialState,
  reducers: {
    clearSelectedHunt: (state) => {
      state.selectedHunt = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHunts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHunts.fulfilled, (state, action) => {
        state.loading = false;
        state.hunts = action.payload;
      })
      .addCase(fetchHunts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch hunts';
      })
      .addCase(executeHunt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeHunt.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(executeHunt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to execute hunt';
      });
  },
});

export const { clearSelectedHunt, clearError } = huntingSlice.actions;
export default huntingSlice.reducer;
