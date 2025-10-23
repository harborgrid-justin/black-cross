/**
 * @fileoverview Draft Workspace routes configuration.
 */

import { Routes, Route } from 'react-router-dom';
import DraftWorkspacePage from './DraftWorkspacePage';

export default function DraftWorkspaceRoutes() {
  return (
    <Routes>
      <Route index element={<DraftWorkspacePage />} />
    </Routes>
  );
}
