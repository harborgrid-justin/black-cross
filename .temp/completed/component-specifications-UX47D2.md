# Reusable CRUD Component Specifications - Black-Cross Platform

**Analysis ID**: UX47D2
**Date**: 2025-10-24
**Purpose**: Define reusable components to standardize CRUD operations across all modules

---

## Component Architecture Overview

```
frontend/src/components/crud/
├── PageHeader.tsx           # Reusable page header with title, back button, actions
├── FormActions.tsx          # Standardized form button layout
├── ConfirmationDialog.tsx   # Reusable confirmation dialog for destructive actions
├── LoadingState.tsx         # Centered loading spinner with message
├── ErrorState.tsx           # Error display with retry functionality
├── NotFoundState.tsx        # 404-style not found message
├── EmptyState.tsx           # Empty list state with CTA
├── FieldDisplay.tsx         # Read-only field display for detail views
├── SkeletonTable.tsx        # Skeleton loader for tables
├── useNotification.tsx      # Toast notification hook
├── useConfirmation.tsx      # Confirmation dialog hook
└── CRUDFormLayout.tsx       # Optional form container wrapper
```

---

## 1. PageHeader Component

### Purpose
Standardized page header with title, optional back button, and action buttons. Used on all CRUD pages.

### Props Interface

```tsx
export interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  loading?: boolean;
  'aria-label'?: string;
}

export interface PageHeaderBackButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  /**
   * Page title displayed prominently
   */
  title: string;

  /**
   * Optional subtitle or description
   */
  subtitle?: string;

  /**
   * Optional back button configuration
   */
  backButton?: PageHeaderBackButton;

  /**
   * Action buttons displayed on the right
   * Primary action should be last in array (rightmost position)
   */
  actions?: PageHeaderAction[];

  /**
   * Custom content to render after title (breadcrumbs, tabs, etc.)
   */
  children?: React.ReactNode;
}
```

### Implementation

```tsx
/**
 * PageHeader Component
 *
 * Standardized page header for all CRUD pages providing consistent
 * layout for title, navigation, and actions.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Create New Threat"
 *   backButton={{
 *     label: 'Back to Threats',
 *     onClick: () => navigate('/threats')
 *   }}
 *   actions={[
 *     {
 *       label: 'Save Draft',
 *       variant: 'outlined',
 *       onClick: handleSaveDraft
 *     },
 *     {
 *       label: 'Create',
 *       variant: 'contained',
 *       onClick: handleCreate,
 *       loading: isSubmitting
 *     }
 *   ]}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  backButton,
  actions = [],
  children,
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Back Button */}
      {backButton && (
        <Button
          startIcon={backButton.icon || <ArrowBackIcon />}
          onClick={backButton.onClick}
          sx={{ mb: 2 }}
          aria-label={backButton.label}
        >
          {backButton.label}
        </Button>
      )}

      {/* Title and Actions Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                startIcon={
                  action.loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    action.icon
                  )
                }
                aria-label={action['aria-label'] || action.label}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* Custom Children (breadcrumbs, tabs, etc.) */}
      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  );
}
```

### Usage Examples

```tsx
// List page header
<PageHeader
  title="Threat Intelligence"
  actions={[
    {
      label: 'Refresh',
      icon: <RefreshIcon />,
      variant: 'outlined',
      onClick: handleRefresh
    },
    {
      label: 'Add Threat',
      icon: <AddIcon />,
      variant: 'contained',
      onClick: () => navigate('/threats/new')
    }
  ]}
/>

// Detail page header
<PageHeader
  title={threat.name}
  subtitle={`Created ${new Date(threat.createdAt).toLocaleDateString()}`}
  backButton={{
    label: 'Back to Threats',
    onClick: () => navigate('/threats')
  }}
  actions={[
    {
      label: 'Edit',
      icon: <EditIcon />,
      variant: 'contained',
      onClick: () => navigate(`/threats/${id}/edit`)
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      variant: 'outlined',
      color: 'error',
      onClick: handleDeleteClick
    }
  ]}
/>

// Create/Edit page header
<PageHeader
  title="Create New Threat"
  backButton={{
    label: 'Back to Threats',
    onClick: handleCancel
  }}
/>
```

---

## 2. FormActions Component

### Purpose
Standardized form action buttons (Cancel + Submit) with consistent layout and behavior.

### Props Interface

