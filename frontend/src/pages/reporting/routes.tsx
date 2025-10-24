/**
 * @fileoverview Route configuration for the Reporting module.
 *
 * Defines the routing structure for all reporting-related pages using React Router v6.
 * Maps URL paths to corresponding page components for the Reporting module.
 *
 * Routes:
 * - `/` - Main reporting dashboard (ReportingMain)
 * - `/create` - Create new report form
 * - `/new` - Alias for create (same as /create)
 * - `/:id` - View report details by ID
 * - `/:id/edit` - Edit existing report by ID
 *
 * @module pages/reporting/routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReportingMain from './ReportingMain';
import ReportingDetail from './ReportingDetail';
import ReportingCreate from './ReportingCreate';
import ReportingEdit from './ReportingEdit';

/**
 * Routing component for the Reporting module.
 *
 * Configures all routes for reporting pages including main dashboard,
 * create, detail, and edit views. Uses React Router v6 nested routing.
 *
 * @component
 * @returns {JSX.Element} Routes configuration for reporting module
 *
 * @example
 * ```tsx
 * import ReportingRoutes from './routes';
 *
 * // In main app router
 * <Route path="/reporting/*" element={<ReportingRoutes />} />
 * ```
 */
export const ReportingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ReportingMain />} />
      <Route path="/create" element={<ReportingCreate />} />
      <Route path="/new" element={<ReportingCreate />} />
      <Route path="/:id" element={<ReportingDetail />} />
      <Route path="/:id/edit" element={<ReportingEdit />} />
    </Routes>
  );
};

export default ReportingRoutes;
