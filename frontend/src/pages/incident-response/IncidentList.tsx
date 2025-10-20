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
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { incidentService } from '@/services/incidentService';
import type { Incident } from '@/types';

export default function IncidentList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await incidentService.getIncidents();
        if (response.success && response.data) {
          setIncidents(response.data);
        }
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Failed to load incidents. Showing mock data.');
        // Mock data fallback
        setIncidents([
          {
            id: '1',
            title: 'Phishing Attack on Finance Department',
            description: 'Multiple employees received phishing emails',
            severity: 'high',
            status: 'investigating',
            priority: 1,
            assignedTo: 'John Doe',
            createdBy: 'System',
            affectedAssets: ['email-server'],
            timeline: [],
            evidence: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Suspicious Login Activity',
            description: 'Unusual login patterns detected',
            severity: 'medium',
            status: 'open',
            priority: 2,
            assignedTo: 'Jane Smith',
            createdBy: 'System',
            affectedAssets: ['auth-system'],
            timeline: [],
            evidence: [],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ] as Incident[]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

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
