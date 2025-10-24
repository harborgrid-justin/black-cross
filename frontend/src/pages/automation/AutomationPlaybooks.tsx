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

/**
 * AutomationPlaybooks component displaying playbooks via global Redux store.
 *
 * Alternative implementation of playbook management using the global automation slice
 * instead of local module store. Functionally equivalent to AutomationMain but integrates
 * with centralized Redux store structure.
 *
 * **Features:**
 * - Displays table of all automation playbooks
 * - Shows playbook status (active/inactive), executions count, and last run time
 * - Run button to execute playbooks directly from list
 * - Loading and error state handling
 * - Create new playbook button
 *
 * **State Management:**
 * - Uses global Redux store (/store/slices/automationSlice)
 * - Fetches playbooks on component mount
 * - Refreshes playbooks after execution
 *
 * **Difference from AutomationMain:**
 * - Imports from global store path: @/store/slices/automationSlice
 * - AutomationMain imports from local: ./store
 *
 * @component
 * @returns {JSX.Element} Rendered automation playbooks page with table
 *
 * @example
 * ```tsx
 * <AutomationPlaybooks />
 * ```
 */
export default function AutomationPlaybooks() {
  const dispatch = useAppDispatch();
  const { playbooks, loading, error } = useAppSelector((state) => state.automation);

  useEffect(() => {
    dispatch(fetchPlaybooks());
  }, [dispatch]);

  /**
   * Handles playbook execution request.
   *
   * Dispatches the executePlaybook thunk and refreshes the playbooks list
   * to reflect updated execution counts and last run timestamps.
   *
   * @param {string} id - The unique identifier of the playbook to execute
   * @returns {Promise<void>} Promise that resolves when execution completes
   *
   * @example
   * ```tsx
   * <Button onClick={() => handleRunPlaybook('playbook-123')}>
   *   Run
   * </Button>
   * ```
   */
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
