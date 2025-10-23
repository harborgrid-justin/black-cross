/**
 * @fileoverview Metrics routes configuration.
 */

import { Routes, Route } from 'react-router-dom';
import MetricsPage from './MetricsPage';

export default function MetricsRoutes() {
  return (
    <Routes>
      <Route index element={<MetricsPage />} />
    </Routes>
  );
}
