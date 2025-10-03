import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  severity: string;
  event: string;
  message: string;
}

interface Alert {
  id: string;
  title: string;
  severity: string;
  status: string;
  timestamp: string;
  count: number;
}

export default function SIEMDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [stats] = useState({
    totalEvents: 15420,
    alerts: 47,
    correlations: 12,
    activeRules: 156,
  });

  const [recentLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      source: 'firewall',
      severity: 'high',
      event: 'Suspicious Connection Attempt',
      message: 'Multiple failed connection attempts from 192.168.1.100',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      source: 'web-server',
      severity: 'medium',
      event: 'SQL Injection Attempt',
      message: 'Blocked SQL injection attempt on /api/users endpoint',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      source: 'auth-system',
      severity: 'low',
      event: 'Failed Login',
      message: 'Failed login attempt for user admin',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      source: 'ids',
      severity: 'critical',
      event: 'Malware Detected',
      message: 'Trojan detected in network traffic from 10.0.0.25',
    },
  ]);

  const [activeAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Brute Force Attack Detected',
      severity: 'critical',
      status: 'active',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      count: 342,
    },
    {
      id: '2',
      title: 'Unusual Outbound Traffic',
      severity: 'high',
      status: 'investigating',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      count: 28,
    },
    {
      id: '3',
      title: 'Port Scanning Activity',
      severity: 'medium',
      status: 'active',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      count: 156,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Error fetching SIEM data:', err);
        setError('Failed to load SIEM data. Showing mock data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon />;
      case 'high':
        return <WarningIcon />;
      case 'medium':
        return <ShieldIcon />;
      case 'low':
        return <CheckCircleIcon />;
      default:
        return <ShieldIcon />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          SIEM Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Events
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.totalEvents.toLocaleString()}
                  </Typography>
                </Box>
                <ShieldIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Alerts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.alerts}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Correlations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.correlations}
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Rules
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.activeRules}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Alerts */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Active Alerts
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Alert</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Events</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeAlerts.map((alert) => (
                <TableRow key={alert.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSeverityIcon(alert.severity)}
                      <Typography>{alert.title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alert.severity.toUpperCase()}
                      color={getSeverityColor(alert.severity) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alert.status}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{alert.count}</TableCell>
                  <TableCell>{formatTimestamp(alert.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Logs */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Security Events
          </Typography>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentLogs
                .filter((log) =>
                  searchTerm === '' ||
                  log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  log.message.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>
                      <Chip label={log.source} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.severity.toUpperCase()}
                        color={getSeverityColor(log.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.event}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
