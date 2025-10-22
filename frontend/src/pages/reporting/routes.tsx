import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReportingMain from './ReportingMain';
import ReportingDetail from './ReportingDetail';
import ReportingCreate from './ReportingCreate';
import ReportingEdit from './ReportingEdit';

export const ReportingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ReportingMain />} />
      <Route path="/create" element={<ReportingCreate />} />
      <Route path="/new" element={<ReportingCreate />} />
      <Route path="/:id" element={<ReportingDetail />} />
      <Route path="/:id/edit" element={<ReportingEdit />} />
    </Routes>
  );
};

export default ReportingRoutes;
