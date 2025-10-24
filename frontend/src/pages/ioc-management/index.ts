/**
 * @fileoverview Module exports for IoC Management.
 *
 * Central export point for all IoC Management module components, routes,
 * and store-related items. Provides a clean public API for the module.
 *
 * ## Exports
 * - Store: Redux slice, reducers, actions, and async thunks
 * - Components: Main, Detail, Create, Edit pages
 * - Routes: Router configuration for the module
 *
 * @module pages/ioc-management
 */

export * from './store';
export { default as IoCManagementMain } from './IoCManagementMain';
export { default as IoCManagementDetail } from './IoCManagementDetail';
export { default as IoCManagementCreate } from './IoCManagementCreate';
export { default as IoCManagementEdit } from './IoCManagementEdit';
export { default as IoCManagementRoutes } from './routes';
