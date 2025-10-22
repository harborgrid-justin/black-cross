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
