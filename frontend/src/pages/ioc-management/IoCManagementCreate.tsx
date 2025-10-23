/**
 * @fileoverview Ioc Management creation page. Form for creating new Ioc Management entries.
 * 
 * @module pages/ioc-management/IoCManagementCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function IoCManagementCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/ioc-management')} sx={{ mb: 2 }}>Back to IoC Management</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New IoC Management Item</Typography>
      </Paper>
    </Box>
  );
}
