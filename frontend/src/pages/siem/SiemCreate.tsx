/**
 * @fileoverview SIEM Event creation/configuration page component.
 *
 * Provides interface for creating new SIEM event configurations or correlation rules.
 * Intended features include:
 * - Event source configuration
 * - Correlation rule creation
 * - Alert threshold settings
 * - Notification preferences
 *
 * Currently displays a placeholder with navigation back to the main SIEM page.
 *
 * @module pages/siem/SiemCreate
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * SIEM Event creation page component.
 *
 * Form for creating new SIEM event configurations and correlation rules.
 * Includes navigation back to the main SIEM dashboard.
 *
 * @component
 * @returns {JSX.Element} The rendered SIEM event creation form
 *
 * @example
 * ```tsx
 * import SiemCreate from './SiemCreate';
 *
 * // Rendered via React Router
 * <Route path="/siem/create" element={<SiemCreate />} />
 * ```
 */
export default function SiemCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/siem')} sx={{ mb: 2 }}>Back to SIEM</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create SIEM Event</Typography>
      </Paper>
    </Box>
  );
}
