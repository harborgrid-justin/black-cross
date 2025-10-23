/**
 * @fileoverview Test component for verifying React rendering.
 * 
 * @module components/TestComponent
 */

import { Box, Typography } from '@mui/material';

/**
 * Simple test component to verify React is rendering correctly.
 * 
 * Used for development and testing purposes to ensure the React
 * rendering pipeline is functioning properly.
 * 
 * @component
 * @returns {JSX.Element} Test component with sample text
 * @example
 * ```tsx
 * <TestComponent />
 * ```
 */
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
