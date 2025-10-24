# Recommended Standardized CRUD UI Patterns - Black-Cross Platform

**Analysis ID**: UX47D2
**Date**: 2025-10-24
**Target**: All 19 frontend modules

---

## Executive Summary

This document defines **standardized CRUD UI/UX patterns** for the Black-Cross platform to ensure consistency, accessibility, and best practices across all modules. These patterns build upon the strong foundation established in Threat Intelligence and Incident Response modules while addressing identified gaps.

---

## 1. CREATE Operation - Standard Pattern

### Approach: Dedicated Full-Page Form
**Reasoning**: Enterprise security data requires comprehensive forms with many fields. Full-page approach provides:
- Sufficient space for complex field layouts
- Better focus and less distraction than modals
- Easier validation and error display
- Better mobile responsiveness

### Standard Create Page Structure

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAppDispatch } from '@/store/hooks';
import { useNotification } from '@/hooks/useNotification';
import { PageHeader } from '@/components/common/PageHeader';
import { FormActions } from '@/components/common/FormActions';
import { createItem } from './store';

// Define validation schema with Zod
const itemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function ItemCreate() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      severity: 'medium',
      description: '',
    },
  });

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(createItem(data)).unwrap();
      showSuccess('Item created successfully');
      navigate('/items');
    } catch (error) {
      showError('Failed to create item. Please try again.');
      console.error('Create error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      // Show unsaved changes dialog
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/items');
      }
    } else {
      navigate('/items');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create New Item"
        backButton={{
          label: 'Back to Items',
          onClick: handleCancel,
        }}
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Form fields */}
            <Grid size={{ xs: 12 }}>
              <TextField
                {...register('name')}
                fullWidth
                label="Name"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting}
              />
            </Grid>

            {/* More fields... */}

            <Grid size={{ xs: 12 }}>
              <FormActions
                onCancel={handleCancel}
                submitLabel="Create Item"
                isSubmitting={isSubmitting}
                isDirty={isDirty}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
