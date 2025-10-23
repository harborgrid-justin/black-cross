/**
 * @fileoverview Threat Actors edit page. Form for editing existing Threat Actors entries.
 * 
 * @module pages/threat-actors/ThreatActorsEdit.tsx
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function ThreatActorsEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/threat-actors/${id}`)} sx={{ mb: 2 }}>Back</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Edit Threat Actors</Typography>
      </Paper>
    </Box>
  );
}
