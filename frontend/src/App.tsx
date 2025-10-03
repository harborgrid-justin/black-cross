import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import ThreatList from './pages/threats/ThreatList';
import ThreatDetails from './pages/threats/ThreatDetails';
import IncidentList from './pages/incidents/IncidentList';
import VulnerabilityList from './pages/vulnerabilities/VulnerabilityList';
import RiskAssessment from './pages/risk/RiskAssessment';
import ThreatHunting from './pages/hunting/ThreatHunting';
import ThreatActors from './pages/actors/ThreatActors';
import IoCManagement from './pages/iocs/IoCManagement';
import ThreatFeeds from './pages/feeds/ThreatFeeds';
import MalwareAnalysis from './pages/malware/MalwareAnalysis';
import DarkWebMonitoring from './pages/darkweb/DarkWebMonitoring';
import ComplianceManagement from './pages/compliance/ComplianceManagement';
import AutomationPlaybooks from './pages/automation/AutomationPlaybooks';
import PrivateRoute from './components/auth/PrivateRoute';

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
                      <Route path="/malware" element={<MalwareAnalysis />} />
                      <Route path="/darkweb" element={<DarkWebMonitoring />} />
                      <Route path="/compliance" element={<ComplianceManagement />} />
                      <Route path="/automation" element={<AutomationPlaybooks />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
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
