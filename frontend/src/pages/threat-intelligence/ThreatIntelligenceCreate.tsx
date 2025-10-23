/**
 * @fileoverview Threat Intelligence creation page. Form for creating new Threat Intelligence entries.
 * 
 * @module pages/threat-intelligence/ThreatIntelligenceCreate.tsx
 */

/**
 * WF-COMP-002 | ThreatIntelligenceCreate.tsx - Create threat intelligence page
 * Purpose: Form page for creating new threat intelligence items
 * Last Updated: 2025-10-22 | File Type: .tsx
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
import { createThreat } from './store';

export default function ThreatIntelligenceCreate() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createThreat(formData)).unwrap();
      navigate('/threat-intelligence');
    } catch (error) {
      console.error('Failed to create threat:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/threat-intelligence')}
        sx={{ mb: 2 }}
      >
        Back to Threat Intelligence
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Create New Threat
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
                <Button variant="outlined" onClick={() => navigate('/threat-intelligence')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                  Create Threat
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
