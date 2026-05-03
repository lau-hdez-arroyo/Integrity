import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import {
  WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

/**
 * ConfirmDialog Component
 * Confirmation modal with different severity levels
 */
export default function ConfirmDialog({
  open = false,
  title = 'Confirm',
  message = 'Are you sure?',
  onConfirm,
  onCancel,
  severity = 'warning', // 'warning', 'error', 'info', 'success'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}) {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'error':
        return { icon: <ErrorIcon />, color: '#ef4444' };
      case 'info':
        return { icon: <InfoIcon />, color: '#06b6d4' };
      case 'success':
        return { icon: <CheckCircleIcon />, color: '#10b981' };
      default:
        return { icon: <WarningIcon />, color: '#f59e0b' };
    }
  };

  const config = getSeverityConfig();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid #e2e8f0',
          padding: '24px',
        }}
      >
        <Box sx={{ color: config.color, display: 'flex' }}>
          {config.icon}
        </Box>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>{title}</span>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px' }}>
        <Typography variant="body1" sx={{ color: '#334155' }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px', gap: '12px' }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            '&:hover': {
              backgroundColor: 'rgba(100, 116, 139, 0.08)',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: config.color,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: config.color,
              opacity: 0.9,
            },
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
