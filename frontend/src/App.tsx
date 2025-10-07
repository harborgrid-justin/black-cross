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
const ThreatList = lazy(() => import('./pages/threat-intelligence/ThreatList'));
const ThreatDetails = lazy(() => import('./pages/threat-intelligence/ThreatDetails'));
const IncidentList = lazy(() => import('./pages/incident-response/IncidentList'));
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

// Wrapper component for protected routes with layout
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </Layout>
    </PrivateRoute>
  );
}

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
          <Route path="/" element={<ProtectedLayout><SimpleDashboard /></ProtectedLayout>} />
          <Route path="/dashboard" element={<ProtectedLayout><SimpleDashboard /></ProtectedLayout>} />
          <Route path="/threat-intelligence" element={<ProtectedLayout><ThreatList /></ProtectedLayout>} />
          <Route path="/threat-intelligence/:id" element={<ProtectedLayout><ThreatDetails /></ProtectedLayout>} />
          <Route path="/incident-response" element={<ProtectedLayout><IncidentList /></ProtectedLayout>} />
          <Route path="/threat-hunting" element={<ProtectedLayout><ThreatHunting /></ProtectedLayout>} />
          <Route path="/vulnerability-management" element={<ProtectedLayout><VulnerabilityList /></ProtectedLayout>} />
          <Route path="/risk-assessment" element={<ProtectedLayout><RiskAssessment /></ProtectedLayout>} />
          <Route path="/threat-actors" element={<ProtectedLayout><ThreatActors /></ProtectedLayout>} />
          <Route path="/ioc-management" element={<ProtectedLayout><IoCManagement /></ProtectedLayout>} />
          <Route path="/threat-feeds" element={<ProtectedLayout><ThreatFeeds /></ProtectedLayout>} />
          <Route path="/siem" element={<ProtectedLayout><SIEMDashboard /></ProtectedLayout>} />
          <Route path="/collaboration" element={<ProtectedLayout><CollaborationHub /></ProtectedLayout>} />
          <Route path="/reporting" element={<ProtectedLayout><ReportingAnalytics /></ProtectedLayout>} />
          <Route path="/malware-analysis" element={<ProtectedLayout><MalwareAnalysis /></ProtectedLayout>} />
          <Route path="/dark-web" element={<ProtectedLayout><DarkWebMonitoring /></ProtectedLayout>} />
          <Route path="/compliance" element={<ProtectedLayout><ComplianceManagement /></ProtectedLayout>} />
          <Route path="/automation" element={<ProtectedLayout><AutomationPlaybooks /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
