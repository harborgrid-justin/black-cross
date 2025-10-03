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

export default function IoCManagement() {
  const mockIoCs = [
    { id: '1', type: 'ip', value: '192.168.1.100', confidence: 95, status: 'active' },
    { id: '2', type: 'domain', value: 'malicious-site.com', confidence: 88, status: 'active' },
    { id: '3', type: 'hash', value: 'a1b2c3d4e5f6...', confidence: 92, status: 'active' },
  ];

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
            {mockIoCs.map((ioc) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
