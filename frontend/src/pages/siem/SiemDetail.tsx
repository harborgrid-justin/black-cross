/**
 * @fileoverview SIEM Event detail page component.
 *
 * Displays detailed information for a single security event or alert, including:
 * - Full event metadata and context
 * - Correlated events timeline
 * - Source system information
 * - Severity analysis and impact assessment
 * - Investigation notes and status
 * - Related alerts and patterns
 *
 * Currently displays a placeholder with event ID from route parameters.
 *
 * @module pages/siem/SiemDetail
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * SIEM Event detail page component.
 *
 * Displays comprehensive view of a single security event with full context and analysis.
 * Extracts event ID from route parameters and provides navigation back to main dashboard.
 *
 * @component
 * @returns {JSX.Element} The rendered event detail view
 *
 * @example
 * ```tsx
 * import SiemDetail from './SiemDetail';
 *
 * // Rendered via React Router with dynamic ID
 * <Route path="/siem/:id" element={<SiemDetail />} />
 * ```
 */
export default function SiemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/siem')} sx={{ mb: 2 }}>Back to SIEM</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>SIEM Event Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
