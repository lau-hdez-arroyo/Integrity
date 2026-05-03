import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from '@mui/icons-material';

/**
 * PaginationControls Component
 * Advanced pagination with goto page
 */
export default function PaginationControls({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
}) {
  const [gotoPage, setGotoPage] = React.useState(String(currentPage));

  const handleGoto = () => {
    const page = parseInt(gotoPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGotoPage(String(page));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoto();
    }
  };

  React.useEffect(() => {
    setGotoPage(String(currentPage));
  }, [currentPage]);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {/* Info */}
      <Typography variant="body2" sx={{ color: '#64748b' }}>
        Showing {startItem} to {endItem} of {totalItems} items
      </Typography>

      {/* Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconButton
          size="small"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          sx={{ color: '#1e3a8a' }}
        >
          <FirstPageIcon />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          sx={{ color: '#1e3a8a' }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="body2" sx={{ margin: '0 8px', color: '#0f172a', fontWeight: 600 }}>
          {currentPage} / {totalPages}
        </Typography>

        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          sx={{ color: '#1e3a8a' }}
        >
          <ChevronRightIcon />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          sx={{ color: '#1e3a8a' }}
        >
          <LastPageIcon />
        </IconButton>
      </Box>

      {/* Goto Page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Go to:
        </Typography>
        <TextField
          type="number"
          value={gotoPage}
          onChange={(e) => setGotoPage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          inputProps={{ min: 1, max: totalPages }}
          sx={{ width: '60px' }}
        />
        <Button size="small" onClick={handleGoto} sx={{ textTransform: 'none' }}>
          Go
        </Button>
      </Box>
    </Box>
  );
}
