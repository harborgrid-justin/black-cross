/**
 * @fileoverview Report detail page component.
 *
 * Displays detailed information for a single security report, including:
 * - Report metadata (title, type, generated date, format)
 * - Report content and visualizations
 * - Download and export options
 * - Edit and delete actions
 *
 * Currently displays a placeholder with report ID from route parameters.
 *
 * @module pages/reporting/ReportingDetail
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * Report detail page component.
 *
 * Displays detailed view of a single report with full metadata and content.
 * Extracts report ID from route parameters and provides navigation back to main page.
 *
 * @component
 * @returns {JSX.Element} The rendered report detail view
 *
 * @example
 * ```tsx
 * import ReportingDetail from './ReportingDetail';
 *
 * // Rendered via React Router with dynamic ID
 * <Route path="/reporting/:id" element={<ReportingDetail />} />
 * ```
 */
export default function ReportingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/reporting')} sx={{ mb: 2 }}>Back to Reporting</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Reporting Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
