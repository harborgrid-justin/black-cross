/**
 * @fileoverview Automation detail page. Shows detailed information for a single item.
 * 
 * @module pages/automation/AutomationDetail.tsx
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * AutomationDetail page component for viewing playbook details.
 *
 * Displays comprehensive information about a single automation playbook including
 * configuration, execution history, and status. Retrieves playbook ID from URL params.
 *
 * **Features:**
 * - Displays playbook details by ID
 * - Navigation back to automation main page
 * - URL parameter extraction via useParams hook
 * - Placeholder for detailed playbook information
 *
 * **Navigation:**
 * - Back button navigates to `/automation`
 * - Accessed via route `/automation/:id`
 * - Dynamic route with playbook ID parameter
 *
 * **Data Display (To Be Implemented):**
 * - Playbook name, description, and status
 * - Trigger conditions and action steps
 * - Execution history and success rate
 * - Edit and execute action buttons
 *
 * @component
 * @returns {JSX.Element} Rendered automation detail page
 *
 * @example
 * ```tsx
 * <Route path="/automation/:id" element={<AutomationDetail />} />
 * ```
 */
export default function AutomationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/automation')} sx={{ mb: 2 }}>Back to Automation</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Automation Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
