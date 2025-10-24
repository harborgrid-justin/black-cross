/**
 * @fileoverview Incident Response edit page component for modifying existing incidents.
 *
 * This component provides a pre-populated form interface for editing existing security
 * incidents. Fetches the current incident data, allows modifications to severity, status,
 * description, and assignment, and handles form submission with Redux integration.
 *
 * @module pages/incident-response/IncidentResponseEdit
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchIncidentById } from './store';

/**
 * Incident Response edit page component.
 *
 * Provides a form interface for editing existing security incidents with pre-populated
 * fields. Fetches incident data on mount, allows modifications to key fields, and
 * handles update submission through Redux integration.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered incident edit form
 *
 * @remarks
 * Form fields (editable):
 * - Title: Required text field for incident summary
 * - Severity: Dropdown (critical, high, medium, low)
 * - Status: Dropdown (open, investigating, contained, resolved, closed)
 * - Description: Multi-line text area for detailed information
 * - Assigned To: Text field for assignee name or email
 *
 * Component lifecycle:
 * 1. Fetch incident data on mount using ID from URL params
 * 2. Populate form fields when incident data loads
 * 3. Allow user to modify fields
 * 4. Submit updates via Redux (TODO: implement updateIncident action)
 * 5. Navigate back to detail view on success
 *
 * Current limitations:
 * - Update action not yet implemented (TODO in handleSubmit)
 * - No unsaved changes warning
 * - No validation beyond required field
 *
 * @security
 * - Validate user permissions before allowing edits
 * - Sanitize all input before submission
 * - Maintain audit trail of all changes
 * - Consider approval workflow for critical incidents
 *
 * @example
 * ```tsx
 * // Used in routing configuration
 * <Route path="/incident-response/:id/edit" element={<IncidentResponseEdit />} />
 * ```
 *
 * @see {@link fetchIncidentById} for data loading
 * @see {@link updateIncident} for the update action (to be implemented)
 * @see {@link IncidentResponseDetail} for the detail view
 */
export default function IncidentResponseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedIncident: incident, loading } = useAppSelector((state) => state.incidents);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
    assignedTo: string;
  }>({
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    assignedTo: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchIncidentById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (incident) {
      setFormData({
        title: incident.title || '',
        description: incident.description || '',
        severity: incident.severity || 'medium',
        status: incident.status || 'open',
        assignedTo: incident.assignedTo || '',
      });
    }
  }, [incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update incident action
    navigate(`/incident-response/${id}`);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(`/incident-response/${id}`)}
        sx={{ mb: 2 }}
      >
        Back to Incident Details
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Edit Incident
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  label="Severity"
                  onChange={(e) => handleChange('severity', e.target.value)}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="investigating">Investigating</MenuItem>
                  <MenuItem value="contained">Contained</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate(`/incident-response/${id}`)}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
