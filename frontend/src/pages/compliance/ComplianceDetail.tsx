import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function ComplianceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/compliance')} sx={{ mb: 2 }}>Back to Compliance</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Compliance Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
