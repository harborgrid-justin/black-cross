import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import threatReducer from '../pages/threat-intelligence/store/threatSlice';
import incidentReducer from './slices/incidentSlice';
import vulnerabilityReducer from './slices/vulnerabilitySlice';
import iocReducer from './slices/iocSlice';
import riskReducer from './slices/riskSlice';
import huntingReducer from './slices/huntingSlice';
import actorReducer from './slices/actorSlice';
import feedReducer from './slices/feedSlice';
import siemReducer from './slices/siemSlice';
import collaborationReducer from './slices/collaborationSlice';
import reportingReducer from './slices/reportingSlice';
import malwareReducer from './slices/malwareSlice';
import darkWebReducer from './slices/darkWebSlice';
import complianceReducer from './slices/complianceSlice';
import automationReducer from './slices/automationSlice';
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
