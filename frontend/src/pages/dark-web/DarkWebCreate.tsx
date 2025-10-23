/**
 * @fileoverview Dark Web creation page. Form for creating new Dark Web entries.
 * 
 * @module pages/dark-web/DarkWebCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function DarkWebCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/dark-web')} sx={{ mb: 2 }}>Back to Dark Web</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Dark Web Item</Typography>
      </Paper>
    </Box>
  );
}
