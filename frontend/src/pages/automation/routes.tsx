/**
 * @fileoverview Route configuration for Automation. Defines routing structure and navigation.
 * 
 * @module pages/automation/routes.tsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AutomationMain from './AutomationMain';
import AutomationDetail from './AutomationDetail';
import AutomationCreate from './AutomationCreate';
import AutomationEdit from './AutomationEdit';

export const AutomationRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AutomationMain />} />
      <Route path="/create" element={<AutomationCreate />} />
      <Route path="/new" element={<AutomationCreate />} />
      <Route path="/:id" element={<AutomationDetail />} />
      <Route path="/:id/edit" element={<AutomationEdit />} />
    </Routes>
  );
};

export default AutomationRoutes;
