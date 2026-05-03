import React, { useState, useMemo } from 'react';
import { Box, TextField, Chip, Button, Collapse, Stack } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

/**
 * FilterBar Component
 * Advanced filtering with multiple criteria
 */
export default function FilterBar({
  filters = [],
  onApplyFilters,
  onClearFilters,
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(activeFilters);
  };

  const handleClear = () => {
    setActiveFilters({});
    onClearFilters();
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <Box
      sx={{
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Filters</span>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{ marginLeft: '8px' }}
              />
            )}
          </Box>
        </Box>

        <ExpandMoreIcon
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
            color: '#64748b',
          }}
        />
      </Box>

      {/* Filters */}
      <Collapse in={expanded} timeout="auto">
        <Stack spacing={2} sx={{ marginTop: '16px' }}>
          {filters.map(filter => (
            <Box key={filter.id}>
              <TextField
                label={filter.label}
                type={filter.type || 'text'}
                value={activeFilters[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                fullWidth
                size="small"
                select={filter.options ? true : false}
                SelectProps={filter.options ? { native: true } : {}}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              >
                {filter.options && (
                  <>
                    <option value="">All {filter.label}</option>
                    {filter.options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </>
                )}
              </TextField>
            </Box>
          ))}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <Button
              variant="contained"
              onClick={handleApply}
              sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Clear All
            </Button>
          </Box>
        </Stack>
      </Collapse>
    </Box>
  );
}
