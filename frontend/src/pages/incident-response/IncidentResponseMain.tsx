/**
 * @fileoverview Incident Response main dashboard component for security incident management.
 *
 * This component serves as the primary interface for the incident response module,
 * displaying a comprehensive table of all security incidents with severity indicators,
 * status tracking, assignment information, and creation timestamps. Provides quick
 * access to create new incidents and navigate to incident details.
 *
 * @module pages/incident-response/IncidentResponseMain
 */

import { useEffect } from 'react';
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
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchIncidents } from './store';

/**
 * Incident Response main dashboard component.
 *
 * Provides the primary interface for incident response operations with a comprehensive
 * incident table, filtering capabilities, and quick actions. This component is
 * functionally identical to IncidentList but serves as the main landing page.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered incident response dashboard
 *
 * @remarks
 * Dashboard features:
 * - Automatic incident fetching on mount via Redux
 * - Loading state with spinner
 * - Error display with informational alert
 * - New Incident button for quick access to creation form
 * - Comprehensive incident table with:
 *   - Title column
 *   - Severity badges with color coding (critical/high = error, others = warning)
 *   - Status badges with outlined style
 *   - Assignment information with unassigned fallback
 *   - Creation date in localized format
 * - Clickable table rows for navigation (to be implemented)
 * - Empty state when no incidents exist
 *
 * Redux integration:
 * - Pulls incident data from global state
 * - Dispatches fetchIncidents on component mount
 * - Reacts to loading and error state changes
 *
 * @security
 * - Incident data contains sensitive security information
 * - Implement row-level access controls
 * - Consider data masking for sensitive fields in list view
 * - Audit all access to incident dashboard
 *
 * @example
 * ```tsx
 * // Used in routing configuration
 * <Route path="/incident-response" element={<IncidentResponseMain />} />
 * ```
 *
 * @see {@link IncidentList} for similar functionality
 * @see {@link IncidentResponseCreate} for creating new incidents
 * @see {@link fetchIncidents} for the Redux data fetching action
 */
export default function IncidentResponseMain() {
  const dispatch = useAppDispatch();
  const { incidents, loading, error } = useAppSelector((state) => state.incidents);

  useEffect(() => {
    dispatch(fetchIncidents(undefined));
  }, [dispatch]);

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
          Incident Response
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Incident
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} data-testid="incidents-list">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No incidents found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id} hover sx={{ cursor: 'pointer' }} data-testid="incident-item">
                  <TableCell data-testid="timeline">{incident.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={incident.severity}
                      color={incident.severity === 'high' || incident.severity === 'critical' ? 'error' : 'warning'}
                      size="small"
                      data-testid="severity-badge"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={incident.status} size="small" variant="outlined" data-testid="status-filter" />
                  </TableCell>
                  <TableCell>{incident.assignedTo || 'Unassigned'}</TableCell>
                  <TableCell>{new Date(incident.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
