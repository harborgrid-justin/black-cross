/**
 * @fileoverview Redux store configuration. Combines all slices and configures the Redux store with middleware.
 * 
 * @module store
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import threatReducer from '../pages/threat-intelligence/store/threatSlice';
import incidentReducer from '../pages/incident-response/store/incidentSlice';
import vulnerabilityReducer from '../pages/vulnerability-management/store/vulnerabilitySlice';
import iocReducer from '../pages/ioc-management/store/iocSlice';
import riskReducer from '../pages/risk-assessment/store/riskSlice';
import huntingReducer from '../pages/threat-hunting/store/huntingSlice';
import actorReducer from '../pages/threat-actors/store/actorSlice';
import feedReducer from '../pages/threat-feeds/store/feedSlice';
import siemReducer from '../pages/siem/store/siemSlice';
import collaborationReducer from '../pages/collaboration/store/collaborationSlice';
import reportingReducer from '../pages/reporting/store/reportingSlice';
import malwareReducer from '../pages/malware-analysis/store/malwareSlice';
import darkWebReducer from '../pages/dark-web/store/darkWebSlice';
import complianceReducer from '../pages/compliance/store/complianceSlice';
import automationReducer from '../pages/automation/store/automationSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threats: threatReducer,
    incidents: incidentReducer,
    vulnerabilities: vulnerabilityReducer,
    iocs: iocReducer,
    risk: riskReducer,
    hunting: huntingReducer,
    actors: actorReducer,
    feeds: feedReducer,
    siem: siemReducer,
    collaboration: collaborationReducer,
    reporting: reportingReducer,
    malware: malwareReducer,
    darkWeb: darkWebReducer,
    compliance: complianceReducer,
    automation: automationReducer,
    dashboard: dashboardReducer,
  },
  // Add dev tools and middleware configuration for better error handling
  devTools: import.meta.env.MODE !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
