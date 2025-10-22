import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { darkWebService } from '@/services/darkWebService';

interface DarkWebFinding {
  id: string;
  type: string;
  content: string;
  source: string;
  url: string;
  severity: string;
  status: string;
  discoveredAt: string;
  verifiedAt?: string;
}

interface DarkWebState {
  listings: DarkWebFinding[];
  selectedListing: DarkWebFinding | null;
  loading: boolean;
  error: string | null;
}

const initialState: DarkWebState = {
  listings: [],
  selectedListing: null,
  loading: false,
  error: null,
};

export const fetchDarkWebListings = createAsyncThunk(
  'darkWeb/fetchListings',
  async () => {
    const response = await darkWebService.getFindings();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch dark web listings');
  }
);

const darkWebSlice = createSlice({
  name: 'darkWeb',
  initialState,
  reducers: {
    clearSelectedListing: (state) => {
      state.selectedListing = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDarkWebListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDarkWebListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload;
      })
      .addCase(fetchDarkWebListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dark web listings';
      });
  },
});

export const { clearSelectedListing, clearError } = darkWebSlice.actions;
export default darkWebSlice.reducer;
