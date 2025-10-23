/**
 * @fileoverview Simplified dashboard page. Provides quick access to critical security information.
 * 
 * @module pages/SimpleDashboard
 */

import { useEffect } from 'react';
import { Box, Typography, Alert, Grid, Paper, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';

export default function SimpleDashboard() {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box data-testid="dashboard">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              {stats.activeThreats}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Threats
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="warning.main">
              {stats.openIncidents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open Incidents
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="error">
              {stats.vulnerabilities}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vulnerabilities
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="success.main">
              {stats.riskScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Risk Score
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Welcome to the Black-Cross Enterprise Cyber Threat Intelligence Platform.
      </Typography>
    </Box>
  );
}
