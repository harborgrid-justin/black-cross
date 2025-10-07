import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import threatReducer from './slices/threatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threats: threatReducer,
  },
  // Add dev tools and middleware configuration for better error handling
  devTools: import.meta.env.MODE !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
