/**
 * @fileoverview Automation module route configuration.
 *
 * Defines the complete routing structure for the automation module including
 * list, detail, create, and edit views. Supports nested routing with dynamic
 * parameters for playbook operations.
 *
 * **Routes:**
 * - `/automation` - Main playbooks list (AutomationMain)
 * - `/automation/create` - Create new playbook (AutomationCreate)
 * - `/automation/new` - Alternative create route (AutomationCreate)
 * - `/automation/:id` - Playbook detail view (AutomationDetail)
 * - `/automation/:id/edit` - Edit playbook (AutomationEdit)
 *
 * **Route Structure:**
 * - Base path: `/automation`
 * - Dynamic segments: `:id` for playbook identification
 * - Multiple aliases for create routes (/create and /new)
 *
 * @module pages/automation/routes
 *
 * @example
 * ```tsx
 * import { AutomationRoutes } from '@/pages/automation';
 *
 * <Route path="/automation/*" element={<AutomationRoutes />} />
 * ```
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AutomationMain from './AutomationMain';
import AutomationDetail from './AutomationDetail';
import AutomationCreate from './AutomationCreate';
import AutomationEdit from './AutomationEdit';

/**
 * AutomationRoutes component providing nested routing for automation module.
 *
 * Configures all sub-routes for automation features with proper component mapping
 * and parameter extraction. Uses React Router v6 Routes/Route pattern.
 *
 * @component
 * @returns {JSX.Element} Configured Routes component with automation sub-routes
 *
 * @example
 * ```tsx
 * <AutomationRoutes />
 * ```
 */
export const AutomationRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AutomationMain />} />
      <Route path="/create" element={<AutomationCreate />} />
      <Route path="/new" element={<AutomationCreate />} />
      <Route path="/:id" element={<AutomationDetail />} />
      <Route path="/:id/edit" element={<AutomationEdit />} />
    </Routes>
  );
};

export default AutomationRoutes;
