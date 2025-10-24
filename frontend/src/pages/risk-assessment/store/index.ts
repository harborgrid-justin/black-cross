/**
 * @fileoverview Central export point for Risk Assessment Redux store.
 *
 * Provides a single import location for all Redux-related exports including:
 * - riskSlice actions (setFilters, clearSelectedAssessment, clearError)
 * - Async thunks (fetchRiskAssessments)
 * - riskReducer for store configuration
 * - Type definitions (RiskState, RiskAssessment, FilterOptions)
 *
 * @module pages/risk-assessment/store
 *
 * @example
 * ```tsx
 * // Import store exports
 * import {
 *   riskReducer,
 *   fetchRiskAssessments,
 *   setFilters,
 *   clearSelectedAssessment
 * } from '@/pages/risk-assessment/store';
 *
 * // Use in Redux store configuration
 * const store = configureStore({
 *   reducer: {
 *     risk: riskReducer
 *   }
 * });
 *
 * // Use in components
 * dispatch(fetchRiskAssessments());
 * dispatch(setFilters({ severity: 'high' }));
 * ```
 */

export * from './riskSlice';
export { default as riskReducer } from './riskSlice';
