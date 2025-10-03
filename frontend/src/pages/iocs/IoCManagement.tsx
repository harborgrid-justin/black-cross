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
import { iocService } from '@/services/iocService';
import type { IoC } from '@/types';

export default function IoCManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iocs, setIoCs] = useState<IoC[]>([]);

  useEffect(() => {
    const fetchIoCs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await iocService.getIoCs();
        if (response.success && response.data) {
          setIoCs(response.data);
        }
      } catch (err) {
        console.error('Error fetching IoCs:', err);
        setError('Failed to load IoCs. Showing mock data.');
        // Mock data fallback
        setIoCs([
          { 
            id: '1', 
            type: 'ip', 
            value: '192.168.1.100', 
            confidence: 95, 
            status: 'active',
            source: 'Internal',
            tags: ['suspicious'],
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          },
          { 
            id: '2', 
            type: 'domain', 
            value: 'malicious-site.com', 
            confidence: 88, 
            status: 'active',
            source: 'Threat Feed',
            tags: ['malware'],
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          },
          { 
            id: '3', 
            type: 'hash', 
            value: 'a1b2c3d4e5f6...', 
            confidence: 92, 
            status: 'active',
            source: 'Analysis',
            tags: ['ransomware'],
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          },
        ] as IoC[]);
      } finally {
        setLoading(false);
      }
    };

    fetchIoCs();
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
