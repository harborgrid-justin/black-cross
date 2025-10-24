/**
 * @fileoverview Route configuration for Metrics & Analytics module.
 *
 * Defines the routing structure for the Metrics feature.
 * Currently contains a single index route to the main metrics page.
 *
 * ## Routes
 * - `/` - Main metrics and analytics dashboard (MetricsPage)
 *
 * @module pages/metrics/routes
 */

import { Routes, Route } from 'react-router-dom';
import MetricsPage from './MetricsPage';

/**
 * Metrics routes component.
 *
 * Configures and renders the route definitions for the Metrics module.
 * Handles all navigation within the /metrics/* path.
 *
 * @component
 * @returns {JSX.Element} Routes configuration for Metrics
 *
 * @example
 * ```tsx
 * <Route path="/metrics/*" element={<MetricsRoutes />} />
 * ```
 */
export default function MetricsRoutes() {
  return (
    <Routes>
      <Route index element={<MetricsPage />} />
    </Routes>
  );
}
