/**
 * @fileoverview Central export point for the Risk Assessment module.
 *
 * Provides a single import location for all Risk Assessment module components,
 * Redux store exports, and routing configuration. This barrel export pattern
 * simplifies imports throughout the application.
 *
 * Exports:
 * - All Redux store exports (actions, reducer, thunks) from './store'
 * - RiskAssessmentMain - Main dashboard component
 * - RiskAssessmentDetail - Assessment detail view component
 * - RiskAssessmentCreate - Assessment creation form component
 * - RiskAssessmentEdit - Assessment editing form component
 * - RiskAssessmentRoutes - React Router configuration
 *
 * @module pages/risk-assessment
 *
 * @example
 * ```tsx
 * // Import multiple exports from single location
 * import {
 *   RiskAssessmentMain,
 *   RiskAssessmentRoutes,
 *   fetchRiskAssessments,
 *   riskReducer
 * } from '@/pages/risk-assessment';
 * ```
 */

export * from './store';
export { default as RiskAssessmentMain } from './RiskAssessmentMain';
export { default as RiskAssessmentDetail } from './RiskAssessmentDetail';
export { default as RiskAssessmentCreate } from './RiskAssessmentCreate';
export { default as RiskAssessmentEdit } from './RiskAssessmentEdit';
export { default as RiskAssessmentRoutes } from './routes';
