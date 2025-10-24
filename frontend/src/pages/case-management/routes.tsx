/**
 * @fileoverview Case Management module route configuration.
 *
 * Defines routing structure for the case management module. Currently
 * consists of a single index route displaying the main case list page.
 *
 * **Routes:**
 * - `/case-management` (index) - Main case management page
 *
 * **Future Routes (To Be Implemented):**
 * - `/case-management/create` - Create new case
 * - `/case-management/:id` - Case detail view
 * - `/case-management/:id/edit` - Edit existing case
 *
 * @module pages/case-management/routes
 *
 * @example
 * ```tsx
 * import CaseManagementRoutes from '@/pages/case-management/routes';
 *
 * <Route path="/case-management/*" element={<CaseManagementRoutes />} />
 * ```
 */

import { Routes, Route } from 'react-router-dom';
import CaseManagementPage from './CaseManagementPage';

/**
 * CaseManagementRoutes component providing routing for case management module.
 *
 * Configures routes for case management features. Currently implements
 * only the index route; detail and CRUD routes to be added.
 *
 * @component
 * @returns {JSX.Element} Configured Routes component with case management routes
 *
 * @example
 * ```tsx
 * <CaseManagementRoutes />
 * ```
 */
export default function CaseManagementRoutes() {
  return (
    <Routes>
      <Route index element={<CaseManagementPage />} />
    </Routes>
  );
}