```tsx
export interface FormActionsProps {
  /**
   * Label for submit button (e.g., "Create", "Save Changes")
   */
  submitLabel: string;

  /**
   * Label for cancel button
   * @default "Cancel"
   */
  cancelLabel?: string;

  /**
   * Cancel button click handler
   */
  onCancel: () => void;

  /**
   * Whether form is currently submitting (disables buttons, shows loading)
   */
  isSubmitting?: boolean;

  /**
   * Whether form has unsaved changes (for styling/confirmation)
   */
  isDirty?: boolean;

  /**
   * Whether submit button should be disabled
   */
  submitDisabled?: boolean;

  /**
   * Icon for submit button
   * @default <SaveIcon />
   */
  submitIcon?: React.ReactNode;

  /**
   * Additional custom actions (e.g., "Save as Draft")
   */
  additionalActions?: PageHeaderAction[];
}
```

### Implementation

```tsx
/**
 * FormActions Component
 *
 * Standardized form action buttons with consistent layout.
 * Always right-aligned, Cancel on left, Submit on right.
 *
 * @example
 * ```tsx
 * <FormActions
 *   onCancel={handleCancel}
 *   submitLabel="Create Threat"
 *   isSubmitting={isSubmitting}
 *   isDirty={isDirty}
 * />
 * ```
 */
export function FormActions({
  submitLabel,
  cancelLabel = 'Cancel',
  onCancel,
  isSubmitting = false,
  isDirty = false,
  submitDisabled = false,
  submitIcon = <SaveIcon />,
  additionalActions = [],
}: FormActionsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      {/* Additional Actions */}
      {additionalActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outlined'}
          color={action.color}
          onClick={action.onClick}
          disabled={action.disabled || isSubmitting}
          startIcon={action.icon}
        >
          {action.label}
        </Button>
      ))}

      {/* Cancel Button */}
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={isSubmitting}
        aria-label={cancelLabel}
      >
        {cancelLabel}
      </Button>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting || submitDisabled}
        startIcon={isSubmitting ? <CircularProgress size={20} /> : submitIcon}
        aria-label={submitLabel}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </Box>
  );
}
```

### Usage Example

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  <Grid container spacing={3}>
    {/* Form fields */}

    <Grid size={{ xs: 12 }}>
      <FormActions
        onCancel={handleCancel}
        submitLabel="Create Threat"
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        additionalActions={[
          {
            label: 'Save as Draft',
            variant: 'outlined',
            onClick: handleSaveDraft,
          }
        ]}
      />
    </Grid>
  </Grid>
</form>
```

---

## 3. ConfirmationDialog Component

### Purpose
Reusable confirmation dialog for all destructive actions (delete, discard changes, etc.).

### Props Interface

```tsx
export interface ConfirmationDialogProps {
  /**
   * Whether dialog is open
   */
  open: boolean;

  /**
   * Close dialog handler
   */
  onClose: () => void;

  /**
   * Confirm action handler
   */
  onConfirm: () => void;

  /**
   * Dialog title (question format recommended)
   */
  title: string;

  /**
   * Confirmation message/description
   */
  message: string;

  /**
   * Confirm button label
   * @default "Confirm"
   */
  confirmLabel?: string;

  /**
   * Cancel button label
   * @default "Cancel"
   */
  cancelLabel?: string;

  /**
   * Confirm button color
   * @default "error" for destructive actions
   */
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning';

  /**
   * Whether operation is in progress (disables buttons, shows loading)
   */
  isLoading?: boolean;

  /**
   * Severity level for icon display
   * @default "warning"
   */
  severity?: 'warning' | 'error' | 'info';

  /**
   * Additional details or list of items affected
   */
  details?: React.ReactNode;
}
```

### Implementation

```tsx
/**
 * ConfirmationDialog Component
 *
 * Standardized confirmation dialog for destructive actions.
 * Implements WCAG guidelines for alertdialog role.
 *
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   open={deleteDialogOpen}
 *   onClose={() => setDeleteDialogOpen(false)}
 *   onConfirm={handleDeleteConfirm}
 *   title="Delete Threat?"
 *   message={`Are you sure you want to delete "${threat.name}"? This action cannot be undone.`}
 *   confirmLabel="Delete"
 *   confirmColor="error"
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'error',
  isLoading = false,
  severity = 'warning',
  details,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    // Don't close here - let parent handle after async operation
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" sx={{ fontSize: 48 }} />;
      case 'warning':
        return <WarningIcon color="warning" sx={{ fontSize: 48 }} />;
      case 'info':
        return <InfoIcon color="info" sx={{ fontSize: 48 }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      role="alertdialog"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirmation-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getSeverityIcon()}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
        {details && (
          <Box sx={{ mt: 2 }}>
            {details}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          autoFocus // Cancel gets focus by default (safer)
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={handleConfirm}
          color={confirmColor}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Hook: useConfirmation

```tsx
/**
 * useConfirmation Hook
 *
 * Simplifies confirmation dialog state management.
 *
 * @example
 * ```tsx
 * const { confirm, ConfirmDialog } = useConfirmation();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item?',
 *     message: 'This action cannot be undone.',
 *   });
 *
 *   if (confirmed) {
 *     await deleteItem();
 *   }
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Delete</Button>
 *     <ConfirmDialog />
 *   </>
 * );
 * ```
 */
