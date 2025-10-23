/**
 * @fileoverview Risk Assessment creation page. Form for creating new Risk Assessment entries.
 * 
 * @module pages/risk-assessment/RiskAssessmentCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function RiskAssessmentCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/risk-assessment')} sx={{ mb: 2 }}>Back to Risk Assessment</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Risk Assessment Item</Typography>
      </Paper>
    </Box>
  );
}
