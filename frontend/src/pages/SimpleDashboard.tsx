import { Box, Typography, Alert } from '@mui/material';

export default function SimpleDashboard() {
  return (
    <Box data-testid="dashboard">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        🎉 Black-Cross Dashboard loaded successfully! The blank page issue has been resolved.
      </Alert>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Welcome to the Black-Cross Enterprise Cyber Threat Intelligence Platform.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        This is a simplified dashboard to verify the application is working correctly after fixing the React rendering issues.
      </Typography>
    </Box>
  );
}
