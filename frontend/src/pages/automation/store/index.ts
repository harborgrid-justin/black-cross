/**
 * @fileoverview Automation store module exports.
 *
 * Central export point for all automation Redux slice elements including
 * actions, thunks, reducer, and TypeScript types.
 *
 * **Exported Actions:**
 * - clearSelectedPlaybook: Clear selected playbook
 * - clearError: Clear error state
 *
 * **Exported Thunks:**
 * - fetchPlaybooks: Fetch all playbooks
 * - executePlaybook: Execute specific playbook
 *
 * **Exported Reducer:**
 * - automationReducer: Main reducer function for Redux store integration
 *
 * **Exported Types:**
 * - All interfaces and types from automationSlice
 *
 * @module pages/automation/store
 *
 * @example
 * ```tsx
 * import {
 *   automationReducer,
 *   fetchPlaybooks,
 *   clearError
 * } from '@/pages/automation/store';
 * ```
 */

export * from './automationSlice';
export { default as automationReducer } from './automationSlice';
