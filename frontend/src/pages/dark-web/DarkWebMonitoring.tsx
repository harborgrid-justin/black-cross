/**
 * @fileoverview Dark Web monitoring component for active threat surveillance.
 *
 * This component provides a focused monitoring view for dark web threats, featuring
 * real-time statistics, tabbed interfaces for findings/leaks/keywords, and management
 * capabilities. It mirrors the functionality of DarkWebMain with emphasis on active
 * monitoring and alerting.
 *
 * @module pages/dark-web/DarkWebMonitoring
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  darkWebService,
  type DarkWebFinding,
  type CredentialLeak,
  type MonitoringKeyword,
} from '@/services/darkWebService';

/**
 * Props interface for the TabPanel component.
 *
 * @interface TabPanelProps
 * @property {React.ReactNode} [children] - Content to display when the tab is active
 * @property {number} index - Zero-based index identifying this specific tab panel
 * @property {number} value - Currently selected tab index from parent state
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab panel component for conditionally rendering tab content.
 *
 * @param {TabPanelProps} props - Component props
 * @returns {JSX.Element} The tab panel with conditional content rendering
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Dark Web monitoring component for active threat surveillance.
 *
 * Provides real-time monitoring interface for dark web threats with comprehensive
 * statistics, searchable findings tables, credential leak tracking, and keyword
 * management. This component focuses on active monitoring workflows with emphasis
 * on alerting and rapid triage.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered dark web monitoring interface
 *
 * @remarks
 * This component is functionally similar to DarkWebMain but may be customized for
 * specific monitoring workflows. It maintains the same three-tab structure:
 * - Findings tab with search and filtering
 * - Credential Leaks tab with validation tracking
 * - Keywords tab for monitoring configuration
 *
 * Implements graceful degradation with mock data fallback when services are unavailable.
 *
 * @security
 * - All dark web content should be treated as potentially malicious
 * - Implement proper access controls for viewing sensitive findings
 * - Audit all interactions with critical findings
 * - Sanitize and escape all displayed content from dark web sources
 *
 * @example
 * ```tsx
 * // Used in routing or as embedded monitoring widget
 * <DarkWebMonitoring />
 * ```
 *
 * @see {@link DarkWebMain} for the main dashboard view
 * @see {@link darkWebService} for API integration
 */
