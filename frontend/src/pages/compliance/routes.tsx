import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ComplianceMain from './ComplianceMain';
import ComplianceDetail from './ComplianceDetail';
import ComplianceCreate from './ComplianceCreate';
import ComplianceEdit from './ComplianceEdit';

export const ComplianceRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ComplianceMain />} />
      <Route path="/create" element={<ComplianceCreate />} />
      <Route path="/new" element={<ComplianceCreate />} />
      <Route path="/:id" element={<ComplianceDetail />} />
      <Route path="/:id/edit" element={<ComplianceEdit />} />
    </Routes>
  );
};

export default ComplianceRoutes;
