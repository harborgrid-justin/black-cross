/**
 * @fileoverview Route configuration for IoC Management module.
 *
 * Defines the routing structure and navigation paths for the Indicators
 * of Compromise (IoC) Management feature. Maps URL paths to their
 * corresponding page components.
 *
 * ## Routes
 * - `/` - Main IoC list view (IoCManagementMain)
 * - `/create` - Create new IoC form
 * - `/new` - Alternative path for create form
 * - `/:id` - IoC detail view for specific ID
 * - `/:id/edit` - Edit form for specific IoC
 *
 * @module pages/ioc-management/routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IoCManagementMain from './IoCManagementMain';
import IoCManagementDetail from './IoCManagementDetail';
import IoCManagementCreate from './IoCManagementCreate';
import IoCManagementEdit from './IoCManagementEdit';

/**
 * IoC Management routes component.
 *
 * Configures and renders the route definitions for the IoC Management
 * module. Handles all navigation within the /ioc-management/* path.
 *
 * @component
 * @returns {JSX.Element} Routes configuration for IoC Management
 *
 * @example
 * ```tsx
 * <Route path="/ioc-management/*" element={<IoCManagementRoutes />} />
 * ```
 */
export const IoCManagementRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<IoCManagementMain />} />
      <Route path="/create" element={<IoCManagementCreate />} />
      <Route path="/new" element={<IoCManagementCreate />} />
      <Route path="/:id" element={<IoCManagementDetail />} />
      <Route path="/:id/edit" element={<IoCManagementEdit />} />
    </Routes>
  );
};

export default IoCManagementRoutes;
