/**
 * @fileoverview Case Management routes configuration.
 */

import { Routes, Route } from 'react-router-dom';
import CaseManagementPage from './CaseManagementPage';

export default function CaseManagementRoutes() {
  return (
    <Routes>
      <Route index element={<CaseManagementPage />} />
    </Routes>
  );
}
