/**
 * @fileoverview Route configuration for Notifications module.
 *
 * Defines the routing structure for the Notifications feature.
 * Currently contains a single index route to the main notifications page.
 *
 * ## Routes
 * - `/` - Main notifications list and management page (NotificationsPage)
 *
 * @module pages/notifications/routes
 */

import { Routes, Route } from 'react-router-dom';
import NotificationsPage from './NotificationsPage';

/**
 * Notifications routes component.
 *
 * Configures and renders the route definitions for the Notifications module.
 * Handles all navigation within the /notifications/* path.
 *
 * @component
 * @returns {JSX.Element} Routes configuration for Notifications
 *
 * @example
 * ```tsx
 * <Route path="/notifications/*" element={<NotificationsRoutes />} />
 * ```
 */
export default function NotificationsRoutes() {
  return (
    <Routes>
      <Route index element={<NotificationsPage />} />
    </Routes>
  );
}
