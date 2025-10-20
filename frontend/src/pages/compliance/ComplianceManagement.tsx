import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  complianceService,
  type ComplianceFramework,
  type ComplianceControl,
  type ComplianceGap,
} from '@/services/complianceService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ComplianceManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [gaps, setGaps] = useState<ComplianceGap[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFramework, setMenuFramework] = useState<ComplianceFramework | null>(null);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await complianceService.getFrameworks();
      if (response.success && response.data) {
        setFrameworks(response.data);
        if (response.data.length > 0 && !selectedFramework) {
          setSelectedFramework(response.data[0]);
          loadFrameworkData(response.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching frameworks:', err);
      setError('Failed to load frameworks. Showing mock data.');
      // Mock data fallback
      const mockFrameworks: ComplianceFramework[] = [
        {
          id: '1',
          name: 'SOC 2',
          version: '2017',
          description: 'Service Organization Control 2',
          totalControls: 156,
          implementedControls: 143,
          complianceScore: 92,
          status: 'active',
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'ISO 27001',
          version: '2013',
          description: 'Information Security Management',
          totalControls: 114,
          implementedControls: 100,
          complianceScore: 88,
          status: 'active',
          lastAssessment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'NIST CSF',
          version: '1.1',
          description: 'NIST Cybersecurity Framework',
          totalControls: 98,
          implementedControls: 83,
          complianceScore: 85,
          status: 'active',
          lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'GDPR',
          version: '2018',
          description: 'General Data Protection Regulation',
          totalControls: 45,
          implementedControls: 43,
          complianceScore: 95,
          status: 'active',
          lastAssessment: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setFrameworks(mockFrameworks);
      if (mockFrameworks.length > 0 && !selectedFramework) {
        setSelectedFramework(mockFrameworks[0]);
        loadFrameworkData(mockFrameworks[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFrameworkData = async (frameworkId: string) => {
    try {
      // Load controls
      const controlsResponse = await complianceService.getControls(frameworkId);
      if (controlsResponse.success && controlsResponse.data) {
        setControls(controlsResponse.data);
      }
    } catch (err) {
      console.error('Error loading framework data:', err);
      // Mock controls data
      const mockControls: ComplianceControl[] = [
        {
          id: '1',
          frameworkId,
          controlId: 'CC1.1',
          name: 'Control Environment',
          description: 'Establish control environment and set tone at the top',
          category: 'Common Criteria',
          implemented: true,
          status: 'compliant',
          evidence: [],
          lastReviewed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          frameworkId,
          controlId: 'CC2.1',
          name: 'Communication and Information',
          description: 'Implement effective communication channels',
          category: 'Common Criteria',
          implemented: true,
          status: 'compliant',
          evidence: [],
          lastReviewed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          frameworkId,
          controlId: 'CC3.1',
          name: 'Risk Assessment',
          description: 'Perform regular risk assessments',
          category: 'Common Criteria',
          implemented: false,
          status: 'non-compliant',
          evidence: [],
        },
      ];
      setControls(mockControls);
    }

    try {
      // Load gaps
      const gapsResponse = await complianceService.getGaps(frameworkId);
      if (gapsResponse.success && gapsResponse.data) {
        setGaps(gapsResponse.data);
      }
    } catch (err) {
      console.error('Error loading gaps:', err);
      // Mock gaps data
      const mockGaps: ComplianceGap[] = [
        {
          controlId: 'CC3.1',
          controlName: 'Risk Assessment',
          framework: selectedFramework?.name || 'Framework',
          currentState: 'Not Implemented',
          requiredState: 'Fully Implemented',
          gap: 'Missing documented risk assessment process',
          priority: 'high',
          remediation: 'Establish and document risk assessment procedures',
        },
        {
          controlId: 'CC4.2',
          controlName: 'Monitoring Activities',
          framework: selectedFramework?.name || 'Framework',
          currentState: 'Partially Implemented',
          requiredState: 'Fully Implemented',
          gap: 'Incomplete monitoring coverage',
          priority: 'medium',
          remediation: 'Expand monitoring to all critical systems',
        },
      ];
      setGaps(mockGaps);
    }
  };

  const handleFrameworkClick = (framework: ComplianceFramework) => {
    setSelectedFramework(framework);
    loadFrameworkData(framework.id);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, framework: ComplianceFramework) => {
    setAnchorEl(event.currentTarget);
    setMenuFramework(framework);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFramework(null);
  };

  const handleAnalyzeGaps = async () => {
    if (!selectedFramework) return;
    try {
      await complianceService.analyzeGaps(selectedFramework.id);
      loadFrameworkData(selectedFramework.id);
    } catch (err) {
      console.error('Error analyzing gaps:', err);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedFramework) return;
    try {
      await complianceService.generateReport(selectedFramework.id);
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon color="success" />;
      case 'partial':
        return <WarningIcon color="warning" />;
      case 'non-compliant':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
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
          Compliance & Audit Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchFrameworks}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Framework
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Frameworks Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }} data-testid="frameworks">
        {frameworks.map((framework) => (
          <Grid size={{ xs: 12, md: 6, lg: 3 }} key={framework.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedFramework?.id === framework.id ? 2 : 0,
                borderColor: 'primary.main',
                '&:hover': { boxShadow: 6 },
              }}
              onClick={() => handleFrameworkClick(framework)}
              data-testid="framework-filter"
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{framework.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      v{framework.version}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, framework); }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" color={`${getComplianceColor(framework.complianceScore)}.main`} sx={{ fontWeight: 700 }} data-testid="compliance-score">
                    {framework.complianceScore}%
                  </Typography>
                  <Chip
                    label={framework.status}
                    size="small"
                    color={framework.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={framework.complianceScore}
                  color={getComplianceColor(framework.complianceScore)}
                  sx={{ height: 8, borderRadius: 1, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {framework.implementedControls} / {framework.totalControls} controls
                </Typography>
                {framework.lastAssessment && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Last assessed: {new Date(framework.lastAssessment).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Framework Details */}
      {selectedFramework && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedFramework.name} - {selectedFramework.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button startIcon={<AssessmentIcon />} onClick={handleAnalyzeGaps}>
                Analyze Gaps
              </Button>
              <Button startIcon={<DownloadIcon />} onClick={handleGenerateReport}>
                Generate Report
              </Button>
            </Box>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Controls" />
            <Tab label={`Gaps (${gaps.length})`} />
            <Tab label="Audit Logs" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer data-testid="requirements-list">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Control ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Reviewed</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {controls.map((control) => (
                    <TableRow key={control.id} hover>
                      <TableCell>{control.controlId}</TableCell>
                      <TableCell>{control.name}</TableCell>
                      <TableCell>{control.category}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(control.status)}
                          <Chip
                            label={control.status}
                            size="small"
                            color={
                              control.status === 'compliant'
                                ? 'success'
                                : control.status === 'partial'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {control.lastReviewed
                          ? new Date(control.lastReviewed).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Control</TableCell>
                    <TableCell>Gap</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Remediation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gaps.map((gap, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {gap.controlId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {gap.controlName}
                        </Typography>
                      </TableCell>
                      <TableCell>{gap.gap}</TableCell>
                      <TableCell>
                        <Chip
                          label={gap.priority}
                          size="small"
                          color={
                            gap.priority === 'critical'
                              ? 'error'
                              : gap.priority === 'high'
                              ? 'warning'
                              : 'info'
                          }
                        />
                      </TableCell>
                      <TableCell>{gap.remediation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              Audit log history will be displayed here
            </Typography>
          </TabPanel>
        </Paper>
      )}

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        <MenuItem onClick={handleMenuClose}>Export</MenuItem>
        <MenuItem onClick={handleMenuClose}>Archive</MenuItem>
      </Menu>

      {/* Add Framework Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Compliance Framework</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Framework Name"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField margin="dense" label="Version" fullWidth variant="outlined" sx={{ mb: 2 }} />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
