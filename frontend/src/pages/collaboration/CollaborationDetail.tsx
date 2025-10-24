/**
 * @fileoverview Collaboration detail page displaying workspace/channel details.
 *
 * @module pages/collaboration/CollaborationDetail.tsx
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * CollaborationDetail page for viewing collaboration workspace/channel details.
 *
 * Displays comprehensive information about a collaboration resource including
 * members, messages, and configuration. Retrieves ID from URL params.
 *
 * **Features:**
 * - Workspace/channel details by ID
 * - Navigation back to collaboration main
 * - URL parameter extraction
 *
 * **Data Display (To Be Implemented):**
 * - Members list with roles
 * - Recent messages and activity
 * - Channel/workspace settings
 * - Edit and manage actions
 *
 * @component
 * @returns {JSX.Element} Collaboration detail page
 *
 * @example
 * ```tsx
 * <Route path="/collaboration/:id" element={<CollaborationDetail />} />
 * ```
 */
export default function CollaborationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/collaboration')} sx={{ mb: 2 }}>Back to Collaboration</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Collaboration Details: {id}</Typography>
      </Paper>
    </Box>
  );
}
