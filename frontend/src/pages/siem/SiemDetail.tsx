/**
 * @fileoverview Siem detail page. Shows detailed information for a single item.
 * 
 * @module pages/siem/SiemDetail.tsx
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function SiemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/siem')} sx={{ mb: 2 }}>Back to SIEM</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>SIEM Event Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
