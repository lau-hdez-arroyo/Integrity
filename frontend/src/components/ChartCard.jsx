import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * ChartCard - Container for charts with header and loading state
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
  action,
  sx = {},
}) {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
        ...sx,
      }}
    >
      <CardHeader
        title={title}
        subheader={subtitle}
        action={action}
        titleTypographyProps={{
          variant: 'h6',
          sx={{ fontWeight: 700, color: '#0f172a' },
        }}
        subheaderTypographyProps={{
          variant: 'body2',
          sx={{ color: '#64748b', marginTop: '4px' },
        }}
        sx={{
          paddingBottom: '16px',
          borderBottom: '1px solid #f1f5f9',
        }}
      />
      <CardContent
        sx={{
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
          position: 'relative',
          minHeight: '300px',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
