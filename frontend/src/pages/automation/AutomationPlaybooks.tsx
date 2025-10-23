/**
 * @fileoverview Automation - AutomationPlaybooks component. Component for Automation feature.
 * 
 * @module pages/automation/AutomationPlaybooks.tsx
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
import { Add as AddIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPlaybooks, executePlaybook } from '@/store/slices/automationSlice';

export default function AutomationPlaybooks() {
  const dispatch = useAppDispatch();
  const { playbooks, loading, error } = useAppSelector((state) => state.automation);

  useEffect(() => {
    dispatch(fetchPlaybooks());
  }, [dispatch]);

  const handleRunPlaybook = async (id: string) => {
    await dispatch(executePlaybook(id));
    dispatch(fetchPlaybooks());
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
