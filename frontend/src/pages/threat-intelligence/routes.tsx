/**
 * WF-COMP-004 | routes.tsx - Threat Intelligence page routes
 * Purpose: Threat Intelligence route configuration with role-based protection
 * Related: ProtectedRoute, threat intelligence components
 * Last Updated: 2025-10-22 | File Type: .tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ThreatIntelligenceMain from './ThreatIntelligenceMain';
import ThreatIntelligenceDetail from './ThreatIntelligenceDetail';
import ThreatIntelligenceCreate from './ThreatIntelligenceCreate';
import ThreatIntelligenceEdit from './ThreatIntelligenceEdit';

export const ThreatIntelligenceRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Threat Intelligence List/Dashboard */}
      <Route path="/" element={<ThreatIntelligenceMain />} />

      {/* Create New Threat Intelligence Item */}
      <Route path="/create" element={<ThreatIntelligenceCreate />} />
      <Route path="/new" element={<ThreatIntelligenceCreate />} />

      {/* View Threat Intelligence Item Details */}
      <Route path="/:id" element={<ThreatIntelligenceDetail />} />

      {/* Edit Threat Intelligence Item */}
      <Route path="/:id/edit" element={<ThreatIntelligenceEdit />} />
    </Routes>
  );
};

export default ThreatIntelligenceRoutes;
