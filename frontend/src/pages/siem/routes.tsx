/**
 * @fileoverview Route configuration for Siem. Defines routing structure and navigation.
 * 
 * @module pages/siem/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SiemMain from './SiemMain';
import SiemDetail from './SiemDetail';
import SiemCreate from './SiemCreate';
import SiemEdit from './SiemEdit';

export const SiemRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SiemMain />} />
      <Route path="/create" element={<SiemCreate />} />
      <Route path="/new" element={<SiemCreate />} />
      <Route path="/:id" element={<SiemDetail />} />
      <Route path="/:id/edit" element={<SiemEdit />} />
    </Routes>
  );
};

export default SiemRoutes;
