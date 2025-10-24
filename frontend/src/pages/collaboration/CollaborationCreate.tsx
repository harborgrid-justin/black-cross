/**
 * @fileoverview Collaboration creation page for new collaboration items/workspaces.
 *
 * @module pages/collaboration/CollaborationCreate.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * CollaborationCreate page for creating new collaboration workspaces or channels.
 *
 * Provides form interface for creating collaboration resources. Currently displays
 * placeholder layout; full form implementation to be added.
 *
 * **Features:**
 * - Navigation back to collaboration main
 * - Form container (fields to be implemented)
 *
 * **Form Fields (To Be Implemented):**
 * - Workspace/channel name and description
 * - Member selection and permissions
 * - Privacy settings (public/private)
 *
 * @component
 * @returns {JSX.Element} Collaboration creation page
 *
 * @example
 * ```tsx
 * <Route path="/collaboration/create" element={<CollaborationCreate />} />
 * ```
 */
export default function CollaborationCreate() {
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/collaboration')} sx={{ mb: 2 }}>Back to Collaboration</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Create New Collaboration Item</Typography>
      </Paper>
    </Box>
  );
}
