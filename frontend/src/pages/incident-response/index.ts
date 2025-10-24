/**
 * @fileoverview Module export point for Incident Response feature.
 *
 * Provides centralized exports for all Incident Response module components, routes,
 * and Redux store functionality. This barrel file simplifies imports throughout the
 * application by providing a single import location for all incident response-related
 * functionality.
 *
 * @module pages/incident-response
 */

// Export all Redux store functionality (actions, reducers, thunks)
export * from './store';

// Export page components
export { default as IncidentResponseMain } from './IncidentResponseMain';
export { default as IncidentResponseDetail } from './IncidentResponseDetail';
export { default as IncidentResponseCreate } from './IncidentResponseCreate';
export { default as IncidentResponseEdit } from './IncidentResponseEdit';

// Export route configuration
export { default as IncidentResponseRoutes } from './routes';
