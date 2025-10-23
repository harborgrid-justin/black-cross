/**
 * @fileoverview Risk Assessment detail page. Shows detailed information for a single item.
 * 
 * @module pages/risk-assessment/RiskAssessmentDetail.tsx
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function RiskAssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/risk-assessment')} sx={{ mb: 2 }}>Back to Risk Assessment</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Risk Assessment Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