export function useConfirmation() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    props: Partial<ConfirmationDialogProps>;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    props: {},
    resolve: null,
  });

  const confirm = useCallback(
    (props: Omit<ConfirmationDialogProps, 'open' | 'onClose' | 'onConfirm'>) => {
      return new Promise<boolean>((resolve) => {
        setDialogState({
          open: true,
          props,
          resolve,
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState({ open: false, props: {}, resolve: null });
  }, [dialogState.resolve]);

  const handleConfirm = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState({ open: false, props: {}, resolve: null });
  }, [dialogState.resolve]);

  const ConfirmDialog = useCallback(
    () => (
      <ConfirmationDialog
        open={dialogState.open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialogState.props.title || 'Confirm Action'}
        message={dialogState.props.message || 'Are you sure?'}
        {...dialogState.props}
      />
    ),
    [dialogState, handleClose, handleConfirm]
  );

  return { confirm, ConfirmDialog };
}
```

---

## 4. Toast Notification System

### Hook: useNotification

```tsx
/**
 * useNotification Hook
 *
 * Provides toast notification functionality with consistent styling.
 *
 * @example
 * ```tsx
 * const { showSuccess, showError, showInfo, showWarning } = useNotification();
 *
 * const handleCreate = async () => {
 *   try {
 *     await createItem();
 *     showSuccess('Item created successfully');
 *   } catch (error) {
 *     showError('Failed to create item. Please try again.');
 *   }
 * };
 * ```
 */
export function useNotification() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    action?: React.ReactNode;
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const show = useCallback(
    (
      message: string,
      severity: 'success' | 'error' | 'warning' | 'info',
      action?: React.ReactNode
    ) => {
      setSnackbar({ open: true, message, severity, action });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, action?: React.ReactNode) => {
      show(message, 'success', action);
    },
    [show]
  );

  const showError = useCallback(
    (message: string, action?: React.ReactNode) => {
      show(message, 'error', action);
    },
    [show]
  );

  const showWarning = useCallback(
    (message: string, action?: React.ReactNode) => {
      show(message, 'warning', action);
    },
    [show]
  );

  const showInfo = useCallback(
    (message: string, action?: React.ReactNode) => {
      show(message, 'info', action);
    },
    [show]
  );

  const handleClose = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const NotificationContainer = useCallback(
    () => (
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? 6000 : 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
          action={snackbar.action}
          role="alert"
          aria-live={snackbar.severity === 'error' ? 'assertive' : 'polite'}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    ),
    [snackbar, handleClose]
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationContainer,
  };
}
```

---

## 5. Loading, Error, and Empty States

### LoadingState Component

```tsx
export interface LoadingStateProps {
  /**
   * Loading message to display
   * @default "Loading..."
   */
  message?: string;

  /**
   * Size of loading spinner
   * @default 60
   */
  size?: number;

  /**
   * Minimum height of container
   * @default "400px"
   */
  minHeight?: string | number;
}

export function LoadingState({
  message = 'Loading...',
  size = 60,
  minHeight = '400px',
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        p: 4,
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CircularProgress size={size} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}
```

### ErrorState Component

```tsx
export interface ErrorStateProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Optional retry callback
   */
  onRetry?: () => void;

  /**
   * Optional back/navigation callback
   */
  onBack?: () => void;

  /**
   * Back button label
   * @default "Go Back"
   */
  backLabel?: string;
}

export function ErrorState({
  message,
  onRetry,
  onBack,
  backLabel = 'Go Back',
}: ErrorStateProps) {
  return (
    <Box sx={{ p: 4 }}>
      <Alert
        severity="error"
        sx={{ mb: 3 }}
        role="alert"
        aria-live="assertive"
      >
        {message}
      </Alert>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            {backLabel}
          </Button>
        )}
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Box>
    </Box>
  );
}
```

### NotFoundState Component

```tsx
export interface NotFoundStateProps {
  /**
   * Entity name (e.g., "Threat", "Incident")
   */
  entity: string;

  /**
   * Optional custom message
   */
  message?: string;

  /**
   * Optional back callback
   */
  onBack?: () => void;

  /**
   * Back button label
   */
  backLabel?: string;
}

export function NotFoundState({
  entity,
  message,
  onBack,
  backLabel,
}: NotFoundStateProps) {
  const defaultMessage = message || `The requested ${entity.toLowerCase()} could not be found. It may have been deleted or you may not have permission to view it.`;
  const defaultBackLabel = backLabel || `Back to ${entity} List`;

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        {entity} Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {defaultMessage}
      </Typography>
      {onBack && (
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mt: 2 }}
        >
          {defaultBackLabel}
        </Button>
      )}
    </Box>
  );
}
```

### EmptyState Component

```tsx
export interface EmptyStateProps {
  /**
   * Empty state title
   */
  title: string;

