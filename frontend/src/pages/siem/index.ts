/**
 * @fileoverview Central export point for the SIEM module.
 *
 * Provides a single import location for all SIEM module components,
 * Redux store exports, and routing configuration. This barrel export pattern
 * simplifies imports throughout the application.
 *
 * Exports:
 * - All Redux store exports (actions, reducer, thunks) from './store'
 * - SiemMain - Main SIEM dashboard component
 * - SiemDetail - Event detail view component
 * - SiemCreate - Event creation/configuration form component
 * - SiemEdit - Event editing form component
 * - SiemRoutes - React Router configuration
 *
 * @module pages/siem
 *
 * @example
 * ```tsx
 * // Import multiple exports from single location
 * import {
 *   SiemMain,
 *   SiemRoutes,
 *   fetchSIEMLogs,
 *   fetchSIEMAlerts,
 *   siemReducer
 * } from '@/pages/siem';
 * ```
 */

export * from './store';
export { default as SiemMain } from './SiemMain';
export { default as SiemDetail } from './SiemDetail';
export { default as SiemCreate } from './SiemCreate';
export { default as SiemEdit } from './SiemEdit';
export { default as SiemRoutes } from './routes';
