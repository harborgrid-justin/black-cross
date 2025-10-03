import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Switch, CircularProgress, Alert } from '@mui/material';
import { feedService } from '@/services/feedService';

interface ThreatFeed {
  id: string;
  name: string;
  status: boolean;
  lastUpdate: string;
}

export default function ThreatFeeds() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<ThreatFeed[]>([]);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.getFeeds();
      if (response.success && response.data) {
        setFeeds(response.data);
      }
    } catch (err) {
      console.error('Error fetching threat feeds:', err);
      setError('Failed to load threat feeds. Showing mock data.');
      // Mock data fallback
      setFeeds([
        { id: '1', name: 'AlienVault OTX', status: true, lastUpdate: '2 minutes ago' },
        { id: '2', name: 'MISP Feed', status: true, lastUpdate: '5 minutes ago' },
        { id: '3', name: 'Abuse.ch', status: false, lastUpdate: '1 hour ago' },
        { id: '4', name: 'Spamhaus', status: true, lastUpdate: '10 minutes ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleToggleFeed = async (feedId: string, enabled: boolean) => {
    try {
      await feedService.toggleFeed(feedId, enabled);
      // Refresh feeds after toggle
      fetchFeeds();
    } catch (err) {
      console.error('Error toggling feed:', err);
    }
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Threat Intelligence Feeds
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {feeds.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No threat feeds configured.
            </Typography>
          </Grid>
        ) : (
          feeds.map((feed) => (
            <Grid item xs={12} md={6} key={feed.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{feed.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last update: {feed.lastUpdate}
                      </Typography>
                    </Box>
                    <Switch 
                      checked={feed.status} 
                      onChange={(e) => handleToggleFeed(feed.id, e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
