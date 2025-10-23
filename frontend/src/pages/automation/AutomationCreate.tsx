/**
 * @fileoverview Automation creation page. Form for creating new Automation entries.
 * 
 * @module pages/automation/AutomationCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function AutomationCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/automation')} sx={{ mb: 2 }}>Back to Automation</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Automation</Typography>
      </Paper>
    </Box>
  );
}