export default function DarkWebMonitoring() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<DarkWebFinding[]>([]);
  const [credentialLeaks, setCredentialLeaks] = useState<CredentialLeak[]>([]);
  const [keywords, setKeywords] = useState<MonitoringKeyword[]>([]);
  const [statistics, setStatistics] = useState({
    totalFindings: 0,
    criticalFindings: 0,
    credentialLeaks: 0,
    brandMentions: 0,
    activeKeywords: 0,
    activeSources: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openKeywordDialog, setOpenKeywordDialog] = useState(false);
  const [openFindingDialog, setOpenFindingDialog] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<DarkWebFinding | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await darkWebService.getStatistics();
      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      // Fetch findings
      const findingsResponse = await darkWebService.getFindings({ perPage: 20 });
      if (findingsResponse.success && findingsResponse.data) {
        setFindings(findingsResponse.data);
      }

      // Fetch credential leaks
      const leaksResponse = await darkWebService.getCredentialLeaks({ perPage: 10 });
      if (leaksResponse.success && leaksResponse.data) {
        setCredentialLeaks(leaksResponse.data);
      }

      // Fetch keywords
      const keywordsResponse = await darkWebService.getKeywords();
      if (keywordsResponse.success && keywordsResponse.data) {
        setKeywords(keywordsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dark web monitoring data. Showing mock data.');

      // Mock data
      setStatistics({
        totalFindings: 127,
        criticalFindings: 12,
        credentialLeaks: 34,
        brandMentions: 56,
        activeKeywords: 15,
        activeSources: 8,
      });

      const mockFindings: DarkWebFinding[] = [
        {
          id: '1',
          type: 'credential-leak',
          severity: 'critical',
          status: 'new',
          source: 'Dark Forum',
          title: 'Employee Credentials Leaked',
          description: 'Multiple employee credentials found on dark web forum',
          keywords: ['credentials', 'leak'],
          discoveredAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'brand-mention',
          severity: 'medium',
          status: 'investigating',
          source: 'Marketplace',
          title: 'Brand Mentioned in Marketplace',
          description: 'Company name mentioned in underground marketplace',
          keywords: ['brand', 'marketplace'],
          discoveredAt: new Date(Date.now() - 10800000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'data-breach',
          severity: 'high',
          status: 'validated',
          source: 'Paste Site',
          title: 'Database Dump Discovered',
          description: 'Potential database dump found on paste site',
          keywords: ['database', 'dump'],
          discoveredAt: new Date(Date.now() - 18000000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setFindings(mockFindings);

      const mockLeaks: CredentialLeak[] = [
        {
          id: '1',
          findingId: '1',
          email: 'user@company.com',
          domain: 'company.com',
          source: 'Dark Forum',
          validated: false,
          discoveredAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setCredentialLeaks(mockLeaks);

      const mockKeywords: MonitoringKeyword[] = [
        {
          id: '1',
          keyword: 'company-name',
          category: 'Brand',
          active: true,
          priority: 'high',
          notificationEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          keyword: 'domain.com',
          category: 'Domain',
          active: true,
          priority: 'high',
          notificationEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setKeywords(mockKeywords);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewFinding = (finding: DarkWebFinding) => {
    setSelectedFinding(finding);
    setOpenFindingDialog(true);
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credential-leak':
        return <SecurityIcon />;
      case 'data-breach':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const filteredFindings = findings.filter(
    (finding) =>
      finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Dark Web Monitoring
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenKeywordDialog(true)}>
            Add Keyword
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="total">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Findings
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {statistics.totalFindings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="critical">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Critical
              </Typography>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                {statistics.criticalFindings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="leaks">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Credential Leaks
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {statistics.credentialLeaks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="mentions">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Brand Mentions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {statistics.brandMentions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="keywords">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Keywords
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {statistics.activeKeywords}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="sources">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Sources
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {statistics.activeSources}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={<Badge badgeContent={findings.length} color="primary">Findings</Badge>} />
          <Tab label={<Badge badgeContent={credentialLeaks.length} color="error">Credential Leaks</Badge>} />
          <Tab label={`Keywords (${keywords.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search findings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <FilterListIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer data-testid="scan-results">
            <Table data-testid="alerts">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Discovered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFindings.map((finding) => (
                  <TableRow key={finding.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(finding.type)}
                        <Typography variant="body2">{finding.type}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {finding.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {finding.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{finding.source}</TableCell>
                    <TableCell>
                      <Chip label={finding.severity} size="small" color={getSeverityColor(finding.severity)} />
                    </TableCell>
                    <TableCell>
                      <Chip label={finding.status} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {new Date(finding.discoveredAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleViewFinding(finding)}>
                        <VisibilityIcon />
                      </IconButton>
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
                  <TableCell>Email</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Validated</TableCell>
                  <TableCell>Discovered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {credentialLeaks.map((leak) => (
                  <TableRow key={leak.id} hover>
                    <TableCell>{leak.email}</TableCell>
                    <TableCell>{leak.domain || 'N/A'}</TableCell>
                    <TableCell>{leak.source}</TableCell>
                    <TableCell>
                      <Chip
                        label={leak.validated ? 'Yes' : 'No'}
                        size="small"
                        color={leak.validated ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(leak.discoveredAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small">Validate</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer data-testid="keywords">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Keyword</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notifications</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keywords.map((keyword) => (
                  <TableRow key={keyword.id} hover>
                    <TableCell>{keyword.keyword}</TableCell>
                    <TableCell>{keyword.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={keyword.priority}
                        size="small"
                        color={keyword.priority === 'high' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={keyword.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={keyword.active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={keyword.notificationEnabled ? 'Enabled' : 'Disabled'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Add Keyword Dialog */}
      <Dialog open={openKeywordDialog} onClose={() => setOpenKeywordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Monitoring Keyword</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Keyword"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Priority"
            select
            fullWidth
            variant="outlined"
            SelectProps={{ native: true }}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenKeywordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenKeywordDialog(false)}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Finding Details Dialog */}
      <Dialog open={openFindingDialog} onClose={() => setOpenFindingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Finding Details</DialogTitle>
        <DialogContent>
          {selectedFinding && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFinding.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedFinding.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">{selectedFinding.type}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip label={selectedFinding.severity} size="small" color={getSeverityColor(selectedFinding.severity)} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Source
                  </Typography>
                  <Typography variant="body1">{selectedFinding.source}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={selectedFinding.status} size="small" variant="outlined" />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFindingDialog(false)}>Close</Button>
          <Button variant="contained">Mark as Resolved</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
