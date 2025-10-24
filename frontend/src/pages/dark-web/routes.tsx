/**
 * @fileoverview Route configuration for Dark Web monitoring module.
 *
 * Defines the routing structure and navigation paths for all dark web monitoring
 * pages. Implements RESTful route patterns with support for listing, viewing,
 * creating, and editing dark web findings.
 *
 * @module pages/dark-web/routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DarkWebMain from './DarkWebMain';
import DarkWebDetail from './DarkWebDetail';
import DarkWebCreate from './DarkWebCreate';
import DarkWebEdit from './DarkWebEdit';

/**
 * Dark Web routes component.
 *
 * Configures all routes for the dark web monitoring module using React Router v6.
 * Implements a RESTful routing pattern with support for CRUD operations on findings.
 *
 * @component
 *
 * @returns {JSX.Element} Configured routes for dark web module
 *
 * @remarks
 * Route structure:
 * - `/dark-web/` - Main dashboard with findings list and statistics
 * - `/dark-web/create` or `/dark-web/new` - Create new finding form
 * - `/dark-web/:id` - View specific finding details
 * - `/dark-web/:id/edit` - Edit existing finding
 *
 * All routes should be wrapped with authentication and authorization middleware
 * at the application level to ensure only authorized security personnel can access
 * dark web monitoring features.
 *
 * @security
 * - These routes should be protected with authentication middleware
 * - Implement role-based access control for sensitive operations
 * - Audit all access to dark web findings for compliance
 *
 * @example
 * ```tsx
 * // Used in main application routing
 * <Route path="/dark-web/*" element={<DarkWebRoutes />} />
 * ```
 *
 * @see {@link DarkWebMain} for the main dashboard component
 */
export const DarkWebRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DarkWebMain />} />
      <Route path="/create" element={<DarkWebCreate />} />
      <Route path="/new" element={<DarkWebCreate />} />
      <Route path="/:id" element={<DarkWebDetail />} />
      <Route path="/:id/edit" element={<DarkWebEdit />} />
    </Routes>
  );
};

export default DarkWebRoutes;
