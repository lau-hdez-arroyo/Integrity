import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Advanced DataTable Component
 * Features: Sorting, pagination, filtering, responsive
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  searchable = true,
  sortable = true,
  paginated = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  onSelectionChange,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState(columns[0]?.id || '');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (orderBy && sortable) {
      sorted.sort((a, b) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, orderBy, order, sortable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage, paginated]);

  const handleSort = (columnId) => {
    if (orderBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(columnId);
      setOrder('asc');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowSelect = (rowIndex) => {
    const newSelected = selectedRows.includes(rowIndex)
      ? selectedRows.filter(i => i !== rowIndex)
      : [...selectedRows, rowIndex];
    setSelectedRows(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected.map(i => paginatedData[i]));
    }
  };

  return (
    <Box>
      {/* Search Bar */}
      {searchable && (
        <Box sx={{ marginBottom: '16px' }}>
          <TextField
            size="small"
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredData.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <Typography color="textSecondary">No data available</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                  }}
                >
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        fontWeight: 700,
                        color: '#64748b',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {sortable ? (
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : 'asc'}
                          onClick={() => handleSort(column.id)}
                          sx={{
                            '&.Mui-active': {
                              color: '#1e3a8a',
                            },
                            '& .MuiTableSortLabel-icon': {
                              color: '#1e3a8a !important',
                            },
                          }}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    sx={{
                      backgroundColor: selectedRows.includes(rowIndex) ? alpha('#1e3a8a', 0.08) : 'transparent',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s',
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: alpha('#1e3a8a', 0.05),
                      },
                    }}
                  >
                    {columns.map(column => (
                      <TableCell
                        key={`${rowIndex}-${column.id}`}
                        align={column.align || 'left'}
                        sx={{
                          color: '#0f172a',
                          fontSize: '0.875rem',
                        }}
                      >
                        {column.render ? column.render(row[column.id], row) : row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {paginated && (
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: '1px solid #e2e8f0',
                  '& .MuiTablePagination-root': {
                    color: '#64748b',
                  },
                }}
              />
            )}
          </>
        )}
      </TableContainer>

      {/* Results Info */}
      <Box sx={{ marginTop: '12px' }}>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Showing {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} results
        </Typography>
      </Box>
    </Box>
  );
}
