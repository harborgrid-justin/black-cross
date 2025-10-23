/**
 * @fileoverview Reporting creation page. Form for creating new Reporting entries.
 * 
 * @module pages/reporting/ReportingCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function ReportingCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/reporting')} sx={{ mb: 2 }}>Back to Reporting</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Reporting Item</Typography>
      </Paper>
    </Box>
  );
}
