/**
 * @fileoverview Redux slice for managing auth state. Handles state management, reducers, and async thunks.
 * 
 * @module store/slices/authSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import type { AuthState, User } from '@/types';

const getInitialAuthState = (): AuthState => {
  // Safe initialization that works both on server and client and in test environments
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    };
  }
  
  try {
    return {
      user: null,
      token: authService.getToken(),
      isAuthenticated: authService.isAuthenticated(),
      loading: false,
    };
  } catch (error) {
    console.warn('Error initializing auth state:', error);
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    };
  }
};

const initialState: AuthState = getInitialAuthState();

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    if (response.success && response.data) {
      authService.setToken(response.data.token);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    }
    throw new Error(response.error || 'Login failed');
  }
);

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  const response = await authService.getCurrentUser();
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to get user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    hydrate: (state) => {
      // Hydrate auth state from localStorage when client is ready
      if (typeof window !== 'undefined') {
        const token = authService.getToken();
        state.token = token;
        state.isAuthenticated = !!token;
        
        // Try to get user from localStorage if available
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            state.user = JSON.parse(storedUser);
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setUser, hydrate } = authSlice.actions;
export default authSlice.reducer;
