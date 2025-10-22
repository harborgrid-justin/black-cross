/**
 * WF-COMP-011 | index.ts - Incident Response page exports
 * Purpose: Centralized exports for incident response page module
 * Last Updated: 2025-10-22 | File Type: .ts
 */

// Store exports
export * from './store';

// Component exports
export { default as IncidentResponseMain } from './IncidentResponseMain';
export { default as IncidentResponseDetail } from './IncidentResponseDetail';
export { default as IncidentResponseCreate } from './IncidentResponseCreate';
export { default as IncidentResponseEdit } from './IncidentResponseEdit';

// Route exports
export { default as IncidentResponseRoutes } from './routes';
