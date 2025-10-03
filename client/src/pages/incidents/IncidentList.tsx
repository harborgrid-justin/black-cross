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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function IncidentList() {
  const mockIncidents = [
    {
      id: '1',
      title: 'Phishing Attack on Finance Department',
      severity: 'high',
      status: 'investigating',
      assignedTo: 'John Doe',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Suspicious Login Activity',
      severity: 'medium',
      status: 'open',
      assignedTo: 'Jane Smith',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

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

      <TableContainer component={Paper}>
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
            {mockIncidents.map((incident) => (
              <TableRow key={incident.id} hover sx={{ cursor: 'pointer' }}>
                <TableCell>{incident.title}</TableCell>
                <TableCell>
                  <Chip
                    label={incident.severity}
                    color={incident.severity === 'high' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={incident.status} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{incident.assignedTo}</TableCell>
                <TableCell>{new Date(incident.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
