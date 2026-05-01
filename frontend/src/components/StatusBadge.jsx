import React from 'react';
import { Box, Typography, Chip, alpha } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

/**
 * StatusBadge - Displays status with icon and color
 */
export default function StatusBadge({
  status = 'neutral',
  label,
  size = 'medium',
  onClick,
}) {
  const statusConfig = {
    success: {
      bg: '#d1fae5',
      text: '#065f46',
      icon: <CheckCircleIcon />,
      label: 'Success',
    },
    warning: {
      bg: '#fef08a',
      text: '#713f12',
      icon: <WarningIcon />,
      label: 'Warning',
    },
    error: {
      bg: '#fee2e2',
      text: '#7f1d1d',
      icon: <ErrorIcon />,
      label: 'Error',
    },
    info: {
      bg: '#dbeafe',
      text: '#0c4a6e',
      icon: <InfoIcon />,
      label: 'Info',
    },
    neutral: {
      bg: '#f1f5f9',
      text: '#334155',
      icon: <InfoIcon />,
      label: 'Neutral',
    },
  };

  const config = statusConfig[status] || statusConfig.neutral;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: size === 'small' ? '6px 12px' : '8px 16px',
        borderRadius: '8px',
        backgroundColor: config.bg,
        border: `1px solid ${alpha(config.text, 0.2)}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(config.text, 0.15)}`,
            }
          : {},
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: config.text,
          fontSize: size === 'small' ? '1rem' : '1.25rem',
        }}
      >
        {config.icon}
      </Box>
      <Typography
        variant={size === 'small' ? 'caption' : 'body2'}
        sx={{
          color: config.text,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}
      >
        {label || config.label}
      </Typography>
    </Box>
  );
}
