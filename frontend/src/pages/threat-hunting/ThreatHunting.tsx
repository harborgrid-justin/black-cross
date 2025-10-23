/**
 * @fileoverview Threat Hunting - ThreatHunting component. Component for Threat Hunting feature.
 * 
 * @module pages/threat-hunting/ThreatHunting.tsx
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import {
  huntingService,
  type HuntingHypothesis,
  type HuntingQuery,
  type HuntingFinding,
  type QueryResult,
} from '@/services/huntingService';

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

export default function ThreatHunting() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hypotheses, setHypotheses] = useState<HuntingHypothesis[]>([]);
  const [selectedHypothesis, setSelectedHypothesis] = useState<HuntingHypothesis | null>(null);
  const [findings, setFindings] = useState<HuntingFinding[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [executing, setExecuting] = useState(false);
  const [openHypothesisDialog, setOpenHypothesisDialog] = useState(false);
  const [openQueryDialog, setOpenQueryDialog] = useState(false);
  const [queryLanguage, setQueryLanguage] = useState<'kql' | 'spl' | 'sql' | 'lucene'>('kql');
  const [statistics, setStatistics] = useState({
    totalHypotheses: 0,
    activeHypotheses: 0,
    validatedHypotheses: 0,
    totalFindings: 0,
    criticalFindings: 0,
    activeCampaigns: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await huntingService.getStatistics();
      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      // Fetch hypotheses
      const hypothesesResponse = await huntingService.getHypotheses({ perPage: 20 });
      if (hypothesesResponse.success && hypothesesResponse.data) {
        setHypotheses(hypothesesResponse.data);
        if (hypothesesResponse.data.length > 0 && !selectedHypothesis) {
          setSelectedHypothesis(hypothesesResponse.data[0]);
          loadHypothesisData(hypothesesResponse.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load threat hunting data. Showing mock data.');

      // Mock data
      setStatistics({
        totalHypotheses: 28,
        activeHypotheses: 12,
        validatedHypotheses: 8,
        totalFindings: 45,
        criticalFindings: 6,
        activeCampaigns: 3,
      });

      const mockHypotheses: HuntingHypothesis[] = [
        {
          id: '1',
          title: 'Suspicious PowerShell Activity',
          description: 'Hunt for obfuscated PowerShell commands and encoded scripts',
          category: 'malware',
          priority: 'high',
          status: 'active',
          queries: [],
          findings: [],
          mitreTactics: ['TA0002'],
          mitreTechniques: ['T1059.001'],
          createdBy: 'analyst1',
          createdByName: 'John Doe',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Unusual Network Traffic',
          description: 'Detect anomalous network connections to suspicious destinations',
          category: 'data-exfiltration',
          priority: 'critical',
          status: 'active',
          queries: [],
          findings: [],
          mitreTactics: ['TA0010'],
          mitreTechniques: ['T1041'],
          createdBy: 'analyst2',
          createdByName: 'Jane Smith',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Lateral Movement Detection',
          description: 'Identify attempts to move laterally across the network',
          category: 'lateral-movement',
          priority: 'high',
          status: 'validated',
          queries: [],
          findings: [],
          mitreTactics: ['TA0008'],
          mitreTechniques: ['T1021'],
          createdBy: 'analyst1',
          createdByName: 'John Doe',
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          title: 'Data Exfiltration Patterns',
          description: 'Search for unusual data transfers and encrypted channels',
          category: 'data-exfiltration',
          priority: 'critical',
          status: 'active',
          queries: [],
          findings: [],
          createdBy: 'analyst2',
          createdByName: 'Jane Smith',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setHypotheses(mockHypotheses);
      if (mockHypotheses.length > 0 && !selectedHypothesis) {
        setSelectedHypothesis(mockHypotheses[0]);
        loadHypothesisData(mockHypotheses[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHypothesisData = async (hypothesisId: string) => {
    try {
      const findingsResponse = await huntingService.getFindings(hypothesisId);
      if (findingsResponse.success && findingsResponse.data) {
        setFindings(findingsResponse.data);
      }
    } catch (err) {
      console.error('Error loading findings:', err);
      // Mock findings
      const mockFindings: HuntingFinding[] = [
        {
          id: '1',
          hypothesisId,
          title: 'Encoded PowerShell Command Detected',
          description: 'Found Base64-encoded PowerShell execution',
          severity: 'high',
          confidence: 'high',
          status: 'confirmed',
          evidence: [],
          iocs: [{ type: 'hash', value: 'abc123...' }],
          affectedAssets: ['DESKTOP-001', 'DESKTOP-002'],
          recommendations: ['Block PowerShell encoding', 'Review execution policies'],
          discoveredAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setFindings(mockFindings);
    }
  };

  const handleExecuteQuery = async () => {
    if (!queryText.trim()) return;

    try {
      setExecuting(true);
      const response = await huntingService.executeAdHocQuery({
        query: queryText,
        queryLanguage,
        name: 'Ad-hoc Query',
      });

      if (response.success && response.data) {
        setQueryResult(response.data);
      }
    } catch (err) {
      console.error('Error executing query:', err);
      // Mock result
      setQueryResult({
        totalHits: 42,
        events: [
          { timestamp: new Date().toISOString(), event: 'PowerShell execution', user: 'admin' },
          { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Encoded command', user: 'user1' },
        ],
        executionTime: 1.23,
        executedAt: new Date().toISOString(),
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleHypothesisClick = (hypothesis: HuntingHypothesis) => {
    setSelectedHypothesis(hypothesis);
    loadHypothesisData(hypothesis.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'info';
      case 'validated':
        return 'success';
      case 'disproven':
        return 'error';
      default:
        return 'default';
    }
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
          Threat Hunting Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenHypothesisDialog(true)}>
            New Hypothesis
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="total">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Hypotheses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {statistics.totalHypotheses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="active">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                {statistics.activeHypotheses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="validated">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Validated
              </Typography>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {statistics.validatedHypotheses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="findings">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Findings
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
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key="campaigns">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Campaigns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {statistics.activeCampaigns}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Query Builder */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Query Builder
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={queryLanguage}
                  label="Language"
                  onChange={(e) => setQueryLanguage(e.target.value as 'kql' | 'spl' | 'sql' | 'lucene')}
                >
                  <MenuItem value="kql">KQL</MenuItem>
                  <MenuItem value="spl">SPL</MenuItem>
                  <MenuItem value="sql">SQL</MenuItem>
                  <MenuItem value="lucene">Lucene</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Enter your hunting query here..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              sx={{ mb: 2, fontFamily: 'monospace' }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={executing ? <CircularProgress size={20} /> : <PlayIcon />}
                onClick={handleExecuteQuery}
                disabled={executing || !queryText.trim()}
              >
                {executing ? 'Executing...' : 'Execute Query'}
              </Button>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => setOpenQueryDialog(true)}>
                Save Query
              </Button>
            </Box>
          </Paper>

          {/* Query Results */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Query Results
            </Typography>
            {queryResult ? (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip label={`${queryResult.totalHits} hits`} color="primary" />
                  <Chip label={`${queryResult.executionTime}s`} variant="outlined" />
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {queryResult.events.length > 0 &&
                          Object.keys(queryResult.events[0]).map((key) => (
                            <TableCell key={key}>{key}</TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {queryResult.events.map((event, idx) => (
                        <TableRow key={idx}>
                          {Object.values(event).map((value, vidx) => (
                            <TableCell key={vidx}>
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Execute a query to see results</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Hunting Hypotheses */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Hunting Hypotheses
            </Typography>
            <List>
              {hypotheses.map((hypothesis) => (
                <ListItem key={hypothesis.id} disablePadding>
                  <ListItemButton
                    selected={selectedHypothesis?.id === hypothesis.id}
                    onClick={() => handleHypothesisClick(hypothesis)}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemText
                      primary={hypothesis.title}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={hypothesis.priority}
                            size="small"
                            color={getPriorityColor(hypothesis.priority)}
                          />
                          <Chip
                            label={hypothesis.status}
                            size="small"
                            color={getStatusColor(hypothesis.status)}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>

          {selectedHypothesis && findings.length > 0 && (
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Findings ({findings.length})
              </Typography>
              <List>
                {findings.map((finding) => (
                  <ListItem key={finding.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {finding.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={finding.severity} size="small" color={getPriorityColor(finding.severity)} />
                      <Chip label={finding.status} size="small" variant="outlined" />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* New Hypothesis Dialog */}
      <Dialog open={openHypothesisDialog} onClose={() => setOpenHypothesisDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Hunting Hypothesis</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select label="Category">
              <MenuItem value="malware">Malware</MenuItem>
              <MenuItem value="insider-threat">Insider Threat</MenuItem>
              <MenuItem value="apt">APT</MenuItem>
              <MenuItem value="data-exfiltration">Data Exfiltration</MenuItem>
              <MenuItem value="lateral-movement">Lateral Movement</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority">
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHypothesisDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenHypothesisDialog(false)}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Query Dialog */}
      <Dialog open={openQueryDialog} onClose={() => setOpenQueryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Query</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Query Name"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQueryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenQueryDialog(false)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
