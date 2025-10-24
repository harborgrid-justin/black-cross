/**
 * @fileoverview Redux slice for managing authentication state.
 *
 * Handles user authentication, session management, and user profile data.
 * This slice manages login/logout flows, token storage, and user hydration
 * from localStorage for session persistence across page refreshes.
 *
 * @module store/slices/authSlice
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import type { AuthState, User } from '@/types';

/**
 * Safely initializes the authentication state from localStorage.
 *
 * This function handles server-side rendering (SSR) and test environments
 * where localStorage may not be available. It attempts to restore the user's
 * authentication token and status from localStorage if available.
 *
 * @returns {AuthState} The initial authentication state
 *
 * @example
 * ```typescript
 * // Returns restored state in browser
 * {
 *   user: null,
 *   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   isAuthenticated: true,
 *   loading: false
 * }
 * ```
 */
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

/**
 * Async thunk for user login.
 *
 * Authenticates a user with email and password credentials. On successful login,
 * stores the JWT token in localStorage and updates the Redux state with user data.
 *
 * @async
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @returns {Promise<{user: User, token: string}>} User data and authentication token
 * @throws {Error} When login fails or credentials are invalid
 *
 * @example
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { login } from '@/store/slices/authSlice';
 *
 * function LoginForm() {
 *   const dispatch = useAppDispatch();
 *
 *   const handleSubmit = async (email: string, password: string) => {
 *     try {
 *       await dispatch(login({ email, password })).unwrap();
 *       // Login successful, user will be redirected
 *     } catch (error) {
 *       // Handle login error
 *       console.error('Login failed:', error);
 *     }
 *   };
 * }
 * ```
 */
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

/**
 * Async thunk for fetching the current authenticated user's profile.
 *
 * Retrieves the full user profile data for the currently authenticated user
 * using the stored JWT token. This is typically called after page refresh
 * to restore the user's session.
 *
 * @async
 * @returns {Promise<User>} The current user's profile data
 * @throws {Error} When user data cannot be retrieved or token is invalid
 *
 * @example
 * ```typescript
 * import { useEffect } from 'react';
 * import { useAppDispatch } from '@/store/hooks';
 * import { getCurrentUser } from '@/store/slices/authSlice';
 *
 * function App() {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     // Restore user session on app mount
 *     dispatch(getCurrentUser());
 *   }, [dispatch]);
 * }
 * ```
 */
export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  const response = await authService.getCurrentUser();
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to get user');
});

/**
 * Authentication slice containing reducers and actions for auth state management.
 *
 * State shape:
 * @property {User | null} user - Currently authenticated user or null
 * @property {string | null} token - JWT authentication token or null
 * @property {boolean} isAuthenticated - Whether user is currently authenticated
 * @property {boolean} loading - Whether an auth operation is in progress
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Logs out the current user.
     *
     * Clears the JWT token from localStorage and resets the authentication
     * state to its initial logged-out state.
     *
     * @param {AuthState} state - Current authentication state
     *
     * @example
     * ```typescript
     * import { useAppDispatch } from '@/store/hooks';
     * import { logout } from '@/store/slices/authSlice';
     *
     * function LogoutButton() {
     *   const dispatch = useAppDispatch();
     *
     *   const handleLogout = () => {
     *     dispatch(logout());
     *     // User will be redirected to login page
     *   };
     * }
     * ```
     */
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    /**
     * Sets the current user in state.
     *
     * Updates the user object in the authentication state. This is typically
     * used after profile updates or when manually setting user data.
     *
     * @param {AuthState} state - Current authentication state
     * @param {PayloadAction<User>} action - Action containing the user data
     *
     * @example
     * ```typescript
     * import { useAppDispatch } from '@/store/hooks';
     * import { setUser } from '@/store/slices/authSlice';
     *
     * function ProfileUpdate() {
     *   const dispatch = useAppDispatch();
     *
     *   const handleProfileUpdate = (updatedUser: User) => {
     *     dispatch(setUser(updatedUser));
     *   };
     * }
     * ```
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    /**
     * Hydrates authentication state from localStorage.
     *
     * Restores the authentication token and user data from localStorage.
     * This should be called when the client-side app initializes to restore
     * a user's session after page refresh.
     *
     * @param {AuthState} state - Current authentication state
     *
     * @example
     * ```typescript
     * import { useEffect } from 'react';
     * import { useAppDispatch } from '@/store/hooks';
     * import { hydrate } from '@/store/slices/authSlice';
     *
     * function App() {
     *   const dispatch = useAppDispatch();
     *
     *   useEffect(() => {
     *     // Hydrate auth state from localStorage on app mount
     *     dispatch(hydrate());
     *   }, [dispatch]);
     * }
     * ```
     */
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
      // Login lifecycle
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
      // Get current user lifecycle
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setUser, hydrate } = authSlice.actions;
export default authSlice.reducer;
