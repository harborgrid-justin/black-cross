/**
 * @fileoverview Draft Workspace page component for managing work-in-progress items.
 *
 * This component provides a centralized interface for viewing and managing draft
 * items across all modules in the application. Supports filtering, version control,
 * and status tracking for incomplete work items including incidents, vulnerabilities,
 * reports, and other security entities.
 *
 * @module pages/draft-workspace/DraftWorkspacePage
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { draftWorkspaceService, type Draft, DraftStatus } from '@/services/draftWorkspaceService';

/**
 * Draft Workspace page component.
 *
 * Provides a unified interface for managing draft items from across the application.
 * Users can view all their work-in-progress items, filter by entity type and status,
 * and take action on drafts such as resuming work, discarding, or submitting.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered draft workspace page with draft listing
 *
 * @remarks
 * Component state management:
 * - `drafts` - Array of all draft items for the current user
 * - `loading` - Loading state during async operations
 * - `error` - Error message if draft loading fails
 *
 * Features:
 * - Table view of all drafts with key metadata
 * - Status badges with semantic colors
 * - Version number display
 * - Last modified timestamps
 * - Refresh functionality to reload drafts
 * - Empty state when no drafts exist
 *
 * Draft entity types supported:
 * - Incidents
 * - Vulnerabilities
 * - Threat Intelligence
 * - Reports
 * - Risk Assessments
 * - And other security entities
 *
 * @example
 * ```tsx
 * // Used in routing configuration
 * <Route path="/draft-workspace" element={<DraftWorkspacePage />} />
 * ```
 *
 * @see {@link draftWorkspaceService} for API integration
 * @see {@link Draft} for the draft data model
 * @see {@link DraftStatus} for available status values
 */
export default function DraftWorkspacePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads all drafts for the current user from the backend.
   *
   * Fetches draft items via the draft workspace service and updates component state
   * with the results. Handles loading and error states appropriately.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @throws {Error} Logs error to console and displays user-friendly error message
   */
  const loadDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await draftWorkspaceService.getDrafts();
      setDrafts(response.data || []);
    } catch (err) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  /**
   * Maps draft status to Material-UI color variants.
   *
   * Determines the appropriate color scheme for status chips based on the
   * draft's current state. Uses semantic colors that convey status meaning.
   *
   * @param {DraftStatus} status - The draft status to map
   * @returns {'info' | 'success' | 'primary' | 'error' | 'default'} Material-UI color variant
   *
   * @example
   * ```tsx
   * <Chip
   *   label={draft.status}
   *   color={getStatusColor(draft.status)}
   * />
   * ```
   */
  const getStatusColor = (status: DraftStatus) => {
    switch (status) {
      case DraftStatus.ACTIVE:
        return 'info';
      case DraftStatus.SAVED:
        return 'success';
      case DraftStatus.SUBMITTED:
        return 'primary';
      case DraftStatus.DISCARDED:
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Draft Workspace
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDrafts}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Draft
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              {drafts.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  No drafts found
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Entity Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Version</TableCell>
                        <TableCell>Last Modified</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {drafts.map((draft) => (
                        <TableRow key={draft.id} hover>
                          <TableCell>{draft.id.substring(0, 8)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {draft.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {draft.entity_type.replace('_', ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={draft.status}
                              size="small"
                              color={getStatusColor(draft.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              v{draft.version}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(draft.last_modified).toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
