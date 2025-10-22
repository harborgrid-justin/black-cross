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
const VulnerabilityList = lazy(() => import('./pages/vulnerability-management/VulnerabilityList'));
const RiskAssessment = lazy(() => import('./pages/risk-assessment/RiskAssessment'));
const ThreatHunting = lazy(() => import('./pages/threat-hunting/ThreatHunting'));
const ThreatActors = lazy(() => import('./pages/threat-actors/ThreatActors'));
const IoCManagement = lazy(() => import('./pages/ioc-management/IoCManagement'));
const ThreatFeeds = lazy(() => import('./pages/threat-feeds/ThreatFeeds'));
const MalwareAnalysis = lazy(() => import('./pages/malware-analysis/MalwareAnalysis'));
const DarkWebMonitoring = lazy(() => import('./pages/dark-web/DarkWebMonitoring'));
const ComplianceManagement = lazy(() => import('./pages/compliance/ComplianceManagement'));
const AutomationPlaybooks = lazy(() => import('./pages/automation/AutomationPlaybooks'));
const SIEMDashboard = lazy(() => import('./pages/siem/SIEMDashboard'));
const CollaborationHub = lazy(() => import('./pages/collaboration/CollaborationHub'));
const ReportingAnalytics = lazy(() => import('./pages/reporting/ReportingAnalytics'));

// Loading fallback component
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

// Inner component to handle auth hydration
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
                      <Route path="/threat-hunting" element={<ThreatHunting />} />
                      <Route path="/vulnerability-management" element={<VulnerabilityList />} />
                      <Route path="/risk-assessment" element={<RiskAssessment />} />
                      <Route path="/threat-actors" element={<ThreatActors />} />
                      <Route path="/ioc-management" element={<IoCManagement />} />
                      <Route path="/threat-feeds" element={<ThreatFeeds />} />
                      <Route path="/siem" element={<SIEMDashboard />} />
                      <Route path="/collaboration" element={<CollaborationHub />} />
                      <Route path="/reporting" element={<ReportingAnalytics />} />
                      <Route path="/malware-analysis" element={<MalwareAnalysis />} />
                      <Route path="/dark-web" element={<DarkWebMonitoring />} />
                      <Route path="/compliance" element={<ComplianceManagement />} />
                      <Route path="/automation" element={<AutomationPlaybooks />} />
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
