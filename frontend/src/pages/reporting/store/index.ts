/**
 * @fileoverview Central export point for Reporting Redux store.
 *
 * Provides a single import location for all Redux-related exports including:
 * - reportingSlice actions (clearSelectedReport, clearError)
 * - Async thunks (fetchReports, fetchMetrics)
 * - reportingReducer for store configuration
 * - Type definitions (Report, Metric, ReportingState)
 *
 * @module pages/reporting/store
 *
 * @example
 * ```tsx
 * // Import store exports
 * import {
 *   reportingReducer,
 *   fetchReports,
 *   clearSelectedReport
 * } from '@/pages/reporting/store';
 *
 * // Use in Redux store configuration
 * const store = configureStore({
 *   reducer: {
 *     reporting: reportingReducer
 *   }
 * });
 *
 * // Use in components
 * dispatch(fetchReports());
 * dispatch(clearSelectedReport());
 * ```
 */

export * from './reportingSlice';
export { default as reportingReducer } from './reportingSlice';
