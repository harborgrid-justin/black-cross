import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Eager load critical components
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';

// Lazy load feature pages for better performance
const ThreatList = lazy(() => import('./pages/threats/ThreatList'));
const ThreatDetails = lazy(() => import('./pages/threats/ThreatDetails'));
const IncidentList = lazy(() => import('./pages/incidents/IncidentList'));
const VulnerabilityList = lazy(() => import('./pages/vulnerabilities/VulnerabilityList'));
const RiskAssessment = lazy(() => import('./pages/risk/RiskAssessment'));
const ThreatHunting = lazy(() => import('./pages/hunting/ThreatHunting'));
const ThreatActors = lazy(() => import('./pages/actors/ThreatActors'));
const IoCManagement = lazy(() => import('./pages/iocs/IoCManagement'));
const ThreatFeeds = lazy(() => import('./pages/feeds/ThreatFeeds'));
const MalwareAnalysis = lazy(() => import('./pages/malware/MalwareAnalysis'));
const DarkWebMonitoring = lazy(() => import('./pages/darkweb/DarkWebMonitoring'));
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

function App() {
  return (
    <Provider store={store}>
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
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/threats" element={<ThreatList />} />
                        <Route path="/threats/:id" element={<ThreatDetails />} />
                        <Route path="/incidents" element={<IncidentList />} />
                        <Route path="/hunting" element={<ThreatHunting />} />
                        <Route path="/vulnerabilities" element={<VulnerabilityList />} />
                        <Route path="/risk" element={<RiskAssessment />} />
                        <Route path="/actors" element={<ThreatActors />} />
                        <Route path="/iocs" element={<IoCManagement />} />
                        <Route path="/feeds" element={<ThreatFeeds />} />
                        <Route path="/siem" element={<SIEMDashboard />} />
                        <Route path="/collaboration" element={<CollaborationHub />} />
                        <Route path="/reporting" element={<ReportingAnalytics />} />
                        <Route path="/malware" element={<MalwareAnalysis />} />
                        <Route path="/darkweb" element={<DarkWebMonitoring />} />
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
    </Provider>
  );
}

export default App;
