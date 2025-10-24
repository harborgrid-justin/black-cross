import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Props for the ConfirmationDialog component
 */
export interface ConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Title of the confirmation dialog
   * @default "Confirm Action"
   */
  title?: string;

  /**
   * Message to display in the dialog body
   */
  message: string;

  /**
   * Name of the entity being acted upon (e.g., "Threat: APT29 Campaign")
   * Displayed in bold for emphasis
   */
  entityName?: string;

  /**
   * Text for the confirm button
   * @default "Confirm"
   */
  confirmText?: string;

  /**
   * Text for the cancel button
   * @default "Cancel"
   */
  cancelText?: string;

  /**
   * Whether this is a destructive action (e.g., delete)
   * If true, confirm button will be styled as error/danger
   * @default false
   */
  destructive?: boolean;

  /**
   * Whether the confirm action is loading
   * Shows loading state on confirm button
   * @default false
   */
  loading?: boolean;

  /**
   * Callback when confirm button is clicked
   */
  onConfirm: () => void;

  /**
   * Callback when cancel button is clicked or dialog is dismissed
   */
  onCancel: () => void;
}

/**
 * ConfirmationDialog Component
 *
 * A reusable confirmation dialog for critical actions like delete operations.
 * Follows WCAG 2.1 AA accessibility guidelines with proper ARIA labels and keyboard support.
 *
 * @example
 * ```tsx
 * const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 *
 * const handleDelete = () => {
 *   dispatch(deleteThreat(threatId));
 *   setDeleteDialogOpen(false);
 * };
 *
 * <ConfirmationDialog
 *   open={deleteDialogOpen}
 *   title="Delete Threat"
 *   message="Are you sure you want to delete this threat? This action cannot be undone."
 *   entityName={`Threat: ${threat.name}`}
 *   destructive
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   onConfirm={handleDelete}
 *   onCancel={() => setDeleteDialogOpen(false)}
 * />
 * ```
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title = 'Confirm Action',
  message,
  entityName,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirmation-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          {destructive && (
            <WarningAmberIcon
              color="error"
              aria-hidden="true"
            />
          )}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>

        {entityName && (
          <Box mt={2}>
            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{
                p: 1.5,
                bgcolor: 'action.hover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {entityName}
            </Typography>
          </Box>
        )}

        {destructive && (
          <Box mt={2}>
            <Typography
              variant="body2"
              color="error"
              fontWeight="medium"
            >
              ⚠️ This action cannot be undone.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          aria-label={cancelText}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          autoFocus
          aria-label={confirmText}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
