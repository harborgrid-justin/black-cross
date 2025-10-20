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
import { Add as AddIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { playbookService } from '@/services/playbookService';

interface Playbook {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  executions: number;
  lastRun: string;
}

export default function AutomationPlaybooks() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await playbookService.listPlaybooks();
      if (response.success && response.data) {
        setPlaybooks(response.data);
      }
    } catch (err) {
      console.error('Error fetching playbooks:', err);
      setError('Failed to load playbooks. Showing mock data.');
      // Mock data fallback
      setPlaybooks([
        { id: '1', name: 'Phishing Response', status: 'active', executions: 45, lastRun: '2 hours ago' },
        { id: '2', name: 'Malware Containment', status: 'active', executions: 23, lastRun: '1 day ago' },
        { id: '3', name: 'DDoS Mitigation', status: 'inactive', executions: 12, lastRun: '3 days ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const handleRunPlaybook = async (id: string) => {
    try {
      await playbookService.executePlaybook(id);
      // Refresh playbooks after execution
      fetchPlaybooks();
    } catch (err) {
      console.error('Error running playbook:', err);
    }
  };

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
          Automated Response & Playbooks
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Playbook
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} data-testid="playbooks-list">
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
            {playbooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No playbooks found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              playbooks.map((playbook) => (
                <TableRow key={playbook.id} hover>
                  <TableCell>{playbook.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={playbook.status}
                      size="small"
                      color={playbook.status === 'active' ? 'success' : 'default'}
                      variant="outlined"
                      data-testid="status-filter"
                    />
                  </TableCell>
                  <TableCell data-testid="execution-history">{playbook.executions}</TableCell>
                  <TableCell>{playbook.lastRun}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      startIcon={<PlayIcon />}
                      onClick={() => handleRunPlaybook(playbook.id)}
                      disabled={playbook.status === 'inactive'}
                    >
                      Run
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
