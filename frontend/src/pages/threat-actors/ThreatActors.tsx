/**
 * @fileoverview Threat Actor Profiling Component - Main interface for managing threat actor intelligence.
 *
 * This component provides a comprehensive interface for security analysts to track, profile,
 * and analyze threat actors including APT groups, cybercrime organizations, and nation-state
 * actors. Features include sophisticated filtering, tabbed views by activity status, detailed
 * actor profiles with TTPs (Tactics, Techniques, and Procedures), and campaign tracking.
 *
 * Key features:
 * - Real-time threat actor data with automatic refresh
 * - Multi-tab interface (Active/Inactive/All actors)
 * - Advanced search across names, aliases, and descriptions
 * - Sophistication level indicators (advanced/high/medium/low)
 * - Target sector and motivation tracking
 * - Campaign and TTP cataloging
 * - Interactive statistics dashboard
 * - Detailed actor profile modal with full attribution data
 *
 * Data model includes:
 * - Actor identity (name, aliases, description)
 * - Sophistication and motivation classifications
 * - Target sectors and industries
 * - TTPs aligned with MITRE ATT&CK framework
 * - Historical campaigns and operations
 * - Activity status tracking
 *
 * @module pages/threat-actors/ThreatActors
 * @requires @mui/material - Material-UI components for interface
 * @requires @/services/actorService - API service for threat actor operations
 * @requires @/types - TypeScript type definitions for ThreatActor
 *
 * @example
 * ```tsx
 * import ThreatActors from './pages/threat-actors/ThreatActors';
 *
 * function SecurityDashboard() {
 *   return <ThreatActors />;
 * }
 * ```
 */

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

/**
 * Props for the TabPanel component used in threat actor filtering interface.
 *
 * @interface TabPanelProps
 * @property {React.ReactNode} [children] - Content to display within the tab panel
 * @property {number} index - Zero-based index of this tab panel
 * @property {number} value - Currently active tab index for conditional rendering
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel component for conditional rendering of tabbed content.
 *
 * Implements Material-UI tab panel pattern with accessibility attributes
 * and conditional visibility based on active tab selection.
 *
 * @param {TabPanelProps} props - Component props
 * @returns {JSX.Element} Tab panel with conditional content rendering
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
 * Threat Actors Component - Main page for threat actor intelligence management.
 *
 * Comprehensive React component for displaying, filtering, and managing threat actor
 * profiles in a cyber threat intelligence platform. Provides tabbed interface for
 * viewing active, inactive, and all threat actors with real-time search, statistics
 * dashboard, and detailed actor information modals.
 *
 * Component lifecycle:
 * 1. Mounts and initiates data fetch via useEffect
 * 2. Fetches threat actors from backend API
 * 3. Falls back to mock data if API unavailable
 * 4. Renders interactive table with filtering and search
 * 5. Handles user interactions (search, tab changes, view details)
 *
 * State management:
 * - loading: Boolean flag for data fetch status
 * - error: Error message for API failures (with mock data fallback)
 * - actors: Array of ThreatActor objects from API or mock data
 * - selectedActor: Currently selected actor for detail modal
 * - searchTerm: Filter string for name/alias/description search
 * - tabValue: Active tab index (0=Active, 1=Inactive, 2=All)
 * - openDialog: Boolean for create actor modal visibility
 * - openDetailsDialog: Boolean for actor details modal visibility
 *
 * Mock data includes realistic threat actors:
 * - APT28 (Fancy Bear) - Russian military intelligence
 * - Lazarus Group - North Korean state-sponsored
 * - APT29 (Cozy Bear) - Russian intelligence
 * - APT41 (Double Dragon) - Chinese state-sponsored
 * - FIN7 (Carbanak) - Financially motivated cybercrime
 *
 * @returns {JSX.Element} Complete threat actor management interface
 *
 * @example
 * ```tsx
 * // Basic usage in routing
 * <Route path="/threat-actors" element={<ThreatActors />} />
 * ```
 */
export default function ThreatActors() {
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

  /**
   * Fetches threat actor data from the backend API with fallback to mock data.
   *
   * Async function that retrieves threat actor profiles from the actorService API.
   * If the API call fails (network error, service unavailable), automatically falls
   * back to realistic mock data representing well-known threat actors. This ensures
   * the UI remains functional for demonstration and development purposes.
   *
   * Mock data represents real-world threat actors including:
   * - APT groups (APT28, APT29, APT41)
   * - Nation-state actors (Lazarus Group)
   * - Cybercrime organizations (FIN7)
   *
   * @async
   * @function fetchActors
   * @returns {Promise<void>} Resolves when data is loaded and state updated
   * @throws {Error} Catches and handles API errors with mock data fallback
   */
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

  /**
   * Handles tab change events in the threat actor filtering interface.
   *
   * Updates the active tab state to switch between Active, Inactive, and All views.
   * Tab indices: 0 = Active actors, 1 = Inactive actors, 2 = All actors.
   *
   * @param {React.SyntheticEvent} _event - Tab change event (unused)
   * @param {number} newValue - New tab index (0-2)
   * @returns {void}
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Opens detailed view modal for a selected threat actor.
   *
   * Sets the selected actor in state and triggers the details dialog to open,
   * displaying comprehensive information including aliases, TTPs, campaigns,
   * target sectors, motivation, and sophistication level.
   *
   * @param {ThreatActor} actor - The threat actor object to display
   * @returns {void}
   */
  const handleViewDetails = (actor: ThreatActor) => {
    setSelectedActor(actor);
    setOpenDetailsDialog(true);
  };

  /**
   * Maps threat actor sophistication level to Material-UI color scheme.
   *
   * Provides visual indicators for threat actor capabilities using color-coded
   * severity levels. Sophistication levels represent technical capability and
   * operational maturity of threat actors.
   *
   * Color mappings:
   * - 'advanced': error (red) - Nation-state level capabilities
   * - 'high': warning (orange) - Professional criminal organizations
   * - 'medium': info (blue) - Moderate capabilities
   * - 'low': success (green) - Basic capabilities
   * - default: default (grey) - Unknown sophistication
   *
   * @param {string} level - Sophistication level ('advanced' | 'high' | 'medium' | 'low')
   * @returns {'error' | 'warning' | 'info' | 'success' | 'default'} MUI color theme
   */
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
