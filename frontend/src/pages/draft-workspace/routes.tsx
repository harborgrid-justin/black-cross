/**
 * @fileoverview Draft Workspace routes configuration.
 *
 * Defines the routing structure for the draft workspace module. Currently implements
 * a single route for the main draft listing page. Additional routes may be added
 * for draft detail views or editing interfaces.
 *
 * @module pages/draft-workspace/routes
 */

import { Routes, Route } from 'react-router-dom';
import DraftWorkspacePage from './DraftWorkspacePage';

/**
 * Draft Workspace routes component.
 *
 * Configures routes for the draft workspace module using React Router v6.
 * Currently provides a single route to the main draft listing page.
 *
 * @component
 *
 * @returns {JSX.Element} Configured routes for draft workspace module
 *
 * @remarks
 * Route structure:
 * - `/draft-workspace` - Main draft listing page (index route)
 *
 * Future enhancements may include:
 * - `/draft-workspace/:id` - View specific draft details
 * - `/draft-workspace/:id/edit` - Edit draft content
 * - `/draft-workspace/:id/version-history` - View version history
 *
 * @example
 * ```tsx
 * // Used in main application routing
 * <Route path="/draft-workspace/*" element={<DraftWorkspaceRoutes />} />
 * ```
 *
 * @see {@link DraftWorkspacePage} for the main component
 */
export default function DraftWorkspaceRoutes() {
  return (
    <Routes>
      <Route index element={<DraftWorkspacePage />} />
    </Routes>
  );
}
