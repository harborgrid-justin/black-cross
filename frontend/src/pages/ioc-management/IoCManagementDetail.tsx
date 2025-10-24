/**
 * @fileoverview IoC Management detail page component.
 *
 * Displays detailed information for a single Indicator of Compromise (IoC).
 * Shows comprehensive data including metadata, related incidents, and history.
 *
 * ## Planned Features
 * - IoC type, value, and confidence display
 * - Status and tags visualization
 * - Created/updated timestamps
 * - Associated incidents and threats
 * - Timeline of IoC activity
 * - Edit and delete actions
 * - Export IoC data functionality
 *
 * ## Route Parameters
 * - id: Unique identifier of the IoC to display
 *
 * @module pages/ioc-management/IoCManagementDetail
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * IoC detail view component.
 *
 * Renders detailed information for a specific Indicator of Compromise.
 * Extracts the IoC ID from route parameters and displays comprehensive data.
 *
 * @component
 * @returns {JSX.Element} The IoC detail page
 *
 * @example
 * ```tsx
 * <Route path="/ioc-management/:id" element={<IoCManagementDetail />} />
 * ```
 */
export default function IoCManagementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/ioc-management')} sx={{ mb: 2 }}>Back to IoC Management</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>IoC Management Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
