import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

/**
 * RangeSlider Component
 * Dual-input range selector
 */
export default function RangeSlider({
  label,
  min = 0,
  max = 100,
  value = [0, 100],
  onChange,
  step = 1,
  marks = false,
}) {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          marginBottom: '12px',
          color: '#0f172a',
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <Slider
          getAriaLabel={() => 'Range'}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          marks={marks}
          valueLabelDisplay="auto"
          sx={{
            flex: 1,
            '& .MuiSlider-thumb': {
              backgroundColor: '#1e3a8a',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(30, 58, 138, 0.16)',
              },
            },
            '& .MuiSlider-track': {
              backgroundColor: '#1e3a8a',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e2e8f0',
            },
          }}
        />

        {/* Value Display */}
        <Box sx={{ minWidth: '120px', textAlign: 'right' }}>
          <Typography
            variant="body2"
            sx={{
              color: '#0f172a',
              fontWeight: 600,
            }}
          >
            {value[0]} - {value[1]}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
