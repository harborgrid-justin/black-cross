/**
 * @fileoverview Incident Response store exports.
 *
 * Provides centralized exports for the Incident Response Redux slice, including the
 * reducer, actions, and async thunks. This barrel file simplifies imports of store-related
 * functionality throughout the application.
 *
 * @module pages/incident-response/store
 */

// Export all actions and thunks from the slice
export * from './incidentSlice';

// Export the reducer as a named export for store configuration
export { default as incidentReducer } from './incidentSlice';
