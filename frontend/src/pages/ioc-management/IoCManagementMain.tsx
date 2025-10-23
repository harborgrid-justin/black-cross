/**
 * @fileoverview Ioc Management main page. Primary landing page for the Ioc Management module.
 * 
 * @module pages/ioc-management/IoCManagementMain.tsx
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
