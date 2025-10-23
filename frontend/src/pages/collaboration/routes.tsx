/**
 * @fileoverview Route configuration for Collaboration. Defines routing structure and navigation.
 * 
 * @module pages/collaboration/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CollaborationMain from './CollaborationMain';
import CollaborationDetail from './CollaborationDetail';
import CollaborationCreate from './CollaborationCreate';
import CollaborationEdit from './CollaborationEdit';

export const CollaborationRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<CollaborationMain />} />
      <Route path="/create" element={<CollaborationCreate />} />
      <Route path="/new" element={<CollaborationCreate />} />
      <Route path="/:id" element={<CollaborationDetail />} />
      <Route path="/:id/edit" element={<CollaborationEdit />} />
    </Routes>
  );
};

export default CollaborationRoutes;
