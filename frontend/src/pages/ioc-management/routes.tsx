import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IoCManagementMain from './IoCManagementMain';
import IoCManagementDetail from './IoCManagementDetail';
import IoCManagementCreate from './IoCManagementCreate';
import IoCManagementEdit from './IoCManagementEdit';

export const IoCManagementRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<IoCManagementMain />} />
      <Route path="/create" element={<IoCManagementCreate />} />
      <Route path="/new" element={<IoCManagementCreate />} />
      <Route path="/:id" element={<IoCManagementDetail />} />
      <Route path="/:id/edit" element={<IoCManagementEdit />} />
    </Routes>
  );
};

export default IoCManagementRoutes;
