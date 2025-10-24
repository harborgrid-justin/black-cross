/**
 * @fileoverview Redux store configuration. Combines all slices and configures the Redux store with middleware.
 *
 * This module creates and configures the central Redux store for the Black-Cross threat intelligence platform.
 * The store combines 17 feature slices covering authentication, threat management, incident response,
 * vulnerability tracking, and other security operations.
 *
 * Redux Toolkit is used for efficient store configuration with built-in best practices including:
 * - Immutability enforcement with Immer
 * - Redux DevTools integration (development only)
 * - Thunk middleware for async operations
 * - Serializable state checking
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

/**
 * The configured Redux store instance for the application.
 *
 * Combines 17 feature slices:
 * - auth: User authentication and session management
 * - threats: Threat intelligence data and analysis
 * - incidents: Security incident tracking and response
 * - vulnerabilities: Vulnerability assessments and tracking
 * - iocs: Indicators of Compromise (IoC) management
 * - risk: Risk assessment and scoring
 * - hunting: Threat hunting hypotheses and queries
 * - actors: Threat actor profiles and attribution
 * - feeds: Threat intelligence feed integration
 * - siem: Security Information and Event Management
 * - collaboration: Team communication and workspaces
 * - reporting: Report generation and metrics
 * - malware: Malware sample analysis
 * - darkWeb: Dark web monitoring and findings
 * - compliance: Compliance framework tracking
 * - automation: Security playbook automation
 * - dashboard: Dashboard statistics and widgets
 *
 * @example
 * ```typescript
 * // Access the store in React components via hooks
 * import { useAppDispatch, useAppSelector } from './hooks';
 *
 * function MyComponent() {
 *   const dispatch = useAppDispatch();
 *   const threats = useAppSelector((state) => state.threats.threats);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Wrap app with Provider in main entry point
 * import { Provider } from 'react-redux';
 * import { store } from './store';
 *
 * ReactDOM.render(
 *   <Provider store={store}>
 *     <App />
 *   </Provider>,
 *   document.getElementById('root')
 * );
 * ```
 */
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

/**
 * Root state type representing the entire Redux store state tree.
 *
 * Inferred from the store's reducer configuration, ensuring type safety
 * when selecting state in components.
 *
 * @typedef {ReturnType<typeof store.getState>} RootState
 *
 * @example
 * ```typescript
 * import type { RootState } from './store';
 *
 * // Type-safe selector
 * const selectThreats = (state: RootState) => state.threats.threats;
 * ```
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * App dispatch type including support for async thunks.
 *
 * Inferred from the store's dispatch function, ensuring type safety
 * when dispatching actions and thunks.
 *
 * @typedef {typeof store.dispatch} AppDispatch
 *
 * @example
 * ```typescript
 * import type { AppDispatch } from './store';
 *
 * // Type-safe dispatch
 * const dispatch: AppDispatch = useDispatch();
 * dispatch(fetchThreats());
 * ```
 */
export type AppDispatch = typeof store.dispatch;