```

### Create Operation Specifications

**Page Title**: "Create New [Entity]"
**Submit Button**: "Create [Entity]" with SaveIcon
**Navigation on Success**: Return to list view (`/module-name`)
**Navigation on Cancel**: Return to list view with unsaved changes warning if form is dirty

**Layout**:
- Back button: Top-left, outside Paper
- Form container: Paper with `p: 3`
- Form fields: Grid container with `spacing={3}`
- Actions: Bottom-right, `gap: 2`, Cancel (outlined) + Submit (contained)

**Required Features**:
1. ✓ Form validation with Zod schema
2. ✓ Inline error messages with helperText
3. ✓ Loading state on submit button
4. ✓ Disabled fields during submission
5. ✓ Success/error toast notifications
6. ✓ Unsaved changes warning on cancel/back
7. ✓ Accessible form labels and ARIA attributes

---

## 2. EDIT Operation - Standard Pattern

### Approach: Dedicated Full-Page Form (Pre-populated)

### Standard Edit Page Structure

```tsx
export default function ItemEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotification();
  const { selectedItem: item, loading } = useAppSelector((state) => state.items);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  // Fetch item on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
    }
  }, [dispatch, id]);

  // Populate form when item loads
  useEffect(() => {
    if (item) {
      reset({
        name: item.name || '',
        severity: item.severity || 'medium',
        description: item.description || '',
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: ItemFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await dispatch(updateItem({ id, data })).unwrap();
      showSuccess('Item updated successfully');
      navigate(`/items/${id}`); // Return to detail view
    } catch (error) {
      showError('Failed to update item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(`/items/${id}`);
      }
    } else {
      navigate(`/items/${id}`);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading item..." />;
  }

  // Not found state
  if (!item) {
    return (
      <Box>
        <PageHeader
          title="Item Not Found"
          backButton={{ label: 'Back to Items', onClick: () => navigate('/items') }}
        />
        <Alert severity="error">The requested item could not be found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Edit: ${item.name}`}
        backButton={{
          label: 'Back to Details',
          onClick: handleCancel,
        }}
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form fields same as Create */}
          <Grid container spacing={3}>
            {/* ... */}
            <Grid size={{ xs: 12 }}>
              <FormActions
                onCancel={handleCancel}
                submitLabel="Save Changes"
                isSubmitting={isSubmitting}
                isDirty={isDirty}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
```

### Edit Operation Specifications

**Page Title**: "Edit: [Entity Name]" (shows actual item name in title)
**Submit Button**: "Save Changes" with SaveIcon
**Navigation on Success**: Return to detail view (`/module-name/:id`)
**Navigation on Cancel**: Return to detail view with unsaved changes warning

**Data Loading**:
1. Show loading spinner while fetching item data
2. Show "Not Found" message if item doesn't exist
3. Pre-populate form only after data loads (avoid flashing)

**Differences from Create**:
- Back button returns to detail (not list)
- Submit navigates to detail (not list)
- Page title includes item name
- Form is pre-populated with existing data

---

## 3. DELETE Operation - Standard Pattern

### Approach: Confirmation Dialog Before Deletion

**CRITICAL**: Never delete immediately. Always confirm destructive actions.

### Standard Delete Pattern

```tsx
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotification();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteItem(id)).unwrap();
      showSuccess('Item deleted successfully');
      navigate('/items'); // Return to list after deletion
    } catch (error) {
      showError('Failed to delete item. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title={item.name}
        backButton={{ label: 'Back to Items', onClick: () => navigate('/items') }}
        actions={[
          {
            label: 'Edit',
            icon: <EditIcon />,
            onClick: () => navigate(`/items/${id}/edit`),
            variant: 'outlined',
          },
          {
            label: 'Delete',
            icon: <DeleteIcon />,
            onClick: handleDeleteClick,
            variant: 'outlined',
            color: 'error',
          },
        ]}
      />

      {/* Detail content */}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item?"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={isDeleting}
      />
    </Box>
  );
}
```

### Delete Operation Specifications

**Confirmation Dialog Requirements**:
1. **Title**: "Delete [Entity]?" (question format creates cognitive friction)
2. **Message**: Include item name and "cannot be undone" warning
3. **Buttons**:
   - Cancel (outlined, left) - default focus
   - Delete (contained, error color, right)
4. **Loading State**: Disable buttons, show spinner during deletion
5. **Keyboard**: Esc to cancel, Enter to confirm (after explicit focus on Delete button)

**Navigation After Deletion**:
- Return to list view
- Show success toast with undo option (future enhancement)

**Inline Delete (List View)**:
- Use icon button with DeleteIcon
- Must still show confirmation dialog
- Never delete on single click

**Accessibility**:
- Dialog has `role="alertdialog"`
- Focus traps in dialog
- Confirm button has `aria-label="Delete [entity name]"`
- Warning message announced to screen readers

---

## 4. DETAIL (Read) Operation - Standard Pattern

### Approach: Read-Only View with Action Buttons

### Standard Detail Page Structure

```tsx
export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedItem: item, loading, error } = useAppSelector((state) => state.items);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
    }
    return () => {
      dispatch(clearSelectedItem());
    };
  }, [dispatch, id]);

  if (loading) {
    return <LoadingState message="Loading item details..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => dispatch(fetchItemById(id!))}
        onBack={() => navigate('/items')}
      />
    );
  }

  if (!item) {
    return (
      <NotFoundState
        entity="Item"
        onBack={() => navigate('/items')}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title={item.name}
        backButton={{
          label: 'Back to Items',
          onClick: () => navigate('/items'),
        }}
        actions={[
          {
            label: 'Edit',
            icon: <EditIcon />,
            onClick: () => navigate(`/items/${id}/edit`),
            variant: 'contained',
          },
          {
            label: 'Delete',
            icon: <DeleteIcon />,
            onClick: () => setDeleteDialogOpen(true),
            variant: 'outlined',
            color: 'error',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {item.name}
          </Typography>
          <Chip
            label={item.severity}
            color={getSeverityColor(item.severity)}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Metadata Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={`Type: ${item.type}`} size="small" />
          <Chip label={`Status: ${item.status}`} size="small" variant="outlined" />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Field Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FieldDisplay label="Description" value={item.description} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FieldDisplay
              label="Created At"
              value={new Date(item.createdAt).toLocaleString()}
            />
          </Grid>
          {/* More fields... */}
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item?"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
```

### Detail Operation Specifications

**Page Title**: Entity name (e.g., "CVE-2024-1234" or "Ransomware Incident #42")

**Action Buttons** (top-right):
- Primary: "Edit" (contained button)
- Secondary: "Delete" (outlined, error color)
- Optional: "Archive", "Export", "Clone", etc.

**Content Layout**:
1. **Header Section**: Title + primary status chip
2. **Metadata Chips**: Secondary information as small chips
3. **Divider**: Visual separation
4. **Field Grid**: Organized in responsive grid (2 columns on desktop, 1 on mobile)

**Field Display Pattern**:
```tsx
<Box>
  <Typography variant="caption" color="text.secondary">
    Field Label
  </Typography>
  <Typography variant="body1" sx={{ mt: 0.5 }}>
    {value || 'Not provided'}
  </Typography>
</Box>
```

**Special Displays**:
- Arrays (tags, categories): Use Chip components
- Dates: Use localized formatting
- Large text: Use multiline with proper line-height
- Related items: Use links or expandable sections

---

## 5. LIST Operation - Standard Pattern

### Approach: Filter Bar + Data Table with Actions

### Standard List Page Structure

```tsx
export default function ItemList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useAppSelector((state) => state.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchItems(filters));
  }, [dispatch, filters]);

  const handleSearch = () => {
    dispatch(setFilters({ ...filters, search: searchTerm }));
  };

  const handleRowClick = (id: string) => {
    navigate(`/items/${id}`);
  };

  const handleBulkDelete = async () => {
    try {
      await dispatch(bulkDeleteItems(selectedIds)).unwrap();
      showSuccess(`${selectedIds.length} items deleted successfully`);
      setSelectedIds([]);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      showError('Failed to delete items');
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Items"
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshIcon />,
            onClick: () => dispatch(fetchItems(filters)),
            variant: 'outlined',
          },
          {
            label: 'Add Item',
            icon: <AddIcon />,
            onClick: () => navigate('/items/new'),
            variant: 'contained',
          },
        ]}
      />

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select label="Severity">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Button variant="contained" onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions Toolbar (conditional) */}
      {selectedIds.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              {selectedIds.length} item(s) selected
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSelectedIds([])}
              >
                Clear Selection
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                Delete Selected
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      {loading ? (
        <SkeletonTable rows={10} columns={6} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.length === items.length && items.length > 0}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(items.map(item => item.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      title="No Items Found"
                      message="Try adjusting your filters or create a new item to get started."
                      action={{
                        label: 'Create First Item',
                        onClick: () => navigate('/items/new'),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    selected={selectedIds.includes(item.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, item.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(item.id)}>
                      {item.name}
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(item.id)}>
                      <Chip
                        label={item.severity}
                        size="small"
                        color={getSeverityColor(item.severity)}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(item.id)}>
                      <Chip
                        label={item.status}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(item.id)}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/items/${item.id}/edit`)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination (if needed) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(totalItems / itemsPerPage)}
          page={currentPage}
          onChange={(e, page) => dispatch(setPage(page))}
        />
      </Box>

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Items?"
        message={`Are you sure you want to delete ${selectedIds.length} item(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        confirmColor="error"
      />
    </Box>
  );
}
```

### List Operation Specifications

**Page Header**:
- Title: Plural entity name ("Items", "Threats", "Vulnerabilities")
- Actions: Refresh (outlined) + Add (contained, primary position)

**Filter Bar**:
- Search field: Full-width on mobile, 50% on desktop
- Filter dropdowns: 2-4 filters maximum visible by default
- Search button: Triggers filter application
- Advanced filters: Collapsible section for additional filters

**Bulk Operations**:
- Checkbox column for row selection
- Select all checkbox in header
- Bulk action toolbar appears when items selected
- Supported actions: Delete, Export, Bulk Edit (status/assignment)

**Table Specifications**:
- Row hover effect for affordance
- Entire row clickable to navigate to detail (except checkbox and actions)
- Status/severity displayed as Chips
- Actions column with icon buttons (Edit, Delete)
- Loading: Show skeleton table (not full-page spinner)

**Empty State**:
- Centered message with friendly copy
- "Create First [Entity]" button
- Optional illustration (future enhancement)

**Pagination**:
- Material-UI Pagination component
- Show total count and current range
- Default: 25 items per page

---

## 6. Form Layout Standards

### Field Ordering Priority

1. **Primary Identifier** (name, title) - Always first, full-width
2. **Critical Metadata** (severity, priority, status) - Half-width pairs
3. **Classification** (type, category) - Half-width pairs
4. **Description/Details** - Full-width, multiline
5. **Assignment/Ownership** - Half-width
6. **Timestamps** (created, modified) - Auto-populated, read-only in edit mode
7. **Advanced Options** - Collapsible section (optional)
8. **Actions** - Always last, right-aligned

### Responsive Field Layout

```tsx
<Grid container spacing={3}>
  {/* Full-width primary field */}
  <Grid size={{ xs: 12 }}>
    <TextField fullWidth label="Name" required />
  </Grid>

  {/* Half-width paired fields (stack on mobile) */}
  <Grid size={{ xs: 12, md: 6 }}>
    <FormControl fullWidth>
      <InputLabel>Severity</InputLabel>
      <Select label="Severity" required />
    </FormControl>
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <FormControl fullWidth>
      <InputLabel>Status</InputLabel>
      <Select label="Status" required />
    </FormControl>
  </Grid>

  {/* Full-width multiline field */}
  <Grid size={{ xs: 12 }}>
    <TextField
      fullWidth
      multiline
      rows={4}
      label="Description"
      helperText="Provide detailed information"
    />
  </Grid>

  {/* Actions - always full-width, right-aligned */}
  <Grid size={{ xs: 12 }}>
    <FormActions
      onCancel={handleCancel}
      submitLabel="Create Item"
      isSubmitting={isSubmitting}
    />
  </Grid>
</Grid>
```

### Field Specifications

**Required Fields**:
- Mark with asterisk (*) in label
- Use `required` prop on TextField
- Validate on submit and on blur
- Show error message in helperText

**Optional Fields**:
- No asterisk
- Lighter label color (optional, via Typography)
- Helper text to clarify purpose

**Field Types**:
- Short text: `<TextField>` single-line
- Long text: `<TextField multiline rows={4}>`
- Dropdowns: `<Select>` with `<MenuItem>`
- Dates: `<TextField type="date">` or date picker component
- Numbers: `<TextField type="number">` with inputProps for min/max
- Booleans: `<Switch>` or `<Checkbox>`
- Tags/Multi-select: `<Autocomplete>` with chips

**Helper Text**:
- Use for clarification, examples, or constraints
- Error messages replace helper text when field is invalid
- Character count for limited fields: "45/100 characters"

---

## 7. Validation Standards

### Validation Strategy

1. **Schema-based**: Define Zod schemas for all form data
2. **On Submit**: Primary validation trigger
3. **On Blur**: Secondary validation for immediate feedback
4. **On Change**: For complex fields (password strength, email format)

### Validation Display Pattern

```tsx
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
});

// In component
<TextField
  {...register('email')}
  type="email"
  label="Email"
  required
  error={!!errors.email}
  helperText={errors.email?.message || 'Enter a valid email address'}
  disabled={isSubmitting}
/>
```

### Error Message Guidelines

**DO**:
- "Email is required"
- "Password must be at least 8 characters"
- "Name cannot exceed 100 characters"
- "Invalid date format. Use YYYY-MM-DD"

**DON'T**:
- "Error: validation failed" (too generic)
- "email required" (not capitalized, no punctuation)
- "This field is invalid" (not specific)

### Form-Level Validation

For cross-field validation (e.g., end date after start date):
```tsx
const formSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});
```

---

## 8. User Feedback Standards

### Success Notifications

```tsx
// After successful create
showSuccess('Threat intelligence item created successfully');

// After successful update
showSuccess('Incident updated successfully');

// After successful delete
showSuccess('Vulnerability deleted successfully');

// After bulk operation
showSuccess(`${count} items deleted successfully`);
```

**Success Notification Specifications**:
- Duration: 4 seconds (auto-dismiss)
- Position: Top-right
- Color: Success (green)
- Icon: CheckCircleIcon
- Action: Optional "View" link to navigate to created/updated item

### Error Notifications

```tsx
// Generic error
showError('Failed to create item. Please try again.');

// Specific error (from server)
showError(error.message || 'An unexpected error occurred');

// Network error
showError('Network error. Please check your connection and try again.');

// Validation error (form-level)
showError('Please correct the errors in the form before submitting.');
```

**Error Notification Specifications**:
- Duration: 6 seconds (longer than success)
- Position: Top-right
- Color: Error (red)
- Icon: ErrorIcon
- Action: Optional "Retry" button for failed operations

### Loading States

**Submit Buttons**:
```tsx
<Button
  type="submit"
  variant="contained"
  disabled={isSubmitting}
  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

**Page Loading** (Detail/Edit fetch):
```tsx
<LoadingState message="Loading item details..." />

// Implementation:
<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 6 }}>
  <CircularProgress size={60} />
  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
    {message}
  </Typography>
</Box>
```

**Table Loading** (better UX than spinner):
```tsx
<SkeletonTable rows={10} columns={6} />

// Shows skeleton rows with shimmer animation
```

---

## 9. Navigation Flow Standards

### Standardized Routes

```
/module-name                    → List view
/module-name/new                → Create view
/module-name/:id                → Detail view
/module-name/:id/edit           → Edit view
```

**Examples**:
- `/threat-intelligence`, `/threat-intelligence/new`, `/threat-intelligence/123`, `/threat-intelligence/123/edit`
- `/incident-response`, `/incident-response/new`, `/incident-response/456`, `/incident-response/456/edit`

### Navigation Rules

**From List**:
- Click "Add" button → Navigate to `/module-name/new`
- Click table row → Navigate to `/module-name/:id`
- Click row edit icon → Navigate to `/module-name/:id/edit` (optional, prefer detail → edit)

**From Create**:
- Click "Cancel" → Navigate to `/module-name` (list)
- Click "Back" → Navigate to `/module-name` (list)
- Submit success → Navigate to `/module-name` (list) with success toast

**From Detail**:
- Click "Back" → Navigate to `/module-name` (list)
- Click "Edit" → Navigate to `/module-name/:id/edit`
- Delete success → Navigate to `/module-name` (list) with success toast

**From Edit**:
- Click "Cancel" → Navigate to `/module-name/:id` (detail)
- Click "Back" → Navigate to `/module-name/:id` (detail)
- Submit success → Navigate to `/module-name/:id` (detail) with success toast

### Breadcrumb Navigation (Future Enhancement)

```
Home > Threat Intelligence > CVE-2024-1234 > Edit
```

Clickable breadcrumbs improve wayfinding in deep hierarchies.

---

## 10. Accessibility Standards

### ARIA Labels for Actions

```tsx
// Icon-only buttons MUST have aria-label
<IconButton
  onClick={handleEdit}
  aria-label={`Edit ${item.name}`}
>
  <EditIcon />
</IconButton>

<IconButton
  onClick={handleDelete}
  aria-label={`Delete ${item.name}`}
>
  <DeleteIcon />
</IconButton>

// Buttons with text don't need aria-label
<Button startIcon={<EditIcon />}>Edit</Button>
```

### Form Accessibility

```tsx
// TextField with validation
<TextField
  id="item-name"
  label="Name"
  required
  error={!!errors.name}
  helperText={errors.name?.message}
  inputProps={{
    'aria-describedby': 'name-helper-text',
    'aria-invalid': !!errors.name,
    'aria-required': true,
  }}
/>

// FormHelperText with id
<FormHelperText id="name-helper-text">
  Enter a unique name for this item
</FormHelperText>
```

### Keyboard Navigation

**Required Keyboard Support**:
- Tab: Move focus through form fields in logical order
- Shift+Tab: Move focus backward
- Enter: Submit form when focused on submit button
- Esc: Close dialogs, cancel operations
- Arrow keys: Navigate dropdowns and autocomplete options

**Focus Management**:
- Auto-focus first field in Create forms
- Auto-focus first error field after validation failure
- Trap focus in dialogs (prevent Tab from leaving dialog)
- Return focus to trigger element after dialog closes

### Screen Reader Announcements

```tsx
// Announce success
<Snackbar
  open={successOpen}
  message="Item created successfully"
  role="alert"
  aria-live="polite"
/>

// Announce errors
<Alert severity="error" role="alert" aria-live="assertive">
  Failed to delete item. Please try again.
</Alert>

// Loading state announcement
<div role="status" aria-live="polite" aria-atomic="true">
  {loading ? 'Loading item details...' : null}
</div>
```

### Color Contrast

**WCAG AA Requirements**:
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18pt+): 3:1 contrast ratio minimum
- UI components: 3:1 contrast ratio minimum

Material-UI default theme meets these requirements. Custom colors must be tested.

---

## 11. Mobile Responsiveness Standards

### Responsive Breakpoints

```tsx
const breakpoints = {
  xs: 0,      // Mobile (320px+)
  sm: 600,    // Small tablet
  md: 900,    // Tablet
  lg: 1200,   // Desktop
  xl: 1536,   // Large desktop
};
```

### Mobile-Specific Patterns

**Forms**:
- All fields stack to full-width (`size={{ xs: 12 }}`)
- Larger tap targets (min 44px height)
- Reduce padding in Paper containers (p: 2 on mobile, p: 3 on desktop)

**Tables**:
- Horizontal scroll with TableContainer
- Consider card view for mobile instead of table (future enhancement)

**Filter Bars**:
- Stack filters vertically on mobile
- Collapsible filter section to save space

**Action Buttons**:
- Stack vertically on mobile (full-width)
- Primary action always at bottom (easier thumb reach)

### Touch Gestures

- Swipe left on table row to reveal delete action (future enhancement)
- Pull-to-refresh on list views (future enhancement)

---

## Summary of Recommended Patterns

| Operation | Approach | Page Type | Navigation | Confirmation |
|-----------|----------|-----------|------------|--------------|
| **Create** | Dedicated page | Full-page form | List → Create → Submit → List | None |
| **Edit** | Dedicated page | Full-page form (pre-populated) | Detail → Edit → Submit → Detail | Unsaved changes |
| **Delete** | Confirmation first | Dialog over Detail | Detail → Confirm → List | Always confirm |
| **Detail** | Read-only view | Information display | List → Detail | None |
| **List** | Table with filters | Data table + filter bar | Entry point | Bulk delete |

**Key Principles**:
1. **Consistency**: Same pattern across all 19 modules
2. **User Feedback**: Toast notifications for all operations
3. **Validation**: Inline errors with helpful messages
4. **Accessibility**: ARIA labels, keyboard nav, screen reader support
5. **Confirmation**: Always confirm destructive actions
6. **Loading States**: Show progress, disable during operations
7. **Error Handling**: Clear messages with recovery options
8. **Mobile-First**: Responsive design, touch-friendly
9. **Reusability**: Shared components (PageHeader, FormActions, ConfirmationDialog)
10. **Navigation**: Predictable, breadcrumb-friendly routes

---

## Implementation Priority

1. **Critical**: ConfirmationDialog, Toast Notifications, Inline Validation
2. **High**: PageHeader, FormActions, LoadingState components
3. **Medium**: Bulk operations, enhanced empty states, keyboard shortcuts
4. **Low**: Breadcrumbs, mobile gestures, optimistic updates

**Next Steps**: Review component specifications document for implementation details.
