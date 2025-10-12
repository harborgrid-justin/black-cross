import { Box, Typography, Grid, Card, CardContent, LinearProgress } from '@mui/material';

export default function ComplianceManagement() {
  const frameworks = [
    { name: 'SOC 2', compliance: 92, controls: 156 },
    { name: 'ISO 27001', compliance: 88, controls: 114 },
    { name: 'NIST CSF', compliance: 85, controls: 98 },
    { name: 'GDPR', compliance: 95, controls: 45 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Compliance & Audit Management
      </Typography>

      <Grid container spacing={3}>
        {frameworks.map((framework, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{framework.name}</Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                    {framework.compliance}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={framework.compliance}
                  sx={{ height: 8, borderRadius: 1, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {framework.controls} controls
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
