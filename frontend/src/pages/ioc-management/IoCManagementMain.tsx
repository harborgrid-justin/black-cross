/**
 * @fileoverview IoC Management main page component.
 *
 * Primary landing page for the Indicators of Compromise (IoC) Management module.
 * Displays a table of IoCs with type, value, confidence, and status information.
 * Provides loading states, error handling, and an "Add IoC" action button.
 *
 * ## Features
 * - Automatically fetches IoCs on component mount
 * - Displays loading spinner during data fetch
 * - Shows error alerts when data loading fails
 * - Table view with type, value, confidence, and status columns
 * - Empty state message when no IoCs are found
 * - Add IoC button for creating new indicators
 *
 * ## State Management
 * Uses Redux for state management via the iocs slice. Consumes:
 * - iocs: Array of IoC records
 * - loading: Boolean indicating fetch status
 * - error: Error message string if fetch fails
 *
 * @module pages/ioc-management/IoCManagementMain
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
import { fetchIoCs } from './store';

/**
 * IoC Management main page component.
 *
 * Renders the primary view for managing Indicators of Compromise (IoCs).
 * Displays a table with IoC data including type, value, confidence level,
 * and status. Automatically fetches IoCs when the component mounts.
 *
 * @component
 * @returns {JSX.Element} The IoC Management main page
 *
 * @example
 * ```tsx
 * <IoCManagementMain />
 * ```
 */
export default function IoCManagementMain() {
  const dispatch = useAppDispatch();
  const { iocs, loading, error } = useAppSelector((state) => state.iocs);

  useEffect(() => {
    dispatch(fetchIoCs(undefined));
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
          IoC Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add IoC
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Confidence</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {iocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No IoCs found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              iocs.map((ioc) => (
                <TableRow key={ioc.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Chip label={ioc.type} size="small" />
                  </TableCell>
                  <TableCell>{ioc.value}</TableCell>
                  <TableCell>{ioc.confidence}%</TableCell>
                  <TableCell>
                    <Chip label={ioc.status} size="small" color="success" variant="outlined" />
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
