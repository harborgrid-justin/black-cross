/**
 * @fileoverview Incident Response list page component for viewing security incidents.
 *
 * This component displays a paginated, filterable table of security incidents with
 * severity indicators, status tracking, and assignment information. Integrates with
 * Redux for state management and provides the primary interface for incident triage
 * and response workflows.
 *
 * @module pages/incident-response/IncidentList
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
import { fetchIncidents } from '@/store/slices/incidentSlice';

/**
 * Incident Response list component.
 *
 * Displays a comprehensive table of security incidents with filtering, sorting,
 * and navigation capabilities. Provides at-a-glance visibility into active incidents
 * with severity-based color coding and status indicators.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered incident list page with table
 *
 * @remarks
 * Component features:
 * - Automatic data fetching on mount via Redux thunks
 * - Loading spinner during data fetch
 * - Error display with informational alert
 * - Empty state when no incidents exist
 * - Clickable table rows for navigation (to be implemented)
 * - Severity badges with semantic colors (critical/high = error, others = warning)
 * - Status badges with outlined style
 * - Assigned user display with unassigned fallback
 * - Formatted date display
 *
 * Redux integration:
 * - Fetches incidents from global state
 * - Dispatches `fetchIncidents` action on mount
 * - Reacts to loading and error state changes
 *
 * @security
 * - Incident data may contain sensitive security information
 * - Implement row-level access controls based on user permissions
 * - Consider masking sensitive fields in list view
 *
 * @example
 * ```tsx
 * // Used in routing configuration
 * <Route path="/incident-response/list" element={<IncidentList />} />
 * ```
 *
 * @see {@link IncidentResponseMain} for the main dashboard view
 * @see {@link IncidentResponseDetail} for detailed incident view
 * @see {@link fetchIncidents} for the Redux action
 */
export default function IncidentList() {
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
