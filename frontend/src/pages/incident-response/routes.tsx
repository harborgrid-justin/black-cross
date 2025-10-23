/**
 * @fileoverview Route configuration for Incident Response. Defines routing structure and navigation.
 * 
 * @module pages/incident-response/routes.tsx
 */

/**
 * WF-COMP-010 | routes.tsx - Incident Response page routes
 * Purpose: Incident Response route configuration with role-based protection
 * Related: ProtectedRoute, incident response components
 * Last Updated: 2025-10-22 | File Type: .tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IncidentResponseMain from './IncidentResponseMain';
import IncidentResponseDetail from './IncidentResponseDetail';
import IncidentResponseCreate from './IncidentResponseCreate';
import IncidentResponseEdit from './IncidentResponseEdit';

export const IncidentResponseRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Incident Response List/Dashboard */}
      <Route path="/" element={<IncidentResponseMain />} />

      {/* Create New Incident Response Item */}
      <Route path="/create" element={<IncidentResponseCreate />} />
      <Route path="/new" element={<IncidentResponseCreate />} />

      {/* View Incident Response Item Details */}
      <Route path="/:id" element={<IncidentResponseDetail />} />

      {/* Edit Incident Response Item */}
      <Route path="/:id/edit" element={<IncidentResponseEdit />} />
    </Routes>
  );
};

export default IncidentResponseRoutes;
