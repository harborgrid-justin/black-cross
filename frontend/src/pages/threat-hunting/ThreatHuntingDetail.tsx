/**
 * @fileoverview Threat Hunting detail page. Shows detailed information for a single item.
 * 
 * @module pages/threat-hunting/ThreatHuntingDetail.tsx
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function ThreatHuntingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/threat-hunting')} sx={{ mb: 2 }}>Back to Threat Hunting</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Threat Hunting Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
