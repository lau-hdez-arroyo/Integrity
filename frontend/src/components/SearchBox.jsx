import React, { useState } from 'react';
import { Box, InputBase, IconButton, CircularProgress } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * SearchBox Component
 * Advanced search with debouncing
 */
export default function SearchBox({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  loading = false,
}) {
  const [value, setValue] = useState('');
  const [timerId, setTimerId] = useState(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear previous timer
    if (timerId) clearTimeout(timerId);

    // Set new timer for debounced search
    if (newValue) {
      const id = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
      setTimerId(id);
    } else {
      onSearch('');
    }
  };

  const handleClear = () => {
    setValue('');
    if (timerId) clearTimeout(timerId);
    onSearch('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '10px',
        backgroundColor: '#f8fafc',
        border: '2px solid #e2e8f0',
        transition: 'border-color 0.3s',
        '&:focus-within': {
          borderColor: '#1e3a8a',
        },
      }}
    >
      <SearchIcon sx={{ color: '#64748b' }} />

      <InputBase
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        sx={{
          flex: 1,
          fontSize: '0.95rem',
          color: '#0f172a',
          '& ::placeholder': {
            color: '#94a3b8',
            opacity: 1,
          },
        }}
      />

      {loading && (
        <CircularProgress size={20} sx={{ color: '#1e3a8a' }} />
      )}

      {value && !loading && (
        <IconButton
          size="small"
          onClick={handleClear}
          sx={{
            color: '#64748b',
            '&:hover': {
              color: '#1e3a8a',
            },
          }}
        >
          <ClearIcon />
        </IconButton>
      )}
    </Box>
  );
}
