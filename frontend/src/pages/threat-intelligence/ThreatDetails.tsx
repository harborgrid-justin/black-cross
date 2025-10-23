/**
 * @fileoverview Threat Intelligence detail page. Shows detailed information for a single item.
 * 
 * @module pages/threat-intelligence/ThreatDetails.tsx
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchThreatById, clearSelectedThreat } from '@/store/slices/threatSlice';

export default function ThreatDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedThreat: threat, loading, error } = useAppSelector((state) => state.threats);

  useEffect(() => {
    if (id) {
      dispatch(fetchThreatById(id));
    }
    return () => {
      dispatch(clearSelectedThreat());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/threats')} sx={{ mb: 2 }}>
          Back to Threats
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!threat) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/threats')} sx={{ mb: 2 }}>
          Back to Threats
        </Button>
        <Alert severity="info">Threat not found</Alert>
      </Box>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/threats')}>
          Back to Threats
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<EditIcon />}>
            Edit
          </Button>
          <Button variant="outlined" startIcon={<ArchiveIcon />}>
            Archive
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {threat.name}
          </Typography>
          <Chip
            label={threat.severity}
            color={getSeverityColor(threat.severity) as 'error' | 'warning' | 'info' | 'success' | 'default'}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Chip label={`Type: ${threat.type}`} size="small" />
          <Chip label={`Status: ${threat.status}`} size="small" variant="outlined" />
          <Chip label={`Confidence: ${threat.confidence}%`} size="small" variant="outlined" />
        </Box>

        <Typography variant="body1" paragraph>
          {threat.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Metadata
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  First Seen
                </Typography>
                <Typography variant="body2">
                  {new Date(threat.firstSeen).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Seen
                </Typography>
                <Typography variant="body2">
                  {new Date(threat.lastSeen).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body2">
                  {new Date(threat.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Categories & Tags
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {threat.categories.map((category, index) => (
                  <Chip key={index} label={category} size="small" />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {threat.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Grid>

          {threat.indicators && threat.indicators.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Indicators of Compromise (IoCs)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {threat.indicators.map((indicator, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Box>
                      <Chip label={indicator.type} size="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" component="span">
                        {indicator.value}
                      </Typography>
                    </Box>
                    {indicator.confidence && (
                      <Typography variant="body2" color="text.secondary">
                        Confidence: {indicator.confidence}%
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}
