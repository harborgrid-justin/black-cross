import { Box, Paper, Typography, TextField, Button, Grid, Card, CardContent } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';

export default function ThreatHunting() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Threat Hunting Platform
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Query Builder
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Enter your hunting query here..."
              sx={{ mt: 2, mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<PlayIcon />}>
                Execute Query
              </Button>
              <Button variant="outlined">Save Query</Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Query Results
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Execute a query to see results
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Hunting Hypotheses
            </Typography>
            {[
              'Suspicious PowerShell Activity',
              'Unusual Network Traffic',
              'Lateral Movement Detection',
              'Data Exfiltration Patterns',
            ].map((hypothesis, index) => (
              <Card key={index} sx={{ mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="body2">{hypothesis}</Typography>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
