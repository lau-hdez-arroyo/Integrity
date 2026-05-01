import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * HeatMapChart - Visual heat map for risk/coverage visualization
 * Shows a grid of modules with color coding
 */
export default function HeatMapChart({
  data = [],
  title = 'Coverage Heat Map',
}) {
  // Sample data if none provided
  const sampleData = data.length === 0
    ? [
        { module: 'Authentication', coverage: 95, risk: 5 },
        { module: 'Authorization', coverage: 88, risk: 12 },
        { module: 'Dashboard', coverage: 92, risk: 8 },
        { module: 'Reports', coverage: 85, risk: 15 },
        { module: 'Data Sync', coverage: 78, risk: 22 },
        { module: 'Integration', coverage: 70, risk: 30 },
      ]
    : data;

  // Color based on coverage percentage
  const getColor = (coverage) => {
    if (coverage >= 90) return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
    if (coverage >= 80) return { bg: '#dbeafe', text: '#0c4a6e', border: '#93c5fd' };
    if (coverage >= 70) return { bg: '#fef08a', text: '#713f12', border: '#fcd34d' };
    return { bg: '#fee2e2', text: '#7f1d1d', border: '#fca5a5' };
  };

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

      <Grid container spacing={2}>
        {sampleData.map((item, idx) => {
          const colors = getColor(item.coverage);
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Tooltip title={`Coverage: ${item.coverage}% | Risk: ${item.risk}%`}>
                <Box
                  sx={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: colors.bg,
                    border: `2px solid ${colors.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 16px ${alpha(colors.border, 0.3)}`,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    {item.module}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text,
                          opacity: 0.7,
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        Coverage
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: colors.text,
                          fontWeight: 700,
                          fontSize: '1.5rem',
                        }}
                      >
                        {item.coverage}%
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text,
                          opacity: 0.7,
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        Risk
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: colors.text,
                          fontWeight: 700,
                          fontSize: '1.5rem',
                        }}
                      >
                        {item.risk}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
