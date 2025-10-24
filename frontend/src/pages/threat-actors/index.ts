/**
 * @fileoverview Module Export Point for Threat Actors Feature.
 *
 * Central export module for all threat actors components, routes, and state
 * management. Provides a clean interface for importing threat actor functionality
 * into the main application.
 *
 * Exported components:
 * - ThreatActorsMain: Main list and management interface
 * - ThreatActorsDetail: Individual actor detail page
 * - ThreatActorsCreate: Actor creation form
 * - ThreatActorsEdit: Actor editing form
 * - ThreatActorsRoutes: Route configuration
 *
 * Exported store:
 * - All Redux actions, thunks, and reducer from ./store
 *
 * @module pages/threat-actors
 *
 * @example
 * ```typescript
 * import {
 *   ThreatActorsRoutes,
 *   actorReducer,
 *   fetchActors
 * } from './pages/threat-actors';
 * ```
 */

export * from './store';
export { default as ThreatActorsMain } from './ThreatActorsMain';
export { default as ThreatActorsDetail } from './ThreatActorsDetail';
export { default as ThreatActorsCreate } from './ThreatActorsCreate';
export { default as ThreatActorsEdit } from './ThreatActorsEdit';
export { default as ThreatActorsRoutes } from './routes';
