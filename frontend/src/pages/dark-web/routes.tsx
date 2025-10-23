/**
 * @fileoverview Route configuration for Dark Web. Defines routing structure and navigation.
 * 
 * @module pages/dark-web/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DarkWebMain from './DarkWebMain';
import DarkWebDetail from './DarkWebDetail';
import DarkWebCreate from './DarkWebCreate';
import DarkWebEdit from './DarkWebEdit';

export const DarkWebRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DarkWebMain />} />
      <Route path="/create" element={<DarkWebCreate />} />
      <Route path="/new" element={<DarkWebCreate />} />
      <Route path="/:id" element={<DarkWebDetail />} />
      <Route path="/:id/edit" element={<DarkWebEdit />} />
    </Routes>
  );
};

export default DarkWebRoutes;
