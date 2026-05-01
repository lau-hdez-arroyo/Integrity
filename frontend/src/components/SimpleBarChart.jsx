import React from 'react';
import { Box, Typography, Tooltip, alpha } from '@mui/material';

/**
 * SimpleBarChart - Basic bar chart without external dependencies
 */
export default function SimpleBarChart({
  data = [
    { label: 'Q1', value: 65, max: 100 },
    { label: 'Q2', value: 78, max: 100 },
    { label: 'Q3', value: 85, max: 100 },
    { label: 'Q4', value: 92, max: 100 },
  ],
  title = 'Performance Trend',
  color = '#1e3a8a',
  height = 300,
}) {
  const maxValue = Math.max(...data.map(d => d.max));
  const padding = 40;

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          marginBottom: '24px',
          color: '#0f172a',
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          height: `${height}px`,
          gap: '16px',
          padding: '16px',
          backgroundColor: alpha(color, 0.02),
          borderRadius: '12px',
          border: `1px solid ${alpha(color, 0.1)}`,
        }}
      >
        {data.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <Tooltip key={idx} title={`${item.label}: ${item.value}%`}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: `${percentage}%`,
                    backgroundColor: color,
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1,
                      transform: 'scaleY(1.05)',
                      transformOrigin: 'bottom',
                    },
                    cursor: 'pointer',
                    boxShadow: `0 2px 8px ${alpha(color, 0.2)}`,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: color,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  {item.value}%
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
