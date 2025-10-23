/**
 * @fileoverview Collaboration creation page. Form for creating new Collaboration entries.
 * 
 * @module pages/collaboration/CollaborationCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function CollaborationCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/collaboration')} sx={{ mb: 2 }}>Back to Collaboration</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Collaboration Item</Typography>
      </Paper>
    </Box>
  );
}
