import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';

/**
 * Modal Component
 * Enhanced dialog with custom styling
 */
export default function Modal({
  open = false,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  size = 'medium',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          padding: '24px',
          backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <Box>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.25rem' }}>
            {title}
          </span>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#64748b',
            '&:hover': {
              color: '#1e3a8a',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          padding: '24px',
          minHeight: '200px',
        }}
      >
        {children}
      </DialogContent>

      {/* Actions */}
      {actions && (
        <DialogActions
          sx={{
            borderTop: '1px solid #e2e8f0',
            padding: '16px 24px',
            gap: '12px',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
