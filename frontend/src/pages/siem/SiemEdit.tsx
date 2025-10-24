/**
 * @fileoverview SIEM Event editing page component.
 *
 * Provides interface for editing existing SIEM events, alerts, or correlation rules.
 * Allows modification of:
 * - Alert status and classification
 * - Investigation notes and findings
 * - Correlation rule parameters
 * - Notification settings
 * - Event categorization
 *
 * Currently displays a placeholder with event ID from route parameters.
 *
 * @module pages/siem/SiemEdit
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * SIEM Event editing page component.
 *
 * Form for editing existing SIEM events and alert configurations.
 * Extracts event ID from route parameters and navigates back to detail view.
 *
 * @component
 * @returns {JSX.Element} The rendered event editing form
 *
 * @example
 * ```tsx
 * import SiemEdit from './SiemEdit';
 *
 * // Rendered via React Router with dynamic ID
 * <Route path="/siem/:id/edit" element={<SiemEdit />} />
 * ```
 */
export default function SiemEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/siem/${id}`)} sx={{ mb: 2 }}>Back</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Edit SIEM Event</Typography>
      </Paper>
    </Box>
  );
}
