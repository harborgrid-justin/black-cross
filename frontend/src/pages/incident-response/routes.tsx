/**
 * @fileoverview Route configuration for Incident Response module.
 *
 * Defines the routing structure and navigation paths for all incident response
 * pages. Implements RESTful route patterns with support for listing, viewing,
 * creating, and editing security incidents.
 *
 * @module pages/incident-response/routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IncidentResponseMain from './IncidentResponseMain';
import IncidentResponseDetail from './IncidentResponseDetail';
import IncidentResponseCreate from './IncidentResponseCreate';
import IncidentResponseEdit from './IncidentResponseEdit';

/**
 * Incident Response routes component.
 *
 * Configures all routes for the incident response module using React Router v6.
 * Implements a RESTful routing pattern with support for CRUD operations on incidents.
 *
 * @component
 *
 * @returns {JSX.Element} Configured routes for incident response module
 *
 * @remarks
 * Route structure:
 * - `/incident-response/` - Main dashboard with incident list and statistics
 * - `/incident-response/create` or `/incident-response/new` - Create new incident form
 * - `/incident-response/:id` - View specific incident details
 * - `/incident-response/:id/edit` - Edit existing incident
 *
 * All routes should be wrapped with authentication and authorization middleware
 * at the application level to ensure only authorized security personnel can access
 * incident response features.
 *
 * @security
 * - These routes should be protected with authentication middleware
 * - Implement role-based access control for sensitive operations
 * - Audit all access to incidents for compliance and forensics
 * - Consider additional permissions for critical incident operations
 *
 * @example
 * ```tsx
 * // Used in main application routing
 * <Route path="/incident-response/*" element={<IncidentResponseRoutes />} />
 * ```
 *
 * @see {@link IncidentResponseMain} for the main dashboard component
 */
export const IncidentResponseRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Incident Response List/Dashboard */}
      <Route path="/" element={<IncidentResponseMain />} />

      {/* Create New Incident Response Item */}
      <Route path="/create" element={<IncidentResponseCreate />} />
      <Route path="/new" element={<IncidentResponseCreate />} />

      {/* View Incident Response Item Details */}
      <Route path="/:id" element={<IncidentResponseDetail />} />

      {/* Edit Incident Response Item */}
      <Route path="/:id/edit" element={<IncidentResponseEdit />} />
    </Routes>
  );
};

export default IncidentResponseRoutes;
