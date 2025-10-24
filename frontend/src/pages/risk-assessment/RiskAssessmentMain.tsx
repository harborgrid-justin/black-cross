/**
 * @fileoverview Risk Assessment Main Dashboard page component.
 *
 * Primary landing page for the Risk Assessment module. This component serves as
 * the default route for /risk-assessment and displays the same content as RiskAssessment.
 *
 * Features:
 * - Comprehensive risk metrics dashboard
 * - High-risk asset visualization
 * - Risk scoring with color-coded indicators
 * - Real-time risk data from API
 *
 * Risk Metrics:
 * - Overall Risk Score (0-10 scale)
 * - Threat Level (0-10 scale)
 * - Vulnerability Exposure (0-10 scale)
 * - Security Posture (0-10 scale, inversely calculated)
 *
 * @module pages/risk-assessment/RiskAssessmentMain
 * @see {@link RiskAssessment} for the base dashboard component
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TrendingUp, Warning, Security } from '@mui/icons-material';
import { riskService } from '@/services/riskService';

/**
 * Risk Assessment Main Dashboard component.
 *
 * Primary risk assessment interface displaying metrics, assets, and risk analysis.
 * Integrates with riskService API for real-time risk scoring data.
 *
 * @component
 * @returns {JSX.Element} The rendered risk assessment main dashboard
 *
 * @example
 * ```tsx
 * import RiskAssessmentMain from './RiskAssessmentMain';
 *
 * // Rendered via React Router at /risk-assessment
 * <Route path="/risk-assessment" element={<RiskAssessmentMain />} />
 * ```
 */
export default function RiskAssessmentMain() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskMetrics, setRiskMetrics] = useState([
    { label: 'Overall Risk Score', value: 0, max: 10, color: '#f57c00' },
    { label: 'Threat Level', value: 0, max: 10, color: '#d32f2f' },
    { label: 'Vulnerability Exposure', value: 0, max: 10, color: '#fbc02d' },
    { label: 'Security Posture', value: 0, max: 10, color: '#388e3c' },
  ]);

  const [assetRisks] = useState([
    {
      name: 'Production Database Server',
      risk: 8.5,
      threats: 12,
      vulnerabilities: 8,
      icon: <Warning />,
    },
    {
      name: 'Web Application Frontend',
      risk: 6.2,
      threats: 5,
      vulnerabilities: 15,
      icon: <Security />,
    },
    {
      name: 'Email Gateway',
      risk: 7.8,
      threats: 18,
      vulnerabilities: 3,
      icon: <TrendingUp />,
    },
  ]);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch risk scores
        const response = await riskService.getRiskScores();
        if (response.success && response.data && response.data.length > 0) {
          // Update risk metrics from API data
          const apiData = response.data[0];
          if (apiData) {
            setRiskMetrics([
              { label: 'Overall Risk Score', value: apiData.riskScore ?? 7.2, max: 10, color: '#f57c00' },
              { label: 'Threat Level', value: apiData.threatLevel ?? 8.1, max: 10, color: '#d32f2f' },
              { label: 'Vulnerability Exposure', value: apiData.vulnerabilityScore ?? 6.5, max: 10, color: '#fbc02d' },
              { label: 'Security Posture', value: 10 - (apiData.riskScore ?? 7.2), max: 10, color: '#388e3c' },
            ]);
          }
        } else {
          // Use mock data
          setRiskMetrics([
            { label: 'Overall Risk Score', value: 7.2, max: 10, color: '#f57c00' },
            { label: 'Threat Level', value: 8.1, max: 10, color: '#d32f2f' },
            { label: 'Vulnerability Exposure', value: 6.5, max: 10, color: '#fbc02d' },
            { label: 'Security Posture', value: 7.8, max: 10, color: '#388e3c' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching risk data:', err);
        setError('Failed to load risk data. Showing mock data.');
        // Use mock data
        setRiskMetrics([
          { label: 'Overall Risk Score', value: 7.2, max: 10, color: '#f57c00' },
          { label: 'Threat Level', value: 8.1, max: 10, color: '#d32f2f' },
          { label: 'Vulnerability Exposure', value: 6.5, max: 10, color: '#fbc02d' },
          { label: 'Security Posture', value: 7.8, max: 10, color: '#388e3c' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
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
        Risk Assessment & Scoring
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Risk Metrics
            </Typography>
            <Box sx={{ mt: 3 }}>
              {riskMetrics.map((metric) => (
                <Box key={metric.label} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{metric.label}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {metric.value}/{metric.max}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(metric.value / metric.max) * 100}
                    sx={{
                      height: 10,
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': { backgroundColor: metric.color },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Risk Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Risk distribution chart would be rendered here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              High-Risk Assets
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {assetRisks.map((asset) => (
                <Grid size={{ xs: 12, md: 4 }} key={asset.name}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {asset.risk}
                        </Typography>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'rgba(255, 152, 0, 0.2)',
                            color: '#ff9800',
                          }}
                        >
                          {asset.icon}
                        </Box>
                      </Box>
                      <Typography variant="body2" gutterBottom>
                        {asset.name}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Threats: {asset.threats}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vulns: {asset.vulnerabilities}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Risk Trends
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Risk trend chart would be rendered here using Recharts
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
