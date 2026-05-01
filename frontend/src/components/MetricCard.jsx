import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * MetricCard - Displays a single metric with trend and progress
 * 
 * @component
 * @example
 * <MetricCard
 *   title="Quality Score"
 *   value="92%"
 *   trend={{ value: 5, direction: 'up' }}
 *   color="success"
 *   icon={<QualityIcon />}
 * />
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  color = 'primary',
  progress,
  icon,
  onClick,
  actionChip,
}) {
  const colorMap = {
    primary: '#1e3a8a',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  };

  const backgroundColor = alpha(colorMap[color], 0.08);
  const borderColor = alpha(colorMap[color], 0.2);

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-2px)',
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        }}
      >
        {/* Header: Title + Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor,
                color: colorMap[color],
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {/* Main Value */}
        <Box sx={{ marginBottom: '12px' }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.01em',
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                marginTop: '4px',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Trend */}
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: trend.direction === 'up' ? '#10b981' : '#ef4444',
              }}
            >
              {trend.direction === 'up' ? (
                <TrendingUpIcon sx={{ fontSize: '1.25rem' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: '1.25rem' }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {trend.value}%
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              vs last period
            </Typography>
          </Box>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <Box sx={{ marginBottom: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ color: colorMap[color], fontWeight: 600 }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: '6px',
                borderRadius: '4px',
                backgroundColor: alpha(colorMap[color], 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: '4px',
                  backgroundColor: colorMap[color],
                },
              }}
            />
          </Box>
        )}

        {/* Action Chip */}
        {actionChip && (
          <Box sx={{ marginTop: '12px' }}>
            <Chip
              label={actionChip.label}
              size="small"
              color={actionChip.color || 'primary'}
              variant="outlined"
              sx={{
                fontWeight: 500,
                borderRadius: '6px',
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
