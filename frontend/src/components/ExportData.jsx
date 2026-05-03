import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

/**
 * ExportData Component
 * Export table data to CSV, Excel, or PDF
 */
export default function ExportData({
  data = [],
  filename = 'export',
  columns = [],
  disabled = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Header
      const header = columns.map(col => col.label).join(',');

      // Rows
      const rows = data.map(row =>
        columns.map(col => {
          const value = row[col.id];
          // Escape quotes and wrap in quotes if contains comma
          return String(value).includes(',') ? `"${value}"` : value;
        }).join(',')
      );

      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
    } finally {
      setExporting(false);
      handleClose();
    }
  };

  const exportToJSON = async () => {
    setExporting(true);
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.json`;
      link.click();
    } finally {
      setExporting(false);
      handleClose();
    }
  };

  const exportToTSV = async () => {
    setExporting(true);
    try {
      // Header
      const header = columns.map(col => col.label).join('\t');

      // Rows
      const rows = data.map(row =>
        columns.map(col => row[col.id]).join('\t')
      );

      const tsv = [header, ...rows].join('\n');
      const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.tsv`;
      link.click();
    } finally {
      setExporting(false);
      handleClose();
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
        onClick={handleClick}
        disabled={disabled || data.length === 0 || exporting}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderColor: '#1e3a8a',
          color: '#1e3a8a',
          '&:hover': {
            borderColor: '#0d9488',
            color: '#0d9488',
          },
        }}
      >
        Export
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={exportToCSV}>
          <ListItemIcon sx={{ fontSize: '1.5rem' }}>📄</ListItemIcon>
          <ListItemText>Export to CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportToJSON}>
          <ListItemIcon sx={{ fontSize: '1.5rem' }}>📋</ListItemIcon>
          <ListItemText>Export to JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportToTSV}>
          <ListItemIcon sx={{ fontSize: '1.5rem' }}>📊</ListItemIcon>
          <ListItemText>Export to TSV</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