  /**
   * Empty state message
   */
  message: string;

  /**
   * Optional CTA action
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };

  /**
   * Optional illustration/icon
   */
  illustration?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  action,
  illustration,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      {illustration && (
        <Box sx={{ mb: 3 }}>
          {illustration}
        </Box>
      )}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {message}
      </Typography>
      {action && (
        <Button
          variant="contained"
          startIcon={action.icon || <AddIcon />}
          onClick={action.onClick}
          sx={{ mt: 2 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
```

---

## 6. FieldDisplay Component (Detail Views)

```tsx
export interface FieldDisplayProps {
  /**
   * Field label
   */
  label: string;

  /**
   * Field value (can be string, number, or React node)
   */
  value: React.ReactNode;

  /**
   * Optional placeholder for empty values
   * @default "Not provided"
   */
  emptyPlaceholder?: string;

  /**
   * Optional variant for value typography
   * @default "body1"
   */
  valueVariant?: TypographyProps['variant'];
}

export function FieldDisplay({
  label,
  value,
  emptyPlaceholder = 'Not provided',
  valueVariant = 'body1',
}: FieldDisplayProps) {
  const displayValue = value || emptyPlaceholder;
  const isEmpty = !value;

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        gutterBottom
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography
        variant={valueVariant}
        color={isEmpty ? 'text.disabled' : 'text.primary'}
        sx={{ mt: 0.5 }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
}
```

---

## 7. SkeletonTable Component

```tsx
export interface SkeletonTableProps {
  /**
   * Number of skeleton rows
   * @default 5
   */
  rows?: number;

  /**
   * Number of skeleton columns
   * @default 5
   */
  columns?: number;

  /**
   * Whether to show table header
   * @default true
   */
  showHeader?: boolean;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  showHeader = true,
}: SkeletonTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableCell key={`header-${i}`}>
                  <Skeleton variant="text" width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

---

## Component Dependencies

All components depend on:
- `@mui/material` (already in project)
- `@mui/icons-material` (already in project)
- `react` and `react-router-dom` (already in project)

No additional dependencies required.

---

## Integration Checklist

When implementing CRUD pages using these components:

1. [ ] Import required components from `@/components/crud`
2. [ ] Use `PageHeader` for consistent page headers
3. [ ] Use `FormActions` for form buttons
4. [ ] Use `ConfirmationDialog` or `useConfirmation` for delete operations
5. [ ] Use `useNotification` for success/error feedback
6. [ ] Use `LoadingState`, `ErrorState`, `NotFoundState` for data loading states
7. [ ] Use `EmptyState` for empty list views
8. [ ] Use `FieldDisplay` for read-only fields in detail views
9. [ ] Use `SkeletonTable` for table loading states
10. [ ] Ensure all action buttons have `aria-label` attributes
11. [ ] Ensure all forms have proper validation with `react-hook-form` + `zod`
12. [ ] Ensure keyboard navigation works (Tab, Enter, Esc)

---

## Future Enhancements

### Planned Components
1. **BulkActionToolbar** - Reusable bulk action bar for tables
2. **AdvancedFilters** - Collapsible filter panel component
3. **ExportButton** - Standardized data export functionality
4. **ImportDialog** - Bulk import with CSV/JSON support
5. **AuditLog** - Show change history for entities
6. **Comments** - Collaborative comments/notes on items
7. **FileUpload** - Drag-and-drop file upload component
8. **RelatedItems** - Display related entities with links

### Enhancements to Existing Components
1. **PageHeader** - Add breadcrumb support
2. **ConfirmationDialog** - Add "Don't show again" checkbox option
3. **EmptyState** - Add illustration library integration
4. **SkeletonTable** - Add customizable column widths

---

## Conclusion

These reusable components provide a **solid foundation** for implementing consistent CRUD operations across all 19 Black-Cross modules. They address:

- ✅ Consistency in layout and behavior
- ✅ Accessibility (ARIA labels, keyboard nav, screen readers)
- ✅ User feedback (loading states, success/error notifications)
- ✅ Confirmation before destructive actions
- ✅ Mobile responsiveness
- ✅ Code reusability and maintainability

**Estimated Development Time**:
- Component implementation: 3-4 days
- Testing and refinement: 1-2 days
- Documentation and examples: 1 day
- **Total**: 5-7 days

**Expected Benefit**:
- Reduce CRUD page development time by 60-70%
- Ensure 100% consistency across all modules
- Improve accessibility compliance from 30% to 90%+
- Reduce bugs through standardized, tested components
