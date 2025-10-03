import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { actorService } from '@/services/actorService';
import type { ThreatActor } from '@/types';

export default function ThreatActors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actors, setActors] = useState<ThreatActor[]>([]);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await actorService.getActors();
        if (response.success && response.data) {
          setActors(response.data);
        }
      } catch (err) {
        console.error('Error fetching threat actors:', err);
        setError('Failed to load threat actors. Showing mock data.');
        // Mock data fallback
        setActors([
          {
            id: '1',
            name: 'APT28',
            aliases: ['Fancy Bear', 'Sofacy'],
            description: 'Advanced persistent threat group',
            sophistication: 'advanced',
            motivation: ['Espionage'],
            targetSectors: ['Government', 'Military'],
            ttps: ['Phishing', 'Spear-phishing'],
            campaigns: ['Operation XYZ'],
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Lazarus Group',
            aliases: ['Hidden Cobra'],
            description: 'State-sponsored threat actor',
            sophistication: 'advanced',
            motivation: ['Financial'],
            targetSectors: ['Financial', 'Cryptocurrency'],
            ttps: ['Malware', 'Ransomware'],
            campaigns: ['WannaCry'],
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ] as ThreatActor[]);
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Threat Actor Profiling
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Aliases</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Sophistication</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Motivation</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No threat actors found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              actors.map((actor) => (
                <TableRow key={actor.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>{actor.name}</TableCell>
                  <TableCell>{actor.aliases.join(', ')}</TableCell>
                  <TableCell>
                    <Chip label={actor.sophistication} size="small" color="error" />
                  </TableCell>
                  <TableCell>{actor.motivation.join(', ')}</TableCell>
                  <TableCell>
                    <Chip
                      label={actor.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={actor.active ? 'error' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
