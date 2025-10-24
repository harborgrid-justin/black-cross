/**
 * @fileoverview Automation creation page. Form for creating new Automation entries.
 * 
 * @module pages/automation/AutomationCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * AutomationCreate page component for creating new automation playbooks.
 *
 * Provides a form interface for users to define new automated response playbooks.
 * Currently displays a placeholder layout; form implementation to be added.
 *
 * **Features:**
 * - Navigation back to automation main page
 * - Form container layout (form fields to be implemented)
 * - Integration with React Router for navigation
 *
 * **Navigation:**
 * - Back button navigates to `/automation`
 * - Accessed via route `/automation/create` or `/automation/new`
 *
 * **Form Fields (To Be Implemented):**
 * - Playbook name and description
 * - Trigger conditions and actions
 * - Execution parameters and schedules
 * - Validation and submission logic
 *
 * @component
 * @returns {JSX.Element} Rendered automation creation page
 *
 * @example
 * ```tsx
 * <Route path="/automation/create" element={<AutomationCreate />} />
 * ```
 */
export default function AutomationCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/automation')} sx={{ mb: 2 }}>Back to Automation</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Automation</Typography>
      </Paper>
    </Box>
  );
}
