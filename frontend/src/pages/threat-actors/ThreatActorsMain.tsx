import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { actorService } from '@/services/actorService';
import type { ThreatActor } from '@/types';

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

export default function ThreatActorsMain() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    fetchActors();
  }, []);

  const fetchActors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await actorService.getActors();
      if (response.success && response.data) {
        setActors(response.data);
      }
    } catch (err) {
      console.error('Error fetching threat actors:', err);
      setError('Failed to load threat actors. Showing mock data.');
      // Mock data fallback
      setActors([
        {
          id: '1',
          name: 'APT28',
          aliases: ['Fancy Bear', 'Sofacy', 'Pawn Storm'],
          description: 'Advanced persistent threat group attributed to Russian military intelligence',
          sophistication: 'advanced',
          motivation: ['Espionage', 'Political'],
          targetSectors: ['Government', 'Military', 'Defense', 'Media'],
          ttps: ['Spear Phishing', 'Zero-day Exploits', 'Custom Malware'],
          campaigns: ['Operation Ghost', 'DNC Hack'],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Lazarus Group',
          aliases: ['Hidden Cobra', 'Zinc', 'Guardians of Peace'],
          description: 'State-sponsored threat actor attributed to North Korea',
          sophistication: 'advanced',
          motivation: ['Financial', 'Political'],
          targetSectors: ['Financial', 'Cryptocurrency', 'Media', 'Energy'],
          ttps: ['Malware', 'Ransomware', 'Supply Chain Attacks'],
          campaigns: ['WannaCry', 'Sony Pictures Hack'],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'APT29',
          aliases: ['Cozy Bear', 'The Dukes'],
          description: 'Russian intelligence-linked advanced persistent threat group',
          sophistication: 'advanced',
          motivation: ['Espionage'],
          targetSectors: ['Government', 'Think Tanks', 'Healthcare'],
          ttps: ['Stealth Malware', 'Living off the Land'],
          campaigns: ['SolarWinds Compromise'],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'APT41',
          aliases: ['Double Dragon', 'Winnti'],
          description: 'Chinese state-sponsored group conducting espionage and financially motivated operations',
          sophistication: 'high',
          motivation: ['Espionage', 'Financial'],
          targetSectors: ['Technology', 'Gaming', 'Telecommunications', 'Healthcare'],
          ttps: ['Supply Chain Compromise', 'Web Shell Deployment'],
          campaigns: ['CCleaner Compromise'],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'FIN7',
          aliases: ['Carbanak Group'],
          description: 'Financially motivated cybercrime group targeting retail and hospitality',
          sophistication: 'high',
          motivation: ['Financial'],
          targetSectors: ['Retail', 'Hospitality', 'Restaurant'],
          ttps: ['Point of Sale Malware', 'Phishing'],
          campaigns: ['Carbanak Campaign'],
          active: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ] as ThreatActor[]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (actor: ThreatActor) => {
    setSelectedActor(actor);
    setOpenDetailsDialog(true);
  };

  const getSophisticationColor = (level: string) => {
    switch (level) {
      case 'advanced':
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

  const filteredActors = actors.filter(
    (actor) =>
      actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.aliases.some((alias) => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
      actor.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeActors = filteredActors.filter((a) => a.active);
  const inactiveActors = filteredActors.filter((a) => !a.active);

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
          Threat Actor Profiling
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchActors}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Actor
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Actors
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {actors.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key="active">
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                    {activeActors.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key="advanced">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Advanced Sophistication
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {actors.filter((a) => a.sophistication === 'advanced').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key="campaigns">
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Campaigns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {actors.reduce((sum, actor) => sum + actor.campaigns.length, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search threat actors..."
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

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Active (${activeActors.length})`} />
          <Tab label={`Inactive (${inactiveActors.length})`} />
          <Tab label={`All (${filteredActors.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Aliases</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sophistication</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Motivation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Target Sectors</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeActors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No active threat actors found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeActors.map((actor) => (
                    <TableRow key={actor.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {actor.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {actor.aliases.slice(0, 2).map((alias) => (
                          <Chip key={alias} label={alias} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                        {actor.aliases.length > 2 && (
                          <Chip label={`+${actor.aliases.length - 2}`} size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={actor.sophistication}
                          size="small"
                          color={getSophisticationColor(actor.sophistication)}
                        />
                      </TableCell>
                      <TableCell>{actor.motivation.join(', ')}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {actor.targetSectors.slice(0, 2).join(', ')}
                          {actor.targetSectors.length > 2 && ` +${actor.targetSectors.length - 2}`}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewDetails(actor)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Aliases</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sophistication</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Motivation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Target Sectors</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inactiveActors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No inactive threat actors found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  inactiveActors.map((actor) => (
                    <TableRow key={actor.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {actor.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {actor.aliases.slice(0, 2).map((alias) => (
                          <Chip key={alias} label={alias} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                        {actor.aliases.length > 2 && (
                          <Chip label={`+${actor.aliases.length - 2}`} size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={actor.sophistication}
                          size="small"
                          color={getSophisticationColor(actor.sophistication)}
                        />
                      </TableCell>
                      <TableCell>{actor.motivation.join(', ')}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {actor.targetSectors.slice(0, 2).join(', ')}
                          {actor.targetSectors.length > 2 && ` +${actor.targetSectors.length - 2}`}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewDetails(actor)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Aliases</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sophistication</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Motivation</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No threat actors found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActors.map((actor) => (
                    <TableRow key={actor.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {actor.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {actor.aliases.slice(0, 2).map((alias) => (
                          <Chip key={alias} label={alias} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={actor.sophistication}
                          size="small"
                          color={getSophisticationColor(actor.sophistication)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={actor.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={actor.active ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{actor.motivation.join(', ')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewDetails(actor)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Add Actor Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Threat Actor</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Name" fullWidth variant="outlined" sx={{ mb: 2 }} />
          <TextField margin="dense" label="Aliases (comma-separated)" fullWidth variant="outlined" sx={{ mb: 2 }} />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Target Sectors (comma-separated)"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Threat Actor Details</DialogTitle>
        <DialogContent>
          {selectedActor && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedActor.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {selectedActor.aliases.map((alias) => (
                  <Chip key={alias} label={alias} size="small" />
                ))}
              </Box>
              <Typography variant="body1" paragraph>
                {selectedActor.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Sophistication
                  </Typography>
                  <Chip
                    label={selectedActor.sophistication}
                    color={getSophisticationColor(selectedActor.sophistication)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={selectedActor.active ? 'Active' : 'Inactive'}
                    color={selectedActor.active ? 'error' : 'default'}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Motivation
                </Typography>
                <List dense>
                  {selectedActor.motivation.map((m) => (
                    <ListItem key={m}>
                      <ListItemText primary={m} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Target Sectors
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedActor.targetSectors.map((sector) => (
                    <Chip key={sector} label={sector} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  TTPs
                </Typography>
                <List dense>
                  {selectedActor.ttps.map((ttp) => (
                    <ListItem key={ttp}>
                      <ListItemText primary={ttp} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Campaigns
                </Typography>
                <List dense>
                  {selectedActor.campaigns.map((campaign) => (
                    <ListItem key={campaign}>
                      <ListItemText primary={campaign} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
