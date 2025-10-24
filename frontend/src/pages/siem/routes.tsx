/**
 * @fileoverview Route configuration for the SIEM module.
 *
 * Defines the routing structure for all SIEM-related pages using React Router v6.
 * Maps URL paths to corresponding page components for the SIEM module.
 *
 * Routes:
 * - `/` - Main SIEM dashboard (SiemMain)
 * - `/create` - Create new event/rule configuration form
 * - `/new` - Alias for create (same as /create)
 * - `/:id` - View event/alert details by ID
 * - `/:id/edit` - Edit existing event/alert by ID
 *
 * @module pages/siem/routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SiemMain from './SiemMain';
import SiemDetail from './SiemDetail';
import SiemCreate from './SiemCreate';
import SiemEdit from './SiemEdit';

/**
 * Routing component for the SIEM module.
 *
 * Configures all routes for SIEM pages including main dashboard,
 * create, detail, and edit views. Uses React Router v6 nested routing.
 *
 * @component
 * @returns {JSX.Element} Routes configuration for SIEM module
 *
 * @example
 * ```tsx
 * import SiemRoutes from './routes';
 *
 * // In main app router
 * <Route path="/siem/*" element={<SiemRoutes />} />
 * ```
 */
export const SiemRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SiemMain />} />
      <Route path="/create" element={<SiemCreate />} />
      <Route path="/new" element={<SiemCreate />} />
      <Route path="/:id" element={<SiemDetail />} />
      <Route path="/:id/edit" element={<SiemEdit />} />
    </Routes>
  );
};

export default SiemRoutes;
