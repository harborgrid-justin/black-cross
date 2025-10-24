/**
 * @fileoverview Route configuration for the Risk Assessment module.
 *
 * Defines the routing structure for all risk assessment pages using React Router v6.
 * Maps URL paths to corresponding page components for the Risk Assessment module.
 *
 * Routes:
 * - `/` - Main risk assessment dashboard (RiskAssessmentMain)
 * - `/create` - Create new risk assessment form
 * - `/new` - Alias for create (same as /create)
 * - `/:id` - View risk assessment details by ID
 * - `/:id/edit` - Edit existing risk assessment by ID
 *
 * @module pages/risk-assessment/routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RiskAssessmentMain from './RiskAssessmentMain';
import RiskAssessmentDetail from './RiskAssessmentDetail';
import RiskAssessmentCreate from './RiskAssessmentCreate';
import RiskAssessmentEdit from './RiskAssessmentEdit';

/**
 * Routing component for the Risk Assessment module.
 *
 * Configures all routes for risk assessment pages including main dashboard,
 * create, detail, and edit views. Uses React Router v6 nested routing.
 *
 * @component
 * @returns {JSX.Element} Routes configuration for risk assessment module
 *
 * @example
 * ```tsx
 * import RiskAssessmentRoutes from './routes';
 *
 * // In main app router
 * <Route path="/risk-assessment/*" element={<RiskAssessmentRoutes />} />
 * ```
 */
export const RiskAssessmentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RiskAssessmentMain />} />
      <Route path="/create" element={<RiskAssessmentCreate />} />
      <Route path="/new" element={<RiskAssessmentCreate />} />
      <Route path="/:id" element={<RiskAssessmentDetail />} />
      <Route path="/:id/edit" element={<RiskAssessmentEdit />} />
    </Routes>
  );
};

export default RiskAssessmentRoutes;
