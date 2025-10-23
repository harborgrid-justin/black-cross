/**
 * @fileoverview Main dashboard page. Displays overview of security metrics and key indicators.
 * 
 * @module pages/Dashboard
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  Security,
  BugReport,
} from '@mui/icons-material';
import { dashboardService } from '@/services/dashboardService';

const StatCard = ({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
              <TrendingUp sx={{ fontSize: 16, verticalAlign: 'middle' }} /> {trend}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    {
      title: 'Active Threats',
      value: 0,
      icon: <BugReport />,
      color: '#f44336',
      trend: '+12% from last week',
    },
    {
      title: 'Open Incidents',
      value: 0,
      icon: <Warning />,
      color: '#ff9800',
      trend: '-5% from last week',
    },
    {
      title: 'Vulnerabilities',
      value: 0,
      icon: <Security />,
      color: '#2196f3',
      trend: '+8% from last week',
    },
    {
      title: 'Risk Score',
      value: '0/10',
      icon: <TrendingUp />,
      color: '#4caf50',
      trend: 'Stable',
    },
  ]);
  const [recentThreats, setRecentThreats] = useState<Array<{ name: string; severity: string; time: string }>>([]);
  const [systemHealth, setSystemHealth] = useState([
    { name: 'Threat Intelligence', value: 98 },
    { name: 'SIEM Integration', value: 95 },
    { name: 'Incident Response', value: 100 },
    { name: 'Vulnerability Scanning', value: 87 },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const statsResponse = await dashboardService.getStats();
        if (statsResponse.success && statsResponse.data) {
          setStats([
            {
              title: 'Active Threats',
              value: statsResponse.data.activeThreats,
              icon: <BugReport />,
              color: '#f44336',
              trend: `${statsResponse.data.threatTrend > 0 ? '+' : ''}${statsResponse.data.threatTrend}% from last week`,
            },
            {
              title: 'Open Incidents',
              value: statsResponse.data.openIncidents,
              icon: <Warning />,
              color: '#ff9800',
              trend: `${statsResponse.data.incidentTrend > 0 ? '+' : ''}${statsResponse.data.incidentTrend}% from last week`,
            },
            {
              title: 'Vulnerabilities',
              value: statsResponse.data.vulnerabilities,
              icon: <Security />,
              color: '#2196f3',
              trend: `${statsResponse.data.vulnTrend > 0 ? '+' : ''}${statsResponse.data.vulnTrend}% from last week`,
            },
            {
              title: 'Risk Score',
              value: `${statsResponse.data.riskScore}/10`,
              icon: <TrendingUp />,
              color: '#4caf50',
              trend: 'Stable',
            },
          ]);
        }

        // Fetch recent threats
        const threatsResponse = await dashboardService.getRecentThreats(4);
        if (threatsResponse.success && threatsResponse.data) {
          setRecentThreats(threatsResponse.data);
        }

        // Fetch system health
        const healthResponse = await dashboardService.getSystemHealth();
        if (healthResponse.success && healthResponse.data) {
          setSystemHealth([
            { name: 'Threat Intelligence', value: healthResponse.data.threatIntelligence },
            { name: 'SIEM Integration', value: healthResponse.data.siemIntegration },
            { name: 'Incident Response', value: healthResponse.data.incidentResponse },
            { name: 'Vulnerability Scanning', value: healthResponse.data.vulnerabilityScanning },
          ]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Using mock data.');
        // Keep mock data if API fails
        setRecentThreats([
          { name: 'Phishing Campaign #2847', severity: 'high', time: '5 minutes ago' },
          { name: 'Malware: TrojanX.v2', severity: 'critical', time: '12 minutes ago' },
          { name: 'DDoS Attack Detected', severity: 'medium', time: '45 minutes ago' },
          { name: 'Ransomware: CryptoLocker', severity: 'critical', time: '1 hour ago' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box data-testid="dashboard">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        🎉 Dashboard loaded successfully! Authentication bypass is active for development.
      </Alert>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Threat Activity (Last 7 Days)
            </Typography>
            <Box sx={{ mt: 3, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Chart component would be rendered here using Recharts
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Threats
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentThreats.map((threat, index) => (
                <Box
                  key={index}
                  sx={{
                    py: 2,
                    borderBottom: index < recentThreats.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getSeverityColor(threat.severity),
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {threat.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    {threat.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              System Health
            </Typography>
            <Box sx={{ mt: 3 }}>
              {systemHealth.map((system) => (
                <Box key={system.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{system.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {system.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={system.value}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Stats
            </Typography>
            <Box sx={{ mt: 3 }}>
              {[
                { label: 'Total IoCs', value: '15,234' },
                { label: 'Threat Actors Tracked', value: '89' },
                { label: 'Active Playbooks', value: '24' },
                { label: 'Integrations', value: '12' },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
