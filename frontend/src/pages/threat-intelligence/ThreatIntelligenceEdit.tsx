/**
 * WF-COMP-003 | ThreatIntelligenceEdit.tsx - Edit threat intelligence page
 * Purpose: Form page for editing existing threat intelligence items
 * Last Updated: 2025-10-22 | File Type: .tsx
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
import { fetchThreatById } from './store';

export default function ThreatIntelligenceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedThreat: threat, loading } = useAppSelector((state) => state.threats);
  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    confidence: number;
  }>({
    name: '',
    type: '',
    severity: 'medium',
    description: '',
    confidence: 50,
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchThreatById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (threat) {
      setFormData({
        name: threat.name || '',
        type: threat.type || '',
        severity: threat.severity || 'medium',
        description: threat.description || '',
        confidence: threat.confidence || 50,
      });
    }
  }, [threat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update threat action
    navigate(`/threat-intelligence/${id}`);
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
        onClick={() => navigate(`/threat-intelligence/${id}`)}
        sx={{ mb: 2 }}
      >
        Back to Threat Details
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Edit Threat
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
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
                type="number"
                label="Confidence (%)"
                value={formData.confidence}
                onChange={(e) => handleChange('confidence', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate(`/threat-intelligence/${id}`)}>
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
