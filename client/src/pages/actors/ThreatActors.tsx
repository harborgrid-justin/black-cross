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
} from '@mui/material';

export default function ThreatActors() {
  const mockActors = [
    {
      id: '1',
      name: 'APT28',
      aliases: ['Fancy Bear', 'Sofacy'],
      sophistication: 'advanced',
      motivation: 'Espionage',
      active: true,
    },
    {
      id: '2',
      name: 'Lazarus Group',
      aliases: ['Hidden Cobra'],
      sophistication: 'advanced',
      motivation: 'Financial',
      active: true,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Threat Actor Profiling
      </Typography>

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
            {mockActors.map((actor) => (
              <TableRow key={actor.id} hover sx={{ cursor: 'pointer' }}>
                <TableCell>{actor.name}</TableCell>
                <TableCell>{actor.aliases.join(', ')}</TableCell>
                <TableCell>
                  <Chip label={actor.sophistication} size="small" color="error" />
                </TableCell>
                <TableCell>{actor.motivation}</TableCell>
                <TableCell>
                  <Chip
                    label={actor.active ? 'Active' : 'Inactive'}
                    size="small"
                    color={actor.active ? 'error' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
