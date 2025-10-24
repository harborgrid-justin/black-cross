/**
 * @fileoverview Report editing page component.
 *
 * Provides a form interface for editing existing security reports.
 * Allows modification of report configuration such as:
 * - Report title and description
 * - Report type and format
 * - Scheduling settings
 * - Time range and filters
 *
 * Currently displays a placeholder with report ID from route parameters.
 *
 * @module pages/reporting/ReportingEdit
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * Report editing page component.
 *
 * Form for editing existing report configurations.
 * Extracts report ID from route parameters and navigates back to detail view.
 *
 * @component
 * @returns {JSX.Element} The rendered report editing form
 *
 * @example
 * ```tsx
 * import ReportingEdit from './ReportingEdit';
 *
 * // Rendered via React Router with dynamic ID
 * <Route path="/reporting/:id/edit" element={<ReportingEdit />} />
 * ```
 */
export default function ReportingEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/reporting/${id}`)} sx={{ mb: 2 }}>Back</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Edit Reporting</Typography>
      </Paper>
    </Box>
  );
}
