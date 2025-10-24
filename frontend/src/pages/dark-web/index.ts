/**
 * @fileoverview Module export point for Dark Web monitoring feature.
 *
 * Provides centralized exports for all Dark Web module components, routes, and Redux
 * store functionality. This barrel file simplifies imports throughout the application
 * by providing a single import location for all dark web-related functionality.
 *
 * @module pages/dark-web
 */

// Export all Redux store functionality (actions, reducers, thunks)
export * from './store';

// Export page components
export { default as DarkWebMain } from './DarkWebMain';
export { default as DarkWebDetail } from './DarkWebDetail';
export { default as DarkWebCreate } from './DarkWebCreate';
export { default as DarkWebEdit } from './DarkWebEdit';

// Export route configuration
export { default as DarkWebRoutes } from './routes';
