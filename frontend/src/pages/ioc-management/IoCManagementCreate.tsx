/**
 * @fileoverview IoC Management creation page component.
 *
 * Provides a form interface for creating new Indicators of Compromise (IoCs).
 * Currently displays a placeholder UI with navigation back to the main list.
 *
 * ## Planned Features
 * - Form fields for IoC type (IP, domain, hash, URL, etc.)
 * - Value input with validation
 * - Confidence level slider/input
 * - Status selection (active, inactive, expired)
 * - Tags and description fields
 * - Form validation with error messages
 * - Submit handler to create new IoC via Redux action
 *
 * @module pages/ioc-management/IoCManagementCreate
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * IoC creation form page component.
 *
 * Renders a form for creating new Indicators of Compromise. Currently
 * shows placeholder content pending full implementation.
 *
 * @component
 * @returns {JSX.Element} The IoC creation form page
 *
 * @example
 * ```tsx
 * <Route path="/ioc-management/create" element={<IoCManagementCreate />} />
 * ```
 */
export default function IoCManagementCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/ioc-management')} sx={{ mb: 2 }}>Back to IoC Management</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New IoC Management Item</Typography>
      </Paper>
    </Box>
  );
}
