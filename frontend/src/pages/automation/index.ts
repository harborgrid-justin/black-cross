/**
 * @fileoverview Automation module exports.
 *
 * Central export point for all automation-related components, routes, and store elements.
 * Provides a unified interface for importing automation functionality throughout the application.
 *
 * **Exported Components:**
 * - AutomationMain: Primary playbooks list page
 * - AutomationDetail: Single playbook detail view
 * - AutomationCreate: New playbook creation form
 * - AutomationEdit: Existing playbook edit form
 * - AutomationRoutes: Complete routing configuration
 *
 * **Exported Store:**
 * - All actions, reducers, and thunks from automationSlice
 * - State types and interfaces
 *
 * @module pages/automation
 *
 * @example
 * ```tsx
 * import {
 *   AutomationMain,
 *   AutomationRoutes,
 *   fetchPlaybooks
 * } from '@/pages/automation';
 * ```
 */

export * from './store';
export { default as AutomationMain } from './AutomationMain';
export { default as AutomationDetail } from './AutomationDetail';
export { default as AutomationCreate } from './AutomationCreate';
export { default as AutomationEdit } from './AutomationEdit';
export { default as AutomationRoutes } from './routes';
