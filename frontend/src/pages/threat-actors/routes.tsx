/**
 * @fileoverview Route Configuration for Threat Actors Module.
 *
 * Defines the routing structure and navigation paths for the Threat Actors feature
 * module. Implements React Router v6 patterns with nested route configuration for
 * CRUD operations on threat actor profiles.
 *
 * Route structure:
 * - `/` - Main threat actors list page (ThreatActorsMain)
 * - `/create` - Create new threat actor profile (ThreatActorsCreate)
 * - `/new` - Alias for create route (ThreatActorsCreate)
 * - `/:id` - View threat actor details (ThreatActorsDetail)
 * - `/:id/edit` - Edit threat actor profile (ThreatActorsEdit)
 *
 * All routes are nested under the `/threat-actors` base path defined in the
 * main application router.
 *
 * @module pages/threat-actors/routes
 * @requires react - React library
 * @requires react-router-dom - React Router for navigation
 *
 * @example
 * ```tsx
 * import ThreatActorsRoutes from './pages/threat-actors/routes';
 *
 * // In main app router
 * <Route path="/threat-actors/*" element={<ThreatActorsRoutes />} />
 * ```
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ThreatActorsMain from './ThreatActorsMain';
import ThreatActorsDetail from './ThreatActorsDetail';
import ThreatActorsCreate from './ThreatActorsCreate';
import ThreatActorsEdit from './ThreatActorsEdit';

/**
 * Threat Actors Routes Component.
 *
 * Functional component that defines the complete routing structure for the
 * Threat Actors module using React Router v6. Handles all CRUD navigation
 * paths with dynamic ID parameters for detail and edit operations.
 *
 * Route hierarchy:
 * 1. Main list view at root path
 * 2. Creation forms at /create and /new
 * 3. Detail view with dynamic :id parameter
 * 4. Edit form with :id/edit pattern
 *
 * @returns {JSX.Element} Routes container with threat actor navigation paths
 */
export const ThreatActorsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ThreatActorsMain />} />
      <Route path="/create" element={<ThreatActorsCreate />} />
      <Route path="/new" element={<ThreatActorsCreate />} />
      <Route path="/:id" element={<ThreatActorsDetail />} />
      <Route path="/:id/edit" element={<ThreatActorsEdit />} />
    </Routes>
  );
};

export default ThreatActorsRoutes;
