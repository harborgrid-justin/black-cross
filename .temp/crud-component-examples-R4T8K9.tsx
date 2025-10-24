/**
 * CRUD Component Reference Implementation Examples
 * Analysis ID: R4T8K9
 *
 * This file contains complete implementation examples for the recommended
 * CRUD component architecture for Black-Cross frontend.
 */

// ============================================================================
// 1. REUSABLE COMPONENTS
// ============================================================================

// ----------------------------------------------------------------------------
// File: /src/components/crud/forms/CRUDFormPage.tsx
// ----------------------------------------------------------------------------

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

interface CRUDFormPageProps {
  title: string;
  backUrl: string;
  backLabel?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  isLoading?: boolean;
  children: ReactNode;
}

export function CRUDFormPage({
  title,
  backUrl,
  backLabel = 'Back',
  breadcrumbs,
  isLoading = false,
  children,
}: CRUDFormPageProps) {
  const navigate = useNavigate();

  return (
    <Box>
      {breadcrumbs && (
        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) => (
            crumb.href ? (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                href={crumb.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(crumb.href!);
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={index} color="text.primary">
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}

      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(backUrl)}
        sx={{ mb: 2 }}
      >
        {backLabel}
      </Button>

      <Paper sx={{ p: 3, position: 'relative' }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          {title}
        </Typography>

        {children}

        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// ----------------------------------------------------------------------------
// File: /src/components/crud/forms/FormActions.tsx
// ----------------------------------------------------------------------------

import { Box, Button } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

interface FormActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitIcon?: ReactNode;
}

export function FormActions({
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  submitIcon = <SaveIcon />,
}: FormActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
      <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
        {cancelLabel}
      </Button>
      <LoadingButton
        type="submit"
        variant="contained"
        startIcon={submitIcon}
        loading={isSubmitting}
      >
        {submitLabel}
      </LoadingButton>
    </Box>
  );
}

// ----------------------------------------------------------------------------
// File: /src/components/crud/fields/SeveritySelect.tsx
// ----------------------------------------------------------------------------

import { forwardRef } from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

interface SeveritySelectProps {
  value: 'critical' | 'high' | 'medium' | 'low';
  onChange: (value: 'critical' | 'high' | 'medium' | 'low') => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const SeveritySelect = forwardRef<HTMLDivElement, SeveritySelectProps>(
  ({ value, onChange, label = 'Severity', required, error, helperText, disabled }, ref) => {
    return (
      <FormControl fullWidth required={required} error={error} disabled={disabled} ref={ref}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => onChange(e.target.value as SeveritySelectProps['value'])}
        >
          <MenuItem value="critical">Critical</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

SeveritySelect.displayName = 'SeveritySelect';

// ----------------------------------------------------------------------------
// File: /src/components/crud/fields/ConfidenceSlider.tsx
// ----------------------------------------------------------------------------

import { forwardRef } from 'react';
import { Box, Typography, Slider, FormHelperText } from '@mui/material';

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export const ConfidenceSlider = forwardRef<HTMLDivElement, ConfidenceSliderProps>(
  ({ value, onChange, label = 'Confidence', error, helperText, disabled, min = 0, max = 100 }, ref) => {
    return (
      <Box ref={ref}>
        <Typography variant="body2" color={error ? 'error' : 'textSecondary'} gutterBottom>
          {label}: {value}%
        </Typography>
        <Slider
          value={value}
          onChange={(_, newValue) => onChange(newValue as number)}
          min={min}
          max={max}
          disabled={disabled}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: '0%' },
            { value: 50, label: '50%' },
            { value: 100, label: '100%' },
          ]}
        />
        {helperText && (
          <FormHelperText error={error}>{helperText}</FormHelperText>
        )}
      </Box>
    );
  }
);

ConfidenceSlider.displayName = 'ConfidenceSlider';

// ----------------------------------------------------------------------------
// File: /src/components/crud/fields/DescriptionField.tsx
// ----------------------------------------------------------------------------

import { forwardRef, useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface DescriptionFieldProps extends Omit<TextFieldProps, 'multiline' | 'rows'> {
  maxLength?: number;
  showCharCount?: boolean;
  rows?: number;
}

export const DescriptionField = forwardRef<HTMLDivElement, DescriptionFieldProps>(
  ({ maxLength = 1000, showCharCount = true, rows = 4, value = '', helperText, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;
    const charCountText = showCharCount ? `${currentLength}/${maxLength}` : '';

    const combinedHelperText = [helperText, charCountText]
      .filter(Boolean)
      .join(' • ');

    return (
      <TextField
        ref={ref}
        multiline
        rows={rows}
        label="Description"
        value={value}
        helperText={combinedHelperText}
        inputProps={{ maxLength }}
        {...props}
      />
    );
  }
);

DescriptionField.displayName = 'DescriptionField';

// ----------------------------------------------------------------------------
// File: /src/components/crud/dialogs/DeleteConfirmDialog.tsx
// ----------------------------------------------------------------------------

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  error?: string | null;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  error = null,
}: DeleteConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    // Dialog will close from parent component after successful delete
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body1" paragraph>
          {message}
        </Typography>
        {itemName && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'error.light',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.main',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {itemName}
            </Typography>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <LoadingButton
          onClick={handleConfirm}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          loading={isLoading}
        >
          {confirmText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// File: /src/components/crud/feedback/ErrorAlert.tsx
// ----------------------------------------------------------------------------

import { Alert, AlertTitle, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ErrorAlertProps {
  error: string | Error | null;
  onClose?: () => void;
  title?: string;
  showClose?: boolean;
}

export function ErrorAlert({
  error,
  onClose,
  title = 'Error',
  showClose = true,
}: ErrorAlertProps) {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        action={
          showClose && onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : undefined
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>{title}</AlertTitle>
        {errorMessage}
      </Alert>
    </Collapse>
  );
}

// ----------------------------------------------------------------------------
// File: /src/components/crud/hooks/useCRUDForm.ts
// ----------------------------------------------------------------------------

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { useSnackbar } from 'notistack';

interface UseCRUDFormOptions<T> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  successMessage?: string;
  successRedirect?: string;
  errorMessage?: string;
}

interface UseCRUDFormReturn<T> extends UseFormReturn<T> {
  handleFormSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  clearError: () => void;
}

export function useCRUDForm<T>({
  schema,
  onSubmit,
  successMessage = 'Operation completed successfully',
  successRedirect,
  errorMessage,
  ...formOptions
}: UseCRUDFormOptions<T>): UseCRUDFormReturn<T> {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<T>({
    ...formOptions,
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = form.handleSubmit(async (data) => {
    try {
      setSubmitError(null);
      await onSubmit(data);

      // Success notification
      enqueueSnackbar(successMessage, { variant: 'success' });

      // Navigate if redirect specified
      if (successRedirect) {
        navigate(successRedirect);
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : errorMessage || 'An error occurred';

      setSubmitError(message);
      enqueueSnackbar(message, { variant: 'error' });
    }
  });

  return {
    ...form,
    handleFormSubmit,
    isSubmitting: form.formState.isSubmitting,
    submitError,
    clearError: () => setSubmitError(null),
  };
}

// ============================================================================
// 2. ZOD SCHEMAS
// ============================================================================

// ----------------------------------------------------------------------------
// File: /src/pages/threat-intelligence/schemas/threatSchema.ts
// ----------------------------------------------------------------------------

import { z } from 'zod';

export const threatSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  type: z.string()
    .min(1, 'Type is required')
    .max(50, 'Type must be less than 50 characters')
    .trim(),

  severity: z.enum(['critical', 'high', 'medium', 'low'], {
    required_error: 'Severity is required',
    invalid_type_error: 'Invalid severity level',
  }),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  confidence: z.number()
    .min(0, 'Confidence must be between 0 and 100')
    .max(100, 'Confidence must be between 0 and 100')
    .default(50),

  tags: z.array(z.string()).optional().default([]),

  indicators: z.array(z.object({
    type: z.enum(['ip', 'domain', 'hash', 'url']),
    value: z.string().min(1, 'Indicator value is required'),
    confidence: z.number().min(0).max(100).optional(),
  })).optional().default([]),
});

export type ThreatFormData = z.infer<typeof threatSchema>;

// Schema for edit (allows partial updates)
export const threatEditSchema = threatSchema.partial();

// ----------------------------------------------------------------------------
// File: /src/pages/incident-response/schemas/incidentSchema.ts
// ----------------------------------------------------------------------------

import { z } from 'zod';

export const incidentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),

  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),

  severity: z.enum(['critical', 'high', 'medium', 'low'], {
    required_error: 'Severity is required',
  }),

  status: z.enum(['open', 'investigating', 'contained', 'resolved', 'closed'], {
    required_error: 'Status is required',
  }),

  assignedTo: z.string()
    .email('Must be a valid email')
    .optional()
    .or(z.literal('')),

  affectedAssets: z.array(z.string()).optional().default([]),

  dueDate: z.string().datetime().optional(),
});

export type IncidentFormData = z.infer<typeof incidentSchema>;

export const incidentEditSchema = incidentSchema.partial();

// ============================================================================
// 3. COMPLETE CRUD IMPLEMENTATION EXAMPLES
// ============================================================================

// ----------------------------------------------------------------------------
// File: /src/pages/threat-intelligence/ThreatIntelligenceCreate.tsx
// ----------------------------------------------------------------------------

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, TextField } from '@mui/material';
import { CRUDFormPage } from '@/components/crud/forms/CRUDFormPage';
import { FormActions } from '@/components/crud/forms/FormActions';
import { SeveritySelect } from '@/components/crud/fields/SeveritySelect';
import { DescriptionField } from '@/components/crud/fields/DescriptionField';
import { ConfidenceSlider } from '@/components/crud/fields/ConfidenceSlider';
import { ErrorAlert } from '@/components/crud/feedback/ErrorAlert';
import { useAppDispatch } from '@/store/hooks';
import { createThreat } from './store';
import { threatSchema, type ThreatFormData } from './schemas/threatSchema';

export default function ThreatIntelligenceCreate() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ThreatFormData>({
    resolver: zodResolver(threatSchema),
    defaultValues: {
      name: '',
      type: '',
      severity: 'medium',
      description: '',
      confidence: 50,
      tags: [],
      indicators: [],
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: ThreatFormData) => {
    try {
      setSubmitError(null);
      await dispatch(createThreat(data)).unwrap();
      navigate('/threat-intelligence');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create threat');
    }
  };

  return (
    <CRUDFormPage
      title="Create New Threat"
      backUrl="/threat-intelligence"
      backLabel="Back to Threat Intelligence"
    >
      {submitError && (
        <ErrorAlert
          error={submitError}
          onClose={() => setSubmitError(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                  autoFocus
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Type"
                  error={!!errors.type}
                  helperText={errors.type?.message}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <SeveritySelect
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.severity}
                  helperText={errors.severity?.message}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <DescriptionField
                  {...field}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="confidence"
              control={control}
              render={({ field }) => (
                <ConfidenceSlider
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.confidence}
                  helperText={errors.confidence?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <FormActions
              onCancel={() => navigate('/threat-intelligence')}
              submitLabel="Create Threat"
              isSubmitting={isSubmitting}
            />
          </Grid>
        </Grid>
      </form>
    </CRUDFormPage>
  );
}

// ----------------------------------------------------------------------------
// File: /src/pages/threat-intelligence/ThreatIntelligenceEdit.tsx
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, TextField, CircularProgress, Box } from '@mui/material';
import { CRUDFormPage } from '@/components/crud/forms/CRUDFormPage';
import { FormActions } from '@/components/crud/forms/FormActions';
import { SeveritySelect } from '@/components/crud/fields/SeveritySelect';
import { DescriptionField } from '@/components/crud/fields/DescriptionField';
import { ConfidenceSlider } from '@/components/crud/fields/ConfidenceSlider';
import { ErrorAlert } from '@/components/crud/feedback/ErrorAlert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchThreatById, updateThreat } from './store';
import { threatEditSchema, type ThreatFormData } from './schemas/threatSchema';

export default function ThreatIntelligenceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedThreat, loading } = useAppSelector((state) => state.threats);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ThreatFormData>({
    resolver: zodResolver(threatEditSchema),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchThreatById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedThreat) {
      reset({
        name: selectedThreat.name,
        type: selectedThreat.type,
        severity: selectedThreat.severity,
        description: selectedThreat.description,
        confidence: selectedThreat.confidence,
      });
    }
  }, [selectedThreat, reset]);

  const onSubmit = async (data: ThreatFormData) => {
    if (!id) return;

    try {
      setSubmitError(null);
      await dispatch(updateThreat({ id, data })).unwrap();
      navigate(`/threat-intelligence/${id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to update threat');
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
    <CRUDFormPage
      title="Edit Threat"
      backUrl={`/threat-intelligence/${id}`}
      backLabel="Back to Threat Details"
    >
      {submitError && (
        <ErrorAlert
          error={submitError}
          onClose={() => setSubmitError(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Type"
                  error={!!errors.type}
                  helperText={errors.type?.message}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <SeveritySelect
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.severity}
                  helperText={errors.severity?.message}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <DescriptionField
                  {...field}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="confidence"
              control={control}
              render={({ field }) => (
                <ConfidenceSlider
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.confidence}
                  helperText={errors.confidence?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <FormActions
              onCancel={() => navigate(`/threat-intelligence/${id}`)}
              submitLabel="Save Changes"
              isSubmitting={isSubmitting}
            />
          </Grid>
        </Grid>
      </form>
    </CRUDFormPage>
  );
}

// ----------------------------------------------------------------------------
// File: /src/pages/threat-intelligence/ThreatIntelligenceDetail.tsx
// (Adding Delete Functionality)
// ----------------------------------------------------------------------------

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DeleteConfirmDialog } from '@/components/crud/dialogs/DeleteConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteThreat } from './store';

export default function ThreatIntelligenceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedThreat: threat } = useAppSelector((state) => state.threats);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await dispatch(deleteThreat(id)).unwrap();
      navigate('/threat-intelligence');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete threat');
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      {/* ... existing detail view code ... */}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/threat-intelligence/${id}/edit`)}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete
        </Button>
      </Box>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title="Delete Threat"
        message="Are you sure you want to delete this threat? This action cannot be undone."
        itemName={threat?.name}
        isLoading={isDeleting}
        error={deleteError}
      />
    </Box>
  );
}

// ============================================================================
// 4. REDUX SLICE UPDATES
// ============================================================================

// ----------------------------------------------------------------------------
// File: /src/pages/threat-intelligence/store/threatSlice.ts
// (Add missing update and delete thunks)
// ----------------------------------------------------------------------------

export const updateThreat = createAsyncThunk(
  'threats/updateThreat',
  async ({ id, data }: { id: string; data: Partial<Threat> }) => {
    const response = await threatService.updateThreat(id, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update threat');
  }
);

export const deleteThreat = createAsyncThunk(
  'threats/deleteThreat',
  async (id: string) => {
    const response = await threatService.deleteThreat(id);
    if (response.success) {
      return id;
    }
    throw new Error(response.error || 'Failed to delete threat');
  }
);

// Add to extraReducers:
.addCase(updateThreat.fulfilled, (state, action) => {
  const index = state.threats.findIndex((t) => t.id === action.payload.id);
  if (index !== -1) {
    state.threats[index] = action.payload;
  }
  if (state.selectedThreat?.id === action.payload.id) {
    state.selectedThreat = action.payload;
  }
})
.addCase(deleteThreat.fulfilled, (state, action) => {
  state.threats = state.threats.filter((t) => t.id !== action.payload);
  if (state.selectedThreat?.id === action.payload) {
    state.selectedThreat = null;
  }
});
