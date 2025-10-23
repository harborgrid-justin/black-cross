/**
 * @fileoverview Redux slice for Collaboration page state. Manages local page state and interactions.
 * 
 * @module pages/collaboration/store/collaborationSlice.ts
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collaborationService } from '@/services/collaborationService';

interface ChatMessage {
  id: string;
  workspaceId: string;
  channelId?: string;
  content: string;
  author: string;
  authorName?: string;
  type: 'text' | 'file' | 'system';
  attachments?: unknown[];
  mentions: string[];
  replyTo?: string;
  createdAt: string;
}

interface ChatChannel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  createdBy: string;
  createdAt: string;
}

interface CollaborationState {
  messages: ChatMessage[];
  channels: ChatChannel[];
  selectedChannel: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CollaborationState = {
  messages: [],
  channels: [],
  selectedChannel: null,
  loading: false,
  error: null,
};

export const fetchChannels = createAsyncThunk(
  'collaboration/fetchChannels',
  async (workspaceId: string) => {
    const response = await collaborationService.getChannels(workspaceId);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch channels');
  }
);

export const fetchMessages = createAsyncThunk(
  'collaboration/fetchMessages',
  async ({ workspaceId, channelId }: { workspaceId: string; channelId: string }) => {
    const response = await collaborationService.getMessages(workspaceId, channelId);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch messages');
  }
);

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setSelectedChannel: (state, action) => {
      state.selectedChannel = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch channels';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      });
  },
});

export const { setSelectedChannel, addMessage, clearError } = collaborationSlice.actions;
export default collaborationSlice.reducer;
