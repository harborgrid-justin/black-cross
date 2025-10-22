/**
 * WF-COMP-007 | IncidentResponseDetail.tsx - Incident detail page
 * Purpose: Display detailed information about a specific incident
 * Last Updated: 2025-10-22 | File Type: .tsx
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchIncidentById, clearSelectedIncident } from './store';

export default function IncidentResponseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedIncident: incident, loading, error } = useAppSelector((state) => state.incidents);

  useEffect(() => {
    if (id) {
      dispatch(fetchIncidentById(id));
    }
    return () => {
      dispatch(clearSelectedIncident());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/incident-response')} sx={{ mb: 2 }}>
          Back to Incidents
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!incident) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/incident-response')} sx={{ mb: 2 }}>
          Back to Incidents
        </Button>
        <Alert severity="info">Incident not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/incident-response')}>
          Back to Incidents
        </Button>
        <Button startIcon={<EditIcon />} variant="contained" onClick={() => navigate(`/incident-response/${id}/edit`)}>
          Edit Incident
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          {incident.title}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Severity
            </Typography>
            <Chip
              label={incident.severity}
              color={incident.severity === 'critical' || incident.severity === 'high' ? 'error' : 'warning'}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip label={incident.status} sx={{ mt: 1 }} variant="outlined" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {incident.description || 'No description available'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Assigned To
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {incident.assignedTo || 'Unassigned'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {new Date(incident.createdAt).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
