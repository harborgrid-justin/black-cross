import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  CircularProgress,
  Alert,
  Button,
  Paper,
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
  TextField,
  FormControlLabel,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { feedService } from '@/services/feedService';

interface ThreatFeed {
  id: string;
  name: string;
  status: boolean;
  lastUpdate: string;
  feedType?: 'commercial' | 'open-source' | 'custom';
  reliability?: number;
  itemsToday?: number;
  totalItems?: number;
}

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

export default function ThreatFeeds() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<ThreatFeed[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.getFeeds();
      if (response.success && response.data) {
        setFeeds(response.data);
      }
    } catch (err) {
      console.error('Error fetching threat feeds:', err);
      setError('Failed to load threat feeds. Showing mock data.');
      // Mock data fallback
      setFeeds([
        {
          id: '1',
          name: 'AlienVault OTX',
          status: true,
          lastUpdate: '2 minutes ago',
          feedType: 'open-source',
          reliability: 95,
          itemsToday: 1247,
          totalItems: 45892,
        },
        {
          id: '2',
          name: 'MISP Feed',
          status: true,
          lastUpdate: '5 minutes ago',
          feedType: 'open-source',
          reliability: 92,
          itemsToday: 834,
          totalItems: 32156,
        },
        {
          id: '3',
          name: 'Abuse.ch',
          status: false,
          lastUpdate: '1 hour ago',
          feedType: 'open-source',
          reliability: 98,
          itemsToday: 456,
          totalItems: 28934,
        },
        {
          id: '4',
          name: 'Spamhaus',
          status: true,
          lastUpdate: '10 minutes ago',
          feedType: 'commercial',
          reliability: 99,
          itemsToday: 2341,
          totalItems: 89234,
        },
        {
          id: '5',
          name: 'ThreatConnect',
          status: true,
          lastUpdate: '3 minutes ago',
          feedType: 'commercial',
          reliability: 96,
          itemsToday: 987,
          totalItems: 54321,
        },
        {
          id: '6',
          name: 'Custom IOC Feed',
          status: true,
          lastUpdate: '15 minutes ago',
          feedType: 'custom',
          reliability: 88,
          itemsToday: 234,
          totalItems: 12456,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleToggleFeed = async (feedId: string, enabled: boolean) => {
    try {
      await feedService.toggleFeed(feedId, enabled);
      // Refresh feeds after toggle
      fetchFeeds();
    } catch (err) {
      console.error('Error toggling feed:', err);
      // Update locally for demo
      setFeeds(feeds.map((f) => (f.id === feedId ? { ...f, status: enabled } : f)));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingsClick = (feed: ThreatFeed) => {
    setSelectedFeed(feed);
    setOpenSettingsDialog(true);
  };

  const activeFeeds = feeds.filter((f) => f.status);
  const inactiveFeeds = feeds.filter((f) => !f.status);
  const commercialFeeds = feeds.filter((f) => f.feedType === 'commercial');
  const openSourceFeeds = feeds.filter((f) => f.feedType === 'open-source');
  const customFeeds = feeds.filter((f) => f.feedType === 'custom');

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
          Threat Intelligence Feeds
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchFeeds}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Feed
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key="total">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Feeds
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {feeds.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key="active">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Feeds
              </Typography>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {activeFeeds.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key="today">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Items Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {feeds.reduce((sum, feed) => sum + (feed.itemsToday || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key="total-items">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {feeds.reduce((sum, feed) => sum + (feed.totalItems || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`All Feeds (${feeds.length})`} />
          <Tab label={`Active (${activeFeeds.length})`} />
          <Tab label={`Commercial (${commercialFeeds.length})`} />
          <Tab label={`Open Source (${openSourceFeeds.length})`} />
          <Tab label={`Custom (${customFeeds.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {feeds.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No threat feeds configured.
                </Typography>
              </Grid>
            ) : (
              feeds.map((feed) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={feed.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{feed.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last update: {feed.lastUpdate}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={feed.status}
                            onChange={(e) => handleToggleFeed(feed.id, e.target.checked)}
                            color="success"
                          />
                          <IconButton size="small" onClick={() => handleSettingsClick(feed)}>
                            <SettingsIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">Reliability</Typography>
                          <Typography variant="caption">{feed.reliability}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={feed.reliability || 0}
                          color={
                            (feed.reliability || 0) >= 95
                              ? 'success'
                              : (feed.reliability || 0) >= 85
                              ? 'info'
                              : 'warning'
                          }
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={feed.feedType || 'unknown'}
                          size="small"
                          color={
                            feed.feedType === 'commercial'
                              ? 'primary'
                              : feed.feedType === 'open-source'
                              ? 'success'
                              : 'default'
                          }
                        />
                        <Chip
                          icon={feed.status ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={feed.status ? 'Active' : 'Inactive'}
                          size="small"
                          color={feed.status ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Today
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {feed.itemsToday?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {feed.totalItems?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {activeFeeds.map((feed) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={feed.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{feed.name}</Typography>
                      <Switch
                        checked={feed.status}
                        onChange={(e) => handleToggleFeed(feed.id, e.target.checked)}
                        color="success"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last update: {feed.lastUpdate}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label={`${feed.itemsToday} items today`} size="small" color="info" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feed Name</TableCell>
                  <TableCell>Reliability</TableCell>
                  <TableCell>Items Today</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commercialFeeds.map((feed) => (
                  <TableRow key={feed.id} hover>
                    <TableCell>{feed.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={feed.reliability || 0}
                          sx={{ width: 100, height: 6, borderRadius: 1 }}
                          color="success"
                        />
                        <Typography variant="caption">{feed.reliability}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{feed.itemsToday?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={feed.status ? 'Active' : 'Inactive'}
                        size="small"
                        color={feed.status ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Switch
                        checked={feed.status}
                        onChange={(e) => handleToggleFeed(feed.id, e.target.checked)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feed Name</TableCell>
                  <TableCell>Reliability</TableCell>
                  <TableCell>Items Today</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openSourceFeeds.map((feed) => (
                  <TableRow key={feed.id} hover>
                    <TableCell>{feed.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={feed.reliability || 0}
                          sx={{ width: 100, height: 6, borderRadius: 1 }}
                          color="info"
                        />
                        <Typography variant="caption">{feed.reliability}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{feed.itemsToday?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={feed.status ? 'Active' : 'Inactive'}
                        size="small"
                        color={feed.status ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Switch
                        checked={feed.status}
                        onChange={(e) => handleToggleFeed(feed.id, e.target.checked)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            {customFeeds.map((feed) => (
              <Grid size={{ xs: 12, md: 6 }} key={feed.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{feed.name}</Typography>
                      <Switch
                        checked={feed.status}
                        onChange={(e) => handleToggleFeed(feed.id, e.target.checked)}
                        color="success"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last update: {feed.lastUpdate}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Chip label={`${feed.itemsToday} items today`} size="small" />
                      <Chip label="Custom" size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Add Feed Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Threat Feed</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Feed Name" fullWidth variant="outlined" sx={{ mb: 2 }} />
          <TextField margin="dense" label="Feed URL" fullWidth variant="outlined" sx={{ mb: 2 }} />
          <TextField
            margin="dense"
            label="Feed Type"
            select
            fullWidth
            variant="outlined"
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            <option value="open-source">Open Source</option>
            <option value="commercial">Commercial</option>
            <option value="custom">Custom</option>
          </TextField>
          <FormControlLabel control={<Switch defaultChecked />} label="Enable feed" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Feed Settings</DialogTitle>
        <DialogContent>
          {selectedFeed && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFeed.name}
              </Typography>
              <TextField margin="dense" label="Update Frequency" fullWidth variant="outlined" sx={{ mb: 2 }} />
              <TextField
                margin="dense"
                label="Reliability Threshold"
                type="number"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <FormControlLabel control={<Switch checked={selectedFeed.status} />} label="Enable feed" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenSettingsDialog(false)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
