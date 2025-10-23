/**
 * @fileoverview Redux slice for Threat Feeds page state. Manages local page state and interactions.
 * 
 * @module pages/threat-feeds/store/feedSlice.ts
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedService } from '@/services/feedService';

interface ThreatFeed {
  id: string;
  name: string;
  status: boolean;
  lastUpdate: string;
  type: string;
  reliability: number;
}

interface FeedState {
  feeds: ThreatFeed[];
  selectedFeed: ThreatFeed | null;
  loading: boolean;
  error: string | null;
}

const initialState: FeedState = {
  feeds: [],
  selectedFeed: null,
  loading: false,
  error: null,
};

export const fetchFeeds = createAsyncThunk(
  'feeds/fetchFeeds',
  async () => {
    const response = await feedService.getFeeds();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch feeds');
  }
);

const feedSlice = createSlice({
  name: 'feeds',
  initialState,
  reducers: {
    clearSelectedFeed: (state) => {
      state.selectedFeed = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.feeds = action.payload;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch feeds';
      });
  },
});

export const { clearSelectedFeed, clearError } = feedSlice.actions;
export default feedSlice.reducer;
