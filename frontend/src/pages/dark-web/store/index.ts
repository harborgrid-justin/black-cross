/**
 * @fileoverview Dark Web store exports.
 *
 * Provides centralized exports for the Dark Web Redux slice, including the reducer,
 * actions, and async thunks. This barrel file simplifies imports of store-related
 * functionality throughout the application.
 *
 * @module pages/dark-web/store
 */

// Export all actions and thunks from the slice
export * from './darkWebSlice';

// Export the reducer as a named export for store configuration
export { default as darkWebReducer } from './darkWebSlice';
