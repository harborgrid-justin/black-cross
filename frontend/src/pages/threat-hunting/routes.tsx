/**
 * @fileoverview Route configuration for Threat Hunting. Defines routing structure and navigation.
 * 
 * @module pages/threat-hunting/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ThreatHuntingMain from './ThreatHuntingMain';
import ThreatHuntingDetail from './ThreatHuntingDetail';
import ThreatHuntingCreate from './ThreatHuntingCreate';
import ThreatHuntingEdit from './ThreatHuntingEdit';

export const ThreatHuntingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ThreatHuntingMain />} />
      <Route path="/create" element={<ThreatHuntingCreate />} />
      <Route path="/new" element={<ThreatHuntingCreate />} />
      <Route path="/:id" element={<ThreatHuntingDetail />} />
      <Route path="/:id/edit" element={<ThreatHuntingEdit />} />
    </Routes>
  );
};

export default ThreatHuntingRoutes;
