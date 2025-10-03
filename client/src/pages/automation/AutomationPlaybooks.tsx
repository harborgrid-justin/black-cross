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
import { Add as AddIcon, PlayArrow as PlayIcon } from '@mui/icons-material';

export default function AutomationPlaybooks() {
  const playbooks = [
    { id: '1', name: 'Phishing Response', status: 'active', executions: 45, lastRun: '2 hours ago' },
    { id: '2', name: 'Malware Containment', status: 'active', executions: 23, lastRun: '1 day ago' },
    { id: '3', name: 'DDoS Mitigation', status: 'inactive', executions: 12, lastRun: '3 days ago' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Automated Response & Playbooks
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Playbook
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Executions</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Run</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {playbooks.map((playbook) => (
              <TableRow key={playbook.id} hover>
                <TableCell>{playbook.name}</TableCell>
                <TableCell>
                  <Chip
                    label={playbook.status}
                    size="small"
                    color={playbook.status === 'active' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{playbook.executions}</TableCell>
                <TableCell>{playbook.lastRun}</TableCell>
                <TableCell>
                  <Button size="small" startIcon={<PlayIcon />}>
                    Run
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
