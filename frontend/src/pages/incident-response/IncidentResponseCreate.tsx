/**
 * @fileoverview Incident Response creation page component for reporting new security incidents.
 *
 * This component provides a comprehensive form interface for creating new security
 * incidents with fields for severity, status, assignment, and detailed description.
 * Integrates with Redux for state management and navigates to the incident list
 * upon successful creation.
 *
 * @module pages/incident-response/IncidentResponseCreate
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAppDispatch } from '@/store/hooks';
import { createIncident } from './store';

/**
 * Incident Response creation page component.
 *
 * Provides a form interface for creating new security incidents. The form includes
 * fields for title, severity, status, description, and assignment with proper
 * validation and error handling through Redux integration.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered incident creation form
 *
 * @remarks
 * Form fields:
 * - Title: Required text field for incident summary
 * - Severity: Dropdown with options (critical, high, medium, low)
 * - Status: Dropdown with options (open, investigating, contained, resolved, closed)
 * - Description: Multi-line text area for detailed incident information
 * - Assigned To: Text field for assignee name or email
 *
 * Form behavior:
 * - Local state management for form data
 * - Validation on submit (title is required)
 * - Redux thunk dispatch for API call
 * - Navigation to incident list on success
 * - Error logging to console on failure
 *
 * Navigation:
 * - Back button returns to incident list
 * - Cancel button also returns to incident list
 * - Successful submission navigates to incident list
 *
 * @security
 * - Validate user has permissions to create incidents
 * - Sanitize all input before submission
 * - Consider implementing draft autosave for data protection
 *
 * @example
 * ```tsx
 * // Used in routing configuration
 * <Route path="/incident-response/create" element={<IncidentResponseCreate />} />
 * ```
 *
 * @see {@link createIncident} for the Redux action
 * @see {@link IncidentResponseEdit} for editing existing incidents
 */
export default function IncidentResponseCreate() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

  /**
   * Handles form submission for creating a new incident.
   *
   * Prevents default form submission, dispatches the Redux create action with
   * form data, and navigates to the incident list on success. Logs errors to
   * console on failure.
   *
   * @async
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>}
   *
   * @throws {Error} Logs error to console if creation fails
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createIncident(formData)).unwrap();
      navigate('/incident-response');
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  /**
   * Handles form field changes.
   *
   * Updates the form data state with the new value for the specified field.
   * Uses functional state update to preserve other field values.
   *
   * @param {string} field - The form field name to update
   * @param {any} value - The new value for the field
   * @returns {void}
   */
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/incident-response')}
        sx={{ mb: 2 }}
      >
        Back to Incidents
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Create New Incident
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
                <Button variant="outlined" onClick={() => navigate('/incident-response')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                  Create Incident
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
