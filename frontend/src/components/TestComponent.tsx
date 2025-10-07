import { Box, Typography } from '@mui/material';

export default function TestComponent() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Component
      </Typography>
      <Typography variant="body1">
        If you can see this, the React rendering is working correctly.
      </Typography>
    </Box>
  );
}
