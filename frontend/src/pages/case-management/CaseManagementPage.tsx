/**
 * @fileoverview Case Management page component for security case tracking.
 *
 * Provides comprehensive case management functionality including case listing,
 * status tracking, priority management, and lifecycle operations. Displays
 * security cases in a table format with color-coded status and priority indicators.
 *
 * **Features:**
 * - Case listing with status, priority, and category
 * - Color-coded chips for visual status identification
 * - Refresh and create new case actions
 * - Integration with case management service
 * - Loading and error state handling
 *
 * **Case Statuses:**
 * - DRAFT: Initial case creation state
 * - OPEN: Active case requiring attention
 * - IN_PROGRESS: Case being worked on
 * - PENDING_REVIEW: Awaiting review
 * - RESOLVED: Case resolution complete
 * - CLOSED: Case finalized and archived
 * - ARCHIVED: Long-term storage state
 *
 * **Case Priorities:**
 * - CRITICAL: Immediate action required
 * - HIGH: Urgent attention needed
 * - MEDIUM: Standard priority
 * - LOW: Lower priority cases
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
 * CaseManagementPage component displaying security case management dashboard.
 *
 * Main page component for managing security cases including viewing, filtering,
 * and performing case operations. Uses local state for data management and
 * integrates with case management service for backend operations.
 *
 * **State Management:**
 * - Local state for cases array, loading, and error
 * - No Redux integration (standalone service-based approach)
 * - Fetches cases on component mount
 *
 * **Helper Functions:**
 * - getStatusColor: Maps case status to Material-UI color
 * - getPriorityColor: Maps priority level to Material-UI color
 * - loadCases: Async function to fetch cases from backend
 *
 * @component
 * @returns {JSX.Element} Rendered case management page with cases table
 *
 * @example
 * ```tsx
 * <Route path="/case-management" element={<CaseManagementPage />} />
 * ```
 */
export default function CaseManagementPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads cases from the backend service.
   *
   * Fetches all security cases and updates component state. Handles loading
   * and error states appropriately.
   *
   * @async
   * @function loadCases
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * <Button onClick={loadCases}>Refresh</Button>
   * ```
   */
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

  /**
   * Maps case status to Material-UI Chip color.
   *
   * Provides visual distinction between different case statuses using
   * color-coded chips for quick identification.
   *
   * @param {CaseStatus} status - The case status enum value
   * @returns {string} Material-UI color name ('default', 'info', 'warning', etc.)
   *
   * @example
   * ```tsx
   * <Chip color={getStatusColor(CaseStatus.OPEN)} label="OPEN" />
   * ```
   */
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

  /**
   * Maps case priority to Material-UI Chip color.
   *
   * Provides visual indication of case urgency using color-coded chips.
   * Higher priority cases use more prominent colors (red for critical).
   *
   * @param {CasePriority} priority - The case priority enum value
   * @returns {string} Material-UI color name ('error', 'warning', 'info', 'success')
   *
   * @example
   * ```tsx
   * <Chip color={getPriorityColor(CasePriority.CRITICAL)} label="CRITICAL" />
   * ```
   */
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
