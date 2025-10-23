/**
 * @fileoverview Draft Workspace page component.
 * 
 * Displays user drafts with filtering, autosave management,
 * and version control.
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
 * @component
 */
export default function DraftWorkspacePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <Grid item xs={12}>
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
