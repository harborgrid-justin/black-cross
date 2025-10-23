/**
 * @fileoverview Risk Assessment edit page. Form for editing existing Risk Assessment entries.
 * 
 * @module pages/risk-assessment/RiskAssessmentEdit.tsx
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function RiskAssessmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/risk-assessment/${id}`)} sx={{ mb: 2 }}>Back</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Edit Risk Assessment</Typography>
      </Paper>
    </Box>
  );
}
