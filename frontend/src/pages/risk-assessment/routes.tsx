/**
 * @fileoverview Route configuration for Risk Assessment. Defines routing structure and navigation.
 * 
 * @module pages/risk-assessment/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RiskAssessmentMain from './RiskAssessmentMain';
import RiskAssessmentDetail from './RiskAssessmentDetail';
import RiskAssessmentCreate from './RiskAssessmentCreate';
import RiskAssessmentEdit from './RiskAssessmentEdit';

export const RiskAssessmentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RiskAssessmentMain />} />
      <Route path="/create" element={<RiskAssessmentCreate />} />
      <Route path="/new" element={<RiskAssessmentCreate />} />
      <Route path="/:id" element={<RiskAssessmentDetail />} />
      <Route path="/:id/edit" element={<RiskAssessmentEdit />} />
    </Routes>
  );
};

export default RiskAssessmentRoutes;
