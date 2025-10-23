/**
 * @fileoverview Case Management page component.
 * 
 * Displays security cases with filtering, status tracking,
 * and case lifecycle management.
 * 
 * @module pages/case-management/CaseManagementPage
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { caseManagementService, type Case, CaseStatus, CasePriority } from '@/services/caseManagementService';

/**
 * Case Management page component.
 * 
 * @component
 */
export default function CaseManagementPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await caseManagementService.getCases();
      setCases(response.data || []);
    } catch (err) {
      setError('Failed to load cases');
      console.error('Error loading cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.DRAFT:
        return 'default';
      case CaseStatus.OPEN:
        return 'info';
      case CaseStatus.IN_PROGRESS:
        return 'warning';
      case CaseStatus.PENDING_REVIEW:
        return 'secondary';
      case CaseStatus.RESOLVED:
        return 'success';
      case CaseStatus.CLOSED:
        return 'default';
      case CaseStatus.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: CasePriority) => {
    switch (priority) {
      case CasePriority.CRITICAL:
        return 'error';
      case CasePriority.HIGH:
        return 'warning';
      case CasePriority.MEDIUM:
        return 'info';
      case CasePriority.LOW:
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Case Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCases}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Case
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              {cases.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  No cases found
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cases.map((caseItem) => (
                        <TableRow key={caseItem.id} hover>
                          <TableCell>{caseItem.id.substring(0, 8)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {caseItem.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={caseItem.status.replace('_', ' ')}
                              size="small"
                              color={getStatusColor(caseItem.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={caseItem.priority}
                              size="small"
                              color={getPriorityColor(caseItem.priority)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {caseItem.category.replace('_', ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(caseItem.created_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
