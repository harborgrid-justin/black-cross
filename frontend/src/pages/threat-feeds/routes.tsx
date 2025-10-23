/**
 * @fileoverview Route configuration for Threat Feeds. Defines routing structure and navigation.
 * 
 * @module pages/threat-feeds/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ThreatFeedsMain from './ThreatFeedsMain';
import ThreatFeedsDetail from './ThreatFeedsDetail';
import ThreatFeedsCreate from './ThreatFeedsCreate';
import ThreatFeedsEdit from './ThreatFeedsEdit';

export const ThreatFeedsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ThreatFeedsMain />} />
      <Route path="/create" element={<ThreatFeedsCreate />} />
      <Route path="/new" element={<ThreatFeedsCreate />} />
      <Route path="/:id" element={<ThreatFeedsDetail />} />
      <Route path="/:id/edit" element={<ThreatFeedsEdit />} />
    </Routes>
  );
};

export default ThreatFeedsRoutes;
