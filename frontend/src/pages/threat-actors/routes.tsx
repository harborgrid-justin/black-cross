/**
 * @fileoverview Route configuration for Threat Actors. Defines routing structure and navigation.
 * 
 * @module pages/threat-actors/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ThreatActorsMain from './ThreatActorsMain';
import ThreatActorsDetail from './ThreatActorsDetail';
import ThreatActorsCreate from './ThreatActorsCreate';
import ThreatActorsEdit from './ThreatActorsEdit';

export const ThreatActorsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ThreatActorsMain />} />
      <Route path="/create" element={<ThreatActorsCreate />} />
      <Route path="/new" element={<ThreatActorsCreate />} />
      <Route path="/:id" element={<ThreatActorsDetail />} />
      <Route path="/:id/edit" element={<ThreatActorsEdit />} />
    </Routes>
  );
};

export default ThreatActorsRoutes;
