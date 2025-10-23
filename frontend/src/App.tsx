/**
 * @fileoverview Main application component for Black-Cross platform.
 * 
 * Configures routing, theming, Redux store, and lazy-loaded feature modules.
 * Implements code-splitting for optimal performance.
 * 
 * @module App
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { hydrate } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Eager load critical components
import Login from './components/auth/Login';
import SimpleDashboard from './pages/SimpleDashboard';

// Lazy load feature pages for better performance
const ThreatIntelligenceRoutes = lazy(() => import('./pages/threat-intelligence/routes'));
const IncidentResponseRoutes = lazy(() => import('./pages/incident-response/routes'));
const VulnerabilityManagementRoutes = lazy(() => import('./pages/vulnerability-management/routes'));
const RiskAssessmentRoutes = lazy(() => import('./pages/risk-assessment/routes'));
const ThreatHuntingRoutes = lazy(() => import('./pages/threat-hunting/routes'));
const ThreatActorsRoutes = lazy(() => import('./pages/threat-actors/routes'));
const IoCManagementRoutes = lazy(() => import('./pages/ioc-management/routes'));
const ThreatFeedsRoutes = lazy(() => import('./pages/threat-feeds/routes'));
const MalwareAnalysisRoutes = lazy(() => import('./pages/malware-analysis/routes'));
const DarkWebRoutes = lazy(() => import('./pages/dark-web/routes'));
const ComplianceRoutes = lazy(() => import('./pages/compliance/routes'));
const AutomationRoutes = lazy(() => import('./pages/automation/routes'));
const SiemRoutes = lazy(() => import('./pages/siem/routes'));
const CollaborationRoutes = lazy(() => import('./pages/collaboration/routes'));
const ReportingRoutes = lazy(() => import('./pages/reporting/routes'));
const NotificationsRoutes = lazy(() => import('./pages/notifications/routes'));
const CaseManagementRoutes = lazy(() => import('./pages/case-management/routes'));
const MetricsRoutes = lazy(() => import('./pages/metrics/routes'));
const DraftWorkspaceRoutes = lazy(() => import('./pages/draft-workspace/routes'));

/**
 * Loading fallback component displayed during lazy module loading.
 * 
 * @returns {JSX.Element} Centered loading spinner
 */
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}
    role="status"
    aria-label="Loading page content"
  >
    <CircularProgress />
  </Box>
);

/**
 * Dark theme configuration for the application.
 * 
 * @constant
 * @type {import('@mui/material').Theme}
 */
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

/**
 * Inner application content component that handles auth hydration and routing.
 * 
 * Hydrates authentication state from localStorage on mount and sets up
 * routing for all application pages with lazy loading.
 * 
 * @returns {JSX.Element} Application content with routes
 */
function AppContent() {
  useEffect(() => {
    // Hydrate auth state from localStorage on client-side
    console.log('App: Dispatching hydrate action');
    store.dispatch(hydrate());
    console.log('App: Auth state after hydration:', store.getState().auth);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<SimpleDashboard />} />
                      <Route path="/dashboard" element={<SimpleDashboard />} />
                      <Route path="/threat-intelligence/*" element={<ThreatIntelligenceRoutes />} />
                      <Route path="/incident-response/*" element={<IncidentResponseRoutes />} />
                      <Route path="/threat-hunting/*" element={<ThreatHuntingRoutes />} />
                      <Route path="/vulnerability-management/*" element={<VulnerabilityManagementRoutes />} />
                      <Route path="/risk-assessment/*" element={<RiskAssessmentRoutes />} />
                      <Route path="/threat-actors/*" element={<ThreatActorsRoutes />} />
                      <Route path="/ioc-management/*" element={<IoCManagementRoutes />} />
                      <Route path="/threat-feeds/*" element={<ThreatFeedsRoutes />} />
                      <Route path="/siem/*" element={<SiemRoutes />} />
                      <Route path="/collaboration/*" element={<CollaborationRoutes />} />
                      <Route path="/reporting/*" element={<ReportingRoutes />} />
                      <Route path="/malware-analysis/*" element={<MalwareAnalysisRoutes />} />
                      <Route path="/dark-web/*" element={<DarkWebRoutes />} />
                      <Route path="/compliance/*" element={<ComplianceRoutes />} />
                      <Route path="/automation/*" element={<AutomationRoutes />} />
                      <Route path="/notifications/*" element={<NotificationsRoutes />} />
                      <Route path="/case-management/*" element={<CaseManagementRoutes />} />
                      <Route path="/metrics/*" element={<MetricsRoutes />} />
                      <Route path="/draft-workspace/*" element={<DraftWorkspaceRoutes />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

/**
 * Root application component.
 * 
 * Provides Redux store to the entire application and renders the main content.
 * Includes a safety check to ensure the store is initialized before rendering.
 * 
 * @component
 * @returns {JSX.Element} Application root with Redux provider
 * @example
 * ```tsx
 * // Used in main.tsx
 * <App />
 * ```
 */
function App() {
  // Ensure store is available before rendering
  if (!store) {
    console.error('Redux store is not initialized');
    return <div>Loading...</div>;
  }

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
