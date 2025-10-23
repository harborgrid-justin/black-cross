/**
 * @fileoverview Metrics & Analytics page component.
 * 
 * Displays security, performance, and usage metrics with
 * trend analysis and dashboards.
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
 * @component
 */
export default function MetricsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
            <Grid item xs={12} md={6} lg={3}>
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
