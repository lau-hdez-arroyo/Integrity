import React from 'react';
import {
  TextField,
  FormControl,
  FormHelperText,
  Box,
  Typography,
} from '@mui/material';

/**
 * FormField Component
 * Enhanced TextField with validation and help text
 */
export default function FormField({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  type = 'text',
  placeholder,
  multiline = false,
  rows = 4,
  select = false,
  options = [],
  maxLength,
  pattern,
  disabled = false,
  size = 'medium',
  fullWidth = true,
  sx = {},
  onBlur,
  onFocus,
}) {
  const [touched, setTouched] = React.useState(false);
  let displayError = error || false;

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    let newValue = e.target.value;

    // Validate pattern if provided
    if (pattern && newValue && !new RegExp(pattern).test(newValue)) {
      return;
    }

    // Limit max length if provided
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    onChange(newValue);
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <TextField
        label={label}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={onFocus}
        error={displayError && touched}
        helperText={displayError && touched ? helperText : ''}
        required={required}
        type={type}
        placeholder={placeholder}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        select={select}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&.Mui-focused': {
              '& fieldset': {
                borderColor: '#1e3a8a',
              },
            },
          },
          '& .MuiFormHelperText-root': {
            color: '#ef4444',
            marginLeft: 0,
          },
          ...sx,
        }}
      >
        {select && options.length > 0 && (
          <>
            <option value="">Select {label}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </>
        )}
      </TextField>

      {/* Character Counter */}
      {maxLength && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Typography
            variant="caption"
            sx={{
              color: value.length > maxLength * 0.9 ? '#ef4444' : '#64748b',
            }}
          >
            {value.length}/{maxLength}
          </Typography>
        </Box>
      )}
    </FormControl>
  );
}
