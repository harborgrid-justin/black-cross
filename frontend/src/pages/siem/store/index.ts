/**
 * @fileoverview Central export point for SIEM Redux store.
 *
 * Provides a single import location for all Redux-related exports including:
 * - siemSlice actions (clearError, updateStats)
 * - Async thunks (fetchSIEMLogs, fetchSIEMAlerts)
 * - siemReducer for store configuration
 * - Type definitions (SIEMState, LogEntry, SecurityAlert)
 *
 * @module pages/siem/store
 *
 * @example
 * ```tsx
 * // Import store exports
 * import {
 *   siemReducer,
 *   fetchSIEMLogs,
 *   fetchSIEMAlerts,
 *   clearError,
 *   updateStats
 * } from '@/pages/siem/store';
 *
 * // Use in Redux store configuration
 * const store = configureStore({
 *   reducer: {
 *     siem: siemReducer
 *   }
 * });
 *
 * // Use in components
 * dispatch(fetchSIEMLogs({ search: 'firewall' }));
 * dispatch(fetchSIEMAlerts());
 * ```
 */

export * from './siemSlice';
export { default as siemReducer } from './siemSlice';
