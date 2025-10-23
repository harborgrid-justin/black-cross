/**
 * @fileoverview Notifications routes configuration.
 */

import { Routes, Route } from 'react-router-dom';
import NotificationsPage from './NotificationsPage';

export default function NotificationsRoutes() {
  return (
    <Routes>
      <Route index element={<NotificationsPage />} />
    </Routes>
  );
}
