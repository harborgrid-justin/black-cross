import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export default function ThreatFeedsCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/threat-feeds')} sx={{ mb: 2 }}>Back to Threat Feeds</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Threat Feeds Item</Typography>
      </Paper>
    </Box>
  );
}
