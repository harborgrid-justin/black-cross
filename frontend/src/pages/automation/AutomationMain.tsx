/**
 * @fileoverview Automation main page. Primary landing page for the Automation module.
 * 
 * @module pages/automation/AutomationMain.tsx
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
import { fetchPlaybooks, executePlaybook } from './store';

/**
 * AutomationMain page component displaying automation playbooks list and management.
 *
 * Primary landing page for the Automation module, showing all configured playbooks
 * with their status, execution history, and action buttons. Integrates with Redux
 * for state management and provides playbook execution capabilities.
 *
 * **Features:**
 * - Displays table of all automation playbooks
 * - Shows playbook status (active/inactive), executions count, and last run time
 * - Run button to execute playbooks directly from list
 * - Loading and error state handling
 * - Create new playbook button (links to creation form)
 *
 * **State Management:**
 * - Uses Redux automation slice via useAppSelector
 * - Fetches playbooks on component mount
 * - Refreshes playbooks after execution
 *
 * **Data Flow:**
 * 1. Component mounts → dispatch fetchPlaybooks()
 * 2. User clicks Run → dispatch executePlaybook(id)
 * 3. After execution → re-fetch playbooks to update status
 *
 * @component
 * @returns {JSX.Element} Rendered automation main page with playbooks table
 *
 * @example
 * ```tsx
 * <Route path="/automation" element={<AutomationMain />} />
 * ```
 */
export default function AutomationMain() {
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
