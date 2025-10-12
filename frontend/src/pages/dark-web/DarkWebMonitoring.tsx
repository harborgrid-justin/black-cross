import { Box, Paper, Typography, Grid, Card, CardContent, Chip } from '@mui/material';

export default function DarkWebMonitoring() {
  const findings = [
    { type: 'Credential Leak', severity: 'critical', source: 'Dark Forum', date: '1 hour ago' },
    { type: 'Brand Mention', severity: 'medium', source: 'Marketplace', date: '3 hours ago' },
    { type: 'Data Breach', severity: 'high', source: 'Paste Site', date: '5 hours ago' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Dark Web Monitoring
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Findings
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {findings.map((finding, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Card>
                    <CardContent>
                      <Chip
                        label={finding.severity}
                        size="small"
                        color={finding.severity === 'critical' ? 'error' : finding.severity === 'high' ? 'warning' : 'info'}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h6" gutterBottom>
                        {finding.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Source: {finding.source}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {finding.date}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
