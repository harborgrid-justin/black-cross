/**
 * @fileoverview Central export point for the Reporting module.
 *
 * Provides a single import location for all Reporting module components,
 * Redux store exports, and routing configuration. This barrel export pattern
 * simplifies imports throughout the application.
 *
 * Exports:
 * - All Redux store exports (actions, reducer, thunks) from './store'
 * - ReportingMain - Main dashboard component
 * - ReportingDetail - Report detail view component
 * - ReportingCreate - Report creation form component
 * - ReportingEdit - Report editing form component
 * - ReportingRoutes - React Router configuration
 *
 * @module pages/reporting
 *
 * @example
 * ```tsx
 * // Import multiple exports from single location
 * import {
 *   ReportingMain,
 *   ReportingRoutes,
 *   fetchReports,
 *   reportingReducer
 * } from '@/pages/reporting';
 * ```
 */

export * from './store';
export { default as ReportingMain } from './ReportingMain';
export { default as ReportingDetail } from './ReportingDetail';
export { default as ReportingCreate } from './ReportingCreate';
export { default as ReportingEdit } from './ReportingEdit';
export { default as ReportingRoutes } from './routes';
