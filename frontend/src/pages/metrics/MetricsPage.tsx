/**
 * @fileoverview Metrics & Analytics page component.
 *
 * Displays comprehensive security, performance, and usage metrics with
 * trend analysis and interactive dashboards. Provides tabbed navigation
 * for different metric categories.
 *
 * ## Features
 * - Three metric categories: Security, Performance, Usage
 * - Real-time metric loading from backend API
 * - Security metrics: threats, incidents, vulnerabilities, compliance
 * - Performance metrics: API response times, cache hit rate, error rate
 * - Usage metrics: active users, sessions, session duration
 * - Loading states and error handling
 * - Responsive grid layout for metric cards
 *
 * ## Data Visualization
 * - Metric cards with primary values
 * - Color-coded indicators
 * - Time-based metrics (MTTD, MTTR, MTTR)
 * - Percentage-based metrics (compliance score, cache hit rate)
 * - Count-based metrics (users, sessions, threats)
 *
 * @module pages/metrics/MetricsPage
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  metricsService,
  type SecurityMetrics,
  type PerformanceMetrics,
  type UsageMetrics,
} from '@/services/metricsService';

/**
 * Props for tab panel component.
 *
 * @interface TabPanelProps
 * @property {React.ReactNode} [children] - Content to display in the tab panel
 * @property {number} index - Zero-based index of this tab panel
 * @property {number} value - Currently selected tab index
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab panel component for metrics tabs.
 *
 * Conditionally renders children based on whether the tab is active.
 * Includes proper ARIA attributes for accessibility.
 *
 * @param {TabPanelProps} props - Component props
 * @returns {JSX.Element} Tab panel wrapper with ARIA attributes
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`metrics-tabpanel-${index}`}
      aria-labelledby={`metrics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Metrics & Analytics page component.
 *
 * Displays security, performance, and usage metrics in a tabbed interface.
 * Automatically loads all metric categories on component mount.
 *
 * @component
 * @returns {JSX.Element} The metrics and analytics page
 *
 * @example
 * ```tsx
 * <Route path="/metrics" element={<MetricsPage />} />
 * ```
 */
export default function MetricsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads all metric categories from the backend API.
   *
   * Fetches security, performance, and usage metrics in parallel using
   * Promise.all for optimal performance. Sets error state if any request fails.
   *
   * @async
   * @function loadMetrics
   * @returns {Promise<void>}
   */
  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [security, performance, usage] = await Promise.all([
        metricsService.getSecurityMetrics(),
        metricsService.getPerformanceMetrics(),
        metricsService.getUsageMetrics(),
      ]);

      setSecurityMetrics(security.data);
      setPerformanceMetrics(performance.data);
      setUsageMetrics(usage.data);
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  /**
   * Handles tab change in the metrics interface.
   *
   * @function handleTabChange
   * @param {React.SyntheticEvent} _event - Tab change event (unused)
   * @param {number} newValue - Zero-based index of the newly selected tab
   * @returns {void}
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Metrics & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="metrics tabs">
          <Tab label="Security" />
          <Tab label="Performance" />
          <Tab label="Usage" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {securityMetrics && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Threats
                  </Typography>
                  <Typography variant="h4">
                    {securityMetrics.total_threats}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Incidents
                  </Typography>
                  <Typography variant="h4">
                    {securityMetrics.active_incidents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Open Vulnerabilities
                  </Typography>
                  <Typography variant="h4">
                    {securityMetrics.vulnerabilities_open}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Compliance Score
                  </Typography>
                  <Typography variant="h4">
                    {securityMetrics.compliance_score}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Mean Time to Detect
                  </Typography>
                  <Typography variant="h5">
                    {securityMetrics.mean_time_to_detect}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Mean Time to Respond
                  </Typography>
                  <Typography variant="h5">
                    {securityMetrics.mean_time_to_respond}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Mean Time to Resolve
                  </Typography>
                  <Typography variant="h5">
                    {securityMetrics.mean_time_to_resolve}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {performanceMetrics && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    API Requests/sec
                  </Typography>
                  <Typography variant="h4">
                    {performanceMetrics.api_requests_per_second.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4">
                    {performanceMetrics.api_response_time_avg.toFixed(0)}ms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Cache Hit Rate
                  </Typography>
                  <Typography variant="h4">
                    {(performanceMetrics.cache_hit_rate * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Error Rate
                  </Typography>
                  <Typography variant="h4">
                    {(performanceMetrics.api_error_rate * 100).toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {usageMetrics && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4">
                    {usageMetrics.active_users}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {usageMetrics.total_users}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    User Sessions
                  </Typography>
                  <Typography variant="h4">
                    {usageMetrics.user_sessions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Session Duration
                  </Typography>
                  <Typography variant="h4">
                    {Math.round(usageMetrics.avg_session_duration / 60)}m
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>
    </Box>
  );
}
