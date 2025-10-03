import { Box, Typography, Grid, Card, CardContent, Switch } from '@mui/material';

export default function ThreatFeeds() {
  const feeds = [
    { name: 'AlienVault OTX', status: true, lastUpdate: '2 minutes ago' },
    { name: 'MISP Feed', status: true, lastUpdate: '5 minutes ago' },
    { name: 'Abuse.ch', status: false, lastUpdate: '1 hour ago' },
    { name: 'Spamhaus', status: true, lastUpdate: '10 minutes ago' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Threat Intelligence Feeds
      </Typography>

      <Grid container spacing={3}>
        {feeds.map((feed, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{feed.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last update: {feed.lastUpdate}
                    </Typography>
                  </Box>
                  <Switch checked={feed.status} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
