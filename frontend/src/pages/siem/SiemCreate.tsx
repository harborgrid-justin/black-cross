/**
 * @fileoverview Siem creation page. Form for creating new Siem entries.
 * 
 * @module pages/siem/SiemCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function SiemCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/siem')} sx={{ mb: 2 }}>Back to SIEM</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create SIEM Event</Typography>
      </Paper>
    </Box>
  );
}
