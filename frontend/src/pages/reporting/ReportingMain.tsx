import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as CsvIcon,
  Code as JsonIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Report {
  id: string;
  name: string;
  type: string;
  schedule: string;
  lastRun: string;
  status: string;
}

export default function ReportingMain() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState('executive');
  const [timeRange, setTimeRange] = useState('30d');

  const [stats] = useState({
    totalReports: 42,
    scheduledReports: 15,
    reportsThisMonth: 28,
    avgGenerationTime: '2.3s',
  });

  // Threat trend data for line chart
  const [trendData] = useState([
    { date: 'Week 1', threats: 45, incidents: 12, vulnerabilities: 28 },
    { date: 'Week 2', threats: 52, incidents: 15, vulnerabilities: 32 },
    { date: 'Week 3', threats: 48, incidents: 10, vulnerabilities: 25 },
    { date: 'Week 4', threats: 61, incidents: 18, vulnerabilities: 35 },
  ]);

  // Severity distribution for bar chart
  const [severityData] = useState([
    { severity: 'Critical', count: 12 },
    { severity: 'High', count: 28 },
    { severity: 'Medium', count: 45 },
    { severity: 'Low', count: 67 },
  ]);

  // Threat type distribution for pie chart
  const [threatTypeData] = useState([
    { name: 'Malware', value: 35 },
    { name: 'Phishing', value: 28 },
    { name: 'DDoS', value: 18 },
    { name: 'Data Breach', value: 12 },
    { name: 'Other', value: 7 },
  ]);

  const COLORS = ['#f44336', '#ff9800', '#2196f3', '#4caf50', '#9c27b0'];

  const [savedReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Executive Security Dashboard',
      type: 'Executive',
      schedule: 'Weekly',
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
    },
    {
      id: '2',
      name: 'Threat Intelligence Summary',
      type: 'Technical',
      schedule: 'Daily',
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
    },
    {
      id: '3',
      name: 'Incident Response Report',
      type: 'Operational',
      schedule: 'Monthly',
      lastRun: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
    },
    {
      id: '4',
      name: 'Compliance Audit Report',
      type: 'Compliance',
      schedule: 'Quarterly',
      lastRun: new Date(Date.now() - 604800000).toISOString(),
      status: 'pending',
    },
  ]);

  const [kpis] = useState([
    { metric: 'Mean Time to Detect (MTTD)', value: '2.4 hours', trend: 'down', change: '-15%' },
    { metric: 'Mean Time to Respond (MTTR)', value: '4.8 hours', trend: 'down', change: '-22%' },
    { metric: 'Threat Detection Rate', value: '94.5%', trend: 'up', change: '+3%' },
    { metric: 'False Positive Rate', value: '8.2%', trend: 'down', change: '-5%' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Error fetching reporting data:', err);
        setError('Failed to load reporting data. Showing mock data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↑' : '↓';
  };

  const getTrendColor = (trend: string, metricType: string) => {
    // For some metrics, down is good (like MTTD, MTTR, False Positive Rate)
    const downIsGood = metricType.includes('Time') || metricType.includes('False');
    if (downIsGood) {
      return trend === 'down' ? 'success.main' : 'error.main';
    }
    return trend === 'up' ? 'success.main' : 'error.main';
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
          Reporting & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="executive">Executive</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="compliance">Compliance</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
              data-testid="date-filter"
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Generate Report
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }} data-testid="metrics">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Reports
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.totalReports}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Scheduled Reports
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.scheduledReports}
                  </Typography>
                </Box>
                <BarChartIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Reports This Month
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.reportsThisMonth}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Avg Generation Time
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.avgGenerationTime}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Performance Indicators */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Key Performance Indicators (KPIs)
        </Typography>
        <Grid container spacing={3}>
          {kpis.map((kpi, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {kpi.metric}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {kpi.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: getTrendColor(kpi.trend, kpi.metric), fontWeight: 600 }}
                    >
                      {getTrendIcon(kpi.trend)} {kpi.change}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Threat Trends Line Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }} data-testid="chart">
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Threat Trends Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="threats" stroke="#f44336" strokeWidth={2} />
                <Line type="monotone" dataKey="incidents" stroke="#ff9800" strokeWidth={2} />
                <Line type="monotone" dataKey="vulnerabilities" stroke="#2196f3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Threat Type Distribution Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Threat Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Severity Distribution Bar Chart */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Threat Severity Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Saved Reports */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Saved Reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" startIcon={<PdfIcon />}>
              PDF
            </Button>
            <Button size="small" startIcon={<CsvIcon />}>
              CSV
            </Button>
            <Button size="small" startIcon={<JsonIcon />}>
              JSON
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savedReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>
                    <Chip label={report.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{report.schedule}</TableCell>
                  <TableCell>{formatTimestamp(report.lastRun)}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      color={report.status === 'completed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
